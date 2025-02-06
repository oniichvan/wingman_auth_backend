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
        
        // Prepare and send push notification
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
    updateDeviceAndToken,
    getAllUsers,
    getUserByMobileNumber,
    sendPushNotification,
    deleteAllUsers,
};
