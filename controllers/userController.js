const admin = require('../config/firebaseConfig');
const User = require('../model/userModel');
const { getAccessToken } = require('../config/fcmTokenUtil');

const registerUserAndGenerateOTP = async (req, res) => {
    const { mobileNumber, email, deviceId, deviceName, firebaseToken, websiteId, websiteName } = req.body;

    // Validate required fields
    if (!mobileNumber || !deviceId || !firebaseToken || !deviceName) {
        return res.json({ success: false, message: 'All fields are required.' });
    }

    try {
        // Generate static OTP for testing
        const generatedOTP = '9999'; // Replace with dynamic OTP in production

        // Check if user exists with the same mobileNumber AND deviceId
        const existingUser = await User.findOne({ mobileNumber, deviceId });

        if (existingUser) {
            // Update existing user's OTP and other fields
            existingUser.email = email;
            existingUser.deviceName = deviceName;
            existingUser.firebaseToken = firebaseToken;
            existingUser.websiteId = websiteId;
            existingUser.websiteName = websiteName;
            existingUser.otp = generatedOTP;
            existingUser.timestamp = new Date();
            await existingUser.save();

            return res.json({ 
                success: true, 
                message: 'OTP regenerated for existing user.', 
                otp: generatedOTP 
            });
        } else {
            // Create new user
            const user = new User({
                mobileNumber,
                email,
                deviceId,
                deviceName,
                firebaseToken,
                websiteId,
                websiteName,
                otp: generatedOTP,
                isVerified: false,
                timestamp: new Date()
            });

            await user.save();

            return res.json({ 
                success: true, 
                message: 'User registered and OTP generated.', 
                otp: generatedOTP 
            });
        }
    } catch (error) {
        console.error(error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.json({ success: false, message: error.message });
        }

        // Handle duplicate key error (e.g., deviceId already exists)
        if (error.code === 11000) {
            return res.json({ success: false, message: 'Device ID is already in use.' });
        }

        return res.json({ success: false, message: 'Server error. Please try again.' });
    }
};

const verifyOTP = async (req, res) => {
    const { mobileNumber, otp } = req.body;

    if (!mobileNumber || !otp) {
        return res.status(400).json({ message: 'Mobile number and OTP are required.' });
    }

    try {
        // Find user by mobile number
        const user = await User.findOne({ mobileNumber });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if OTP matches
        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP.' });
        }

        // Update user verification status and firebase token
        user.isVerified = true;
        // user.otp = null; // Clear OTP after verification
        await user.save();
        
        res.status(200).json({ message: 'OTP verified successfully.', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const sendPushNotificationOnLogin = async (req, res) => {
    try {
        const { mobileNumber, websiteId, websiteName, notificationSent, notificationExpires } = req.body;

        // Validate required fields
        if (![mobileNumber, websiteId, websiteName, notificationSent, notificationExpires].every(Boolean)) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields (mobileNumber, websiteId, websiteName, notificationSent, notificationExpires) are required.' 
            });
        }

        // Find user by mobile number
        const user = await User.findOne({ mobileNumber });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (!user.firebaseToken) {
            return res.status(400).json({ success: false, message: 'No FCM token found for this user.' });
        }

        // Prepare and send push notification
        const notificationPayload = {
            notification: {
                title: 'Login Attempt',
                body: `Are you trying to login to ${websiteName}?`,
            },
            data: { websiteId, websiteName, notificationSent, notificationExpires },
            token: user.firebaseToken,
        };

        const fcmResponse = await admin.messaging().send(notificationPayload);

        res.status(200).json({ 
            success: true, 
            message: 'Push notification sent successfully.', 
            fcmResponse 
        });
    } catch (error) {
        console.error('Error sending push notification:', error);

        const errorMessage = error.code === 'messaging/invalid-registration-token' || 
                             error.code === 'messaging/registration-token-not-registered'
            ? 'Invalid or unregistered Firebase token.'
            : 'Server error. Please try again later.';

        res.status(error.code ? 400 : 500).json({ success: false, message: errorMessage, error: error.message });
    }
};


const sendOTP = async (req, res) => {
    const { mobileNumber, countryCode } = req.body;

    if (!mobileNumber || !countryCode) {
        return res.status(400).json({ message: 'Mobile number and country code are required.' });
    }

    try {
        // Find user by mobileNumber and countryCode
        const user = await User.findOne({ mobileNumber, countryCode });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Static OTP for testing purposes
        const otp = '9999';

        // Set OTP expiration time (30 seconds)
        const otpExpiration = new Date();
        otpExpiration.setSeconds(otpExpiration.getSeconds() + 30);

        // Update OTP, expiration time, and set isVerified to false
        user.otp = otp;
        user.otpExpiration = otpExpiration;
        user.isVerified = false;
        await user.save();

        // Log the countdown for the remaining time in seconds
        const countdownInterval = setInterval(() => {
            const timeRemaining = Math.floor((otpExpiration - new Date()) / 1000); // Get remaining seconds
            console.log(`Remaining time for OTP: ${timeRemaining} seconds`);

            if (timeRemaining <= 0) {
                clearInterval(countdownInterval);
                console.log("OTP has expired.");
            }
        }, 1000); // Update every second

        res.status(200).json({ message: 'OTP sent successfully.', otp }); // For testing purpose, return the OTP
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const authenticateUser = async (req, res) => {
    const { mobileNumber, deviceId, isAuthenticated } = req.body;

    // Validate required fields
    if (!mobileNumber || !deviceId || typeof isAuthenticated !== 'boolean') {
        return res.status(400).json({ message: 'Mobile number, device ID, and authentication status (true/false) are required.' });
    }

    try {
        // Find user by mobile number and device ID
        const user = await User.findOne({ mobileNumber, deviceId });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Store the authentication status based on the payload
        user.isAuthenticate = isAuthenticated;
        await user.save();

        // Send a message based on authentication status
        const message = isAuthenticated
            ? 'Logged in successfully.'
            : 'Authentication failed. Please try again.';

        res.status(200).json({ message, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const updateFirebaseToken = async (req, res) => {
    const { deviceId, oldFirebaseToken, newFirebaseToken } = req.body;

    // Validate required fields
    if (!deviceId || !oldFirebaseToken || !newFirebaseToken) {
        return res.status(400).json({ message: 'Device ID, old Firebase token, and new Firebase token are required.' });
    }

    try {
        // Find user by device ID
        const user = await User.findOne({ deviceId });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if the old Firebase token matches
        if (user.firebaseToken !== oldFirebaseToken) {
            return res.status(400).json({ message: 'Old Firebase token does not match.' });
        }

        // Update the user's Firebase token
        user.firebaseToken = newFirebaseToken;
        await user.save();

        res.status(200).json({ message: 'Firebase token updated successfully.', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const updateDeviceAndToken = async (req, res) => {
    const { mobileNumber, newDeviceId, newFirebaseToken } = req.body;

    // Validate required fields
    if (!mobileNumber || !newDeviceId || !newFirebaseToken) {
        return res.status(400).json({ message: 'Mobile number, new device ID, and new Firebase token are required.' });
    }

    try {
        // Find user by mobile number
        const user = await User.findOne({ mobileNumber });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Update deviceId and firebaseToken
        user.deviceId = newDeviceId;
        user.firebaseToken = newFirebaseToken;
        await user.save();

        res.status(200).json({ message: 'Device ID and Firebase token updated successfully.', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const getUserByMobileNumber = async (req, res) => {
    const { mobileNumber } = req.params;

    try {
        const user = await User.findOne({ mobileNumber });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const getOAuth = async (req, res) => {
    try {
        const accessToken = await getAccessToken();
        res.status(200).json({ accessToken });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch FCM access token",
            error: error.message,
        });
    }
};

const sendPushNotification = async (req, res) => {
    const { firebaseToken, title, body } = req.body;

    if (!firebaseToken || !title || !body) {
        return res.status(400).json({ message: 'Firebase Token, title, and body are required.' });
    }

    const message = {
        notification: {
            title,
            body,
        },
        token: firebaseToken,
    };

    try {
        const response = await admin.messaging().send(message);
        res.status(200).json({ message: 'Notification sent successfully', response });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ message: 'Failed to send notification', error });
    }
};

const websiteAuthentication = async (req, res) => {
    const { mobileNumber, website, action } = req.body;

    // Validate required fields
    if (!mobileNumber || !website || !action) {
        return res.status(400).json({ message: 'Mobile number, website, and action are required.' });
    }

    try {
        // Find the user by mobile number
        const user = await User.findOne({ mobileNumber });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if the user has a valid Firebase token
        if (!user.firebaseToken) {
            return res.status(400).json({ message: 'User does not have a valid Firebase token.' });
        }

        // Prepare the push notification message
        const deviceName = 'Unknown Device'; // You can fetch this from the request or user's device info
        const notificationTitle = 'Login Attempt';
        const notificationBody = `Are you trying to log in to ${website} from ${deviceName}?`;

        const message = {
            notification: {
                title: notificationTitle,
                body: notificationBody,
            },
            token: user.firebaseToken,
            data: {
                website,
                action: 'pending', // Indicates that the user needs to take action
            },
        };

        // Send the push notification
        const response = await admin.messaging().send(message);

        // Handle the user's action (accept/deny)
        if (action === 'accept') {
            // Update the user's authentication status (e.g., mark as authenticated)
            user.isAuthenticate = true;
            await user.save();

            res.status(200).json({ message: 'Login attempt accepted.', response });
        } else if (action === 'deny') {
            // Mark the login attempt as denied
            res.status(200).json({ message: 'Login attempt denied.', response });
        } else {
            return res.status(400).json({ message: 'Invalid action. Use "accept" or "deny".' });
        }
    } catch (error) {
        console.error('Error in website authentication:', error);
        res.status(500).json({ message: 'Failed to process website authentication.', error });
    }
};

const deleteAllUsers = async (req, res) => {
    try {
        // Delete all users from the database
        const result = await User.deleteMany({});

        // Check if any users were deleted
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No users found to delete.' });
        }

        // Return success response
        res.status(200).json({ message: 'All users deleted successfully.', deletedCount: result.deletedCount });
    } catch (error) {
        console.error('Error deleting users:', error);
        res.status(500).json({ message: 'Server error. Failed to delete users.', error });
    }
};

module.exports = {
    registerUserAndGenerateOTP,
    verifyOTP,
    sendPushNotificationOnLogin,
    sendOTP,
    authenticateUser,
    updateFirebaseToken,
    updateDeviceAndToken,
    getAllUsers,
    getUserByMobileNumber,
    getOAuth,
    sendPushNotification,
    websiteAuthentication,
    deleteAllUsers,
};
