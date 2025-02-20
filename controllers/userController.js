const admin = require('../config/firebaseConfig');
const User = require('../model/userModel');
const ResponseObj = require('../utils/responseUtil');
const Website = require('../model/websiteModel')

const registerUserAndGenerateOTP = async (req, res) => {
    const { mobileNumber, email, deviceId, deviceName, firebaseToken, websiteId, websiteName } = req.body;

    // TODO: Handle each case seperately
    // if (!mobileNumber || !deviceId || !firebaseToken || !deviceName) {
    //     return res.status(400).json(ResponseObj.failure('All fields are required.'));
    // }

    if (!mobileNumber) {
        return res.status(400).json(ResponseObj.failure('Mobile number is required.'));
    }

    if (!deviceId) {
        return res.status(400).json(ResponseObj.failure('Device ID is required.'));
    }

    if (!firebaseToken) {
        return res.status(400).json(ResponseObj.failure('Firebase token is required.'));
    }

    if (!deviceName) {
        return res.status(400).json(ResponseObj.failure('Device name is required.'));
    }

    try {
        const generatedOTP = '9999'; // Static OTP for testing

        let existingUser = await User.findOne({ mobileNumber, deviceId });

        if (existingUser) {
            existingUser.email = email;
            existingUser.deviceName = deviceName;
            existingUser.firebaseToken = firebaseToken;
            existingUser.websiteId = websiteId;
            existingUser.websiteName = websiteName;
            existingUser.otp = generatedOTP;
            existingUser.timestamp = new Date();
            existingUser.isActive = false;
            await existingUser.save();

            return res.status(200).json(ResponseObj.success('OTP regenerated for existing user.', { otp: generatedOTP }));
        } else {
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
                timestamp: new Date(),
                isActive: false
            });

            await user.save();

            return res.status(200).json(ResponseObj.success('User registered and OTP generated.', { otp: generatedOTP }));
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json(ResponseObj.failure('Internal server error', error.message));
    }
};

const verifyOTP = async (req, res) => {
    const { mobileNumber, otp } = req.body;

    // TODO: Add mob in the response data only
    if (!mobileNumber || !otp) {
        return res.status(400).json(ResponseObj.failure('Mobile number and OTP are required.'));
    }

    try {
        const user = await User.findOne({ mobileNumber }).sort({ timestamp: -1 });

        if (!user) {
            return res.status(404).json(ResponseObj.failure('User not found.'));
        }

        if (user.otp !== otp) {
            return res.status(400).json(ResponseObj.failure('Invalid OTP.'));
        }

        const deviceId = user.deviceId;

        await User.updateMany({ mobileNumber }, { $set: { isActive: false } });

        user.isVerified = true;
        user.isActive = true;
        await user.save();

        return res.status(200).json(ResponseObj.success('OTP verified successfully.', { mobileNumber }));
    } catch (error) {
        console.error(error);
        return res.status(500).json(ResponseObj.failure('Server error', error.message));
    }
};

const sendPushNotificationOnLogin = async (req, res) => {
    try {
        const { mobileNumber, websiteId, websiteName } = req.body;

        const requiredFields = { mobileNumber, websiteId, websiteName };
        for (const [key, value] of Object.entries(requiredFields)) {
            if (!value) {
                return res.status(400).json(ResponseObj.failure(`Enter the ${key.replace(/([A-Z])/g, ' $1').trim()}`));
            }
        }

        // Find user in the database
        const user = await User.findOne({ mobileNumber, isVerified: true, isActive: true });

        if (!user) {
            return res.status(404).json(ResponseObj.failure('No active and verified user found.'));
        }

        // Check if user exists in the Website model
        const websiteEntry = await Website.findOne({ mobileNumber, websiteId });

        // If the user is already authenticated, return success
        if (websiteEntry && websiteEntry.isAuthenticate) {
            return res.status(200).json(ResponseObj.success('User is already authenticated.', null));
        }

        // If user is not authenticated, send push notification
        if (!user.firebaseToken) {
            return res.status(400).json(ResponseObj.failure('No FCM token provided for this user.'));
        }

        const notificationSent = new Date();
        const notificationExpires = new Date(notificationSent.getTime() + 60000); // 60 seconds later

        const notificationPayload = {
            notification: {
                title: 'Login Attempt',
                body: `A login attempt was made for ${websiteName}.`,
            },
            data: {
                websiteId,
                websiteName,
                notificationSent: notificationSent.toISOString(),
                notificationExpires: notificationExpires.toISOString(),
            },
            token: user.firebaseToken,
        };

        const fcmResponse = await admin.messaging().send(notificationPayload);

        return res.status(200).json(ResponseObj.success('User not authenticated. Push notification sent.', {
            fcmResponse,
            websiteId,
            websiteName,
            notificationSent: notificationSent.toISOString(),
            notificationExpires: notificationExpires.toISOString(),
            expiresInSeconds: 60
        }));
    } catch (error) {
        console.error('Error:', error.message);

        const errorMessage = error.code === 'messaging/invalid-registration-token' ||
            error.code === 'messaging/registration-token-not-registered'
            ? 'Invalid or unregistered Firebase token.'
            : 'Server error. Please try again later.';

        res.status(error.code ? 400 : 500).json(ResponseObj.failure(errorMessage, error.message));
    }
};


const updateDeviceAndToken = async (req, res) => {
    const { mobileNumber, newDeviceId, newFirebaseToken } = req.body;

    const requiredFields = { mobileNumber, newDeviceId, newFirebaseToken };
    for (const [key, value] of Object.entries(requiredFields)) {
        if (!value) {
            return res.status(400).json(ResponseObj.failure(`Enter the ${key.replace(/([A-Z])/g, ' $1').trim()}`))
        }
    }

    try {
        const user = await User.findOne({ mobileNumber });

        if (!user) {
            return res.status(404).json(ResponseObj.failure('User not found.'));
        }

        user.deviceId = newDeviceId;
        user.firebaseToken = newFirebaseToken;
        await user.save();

        res.status(200).json(ResponseObj.success('Device ID and Firebase token updated successfully.', { user }));
    } catch (error) {
        console.error(error);
        res.status(500).json(ResponseObj.failure('Server error', error));
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(ResponseObj.success('Users retrieved successfully.', { users }));
    } catch (error) {
        console.error(error);
        res.status(500).json(ResponseObj.failure('Server error', error));
    }
};

const getUserByMobileNumber = async (req, res) => {
    const { mobileNumber } = req.params;

    try {
        const user = await User.findOne({ mobileNumber, isVerified: true, isActive: true  });

        if (!user) {
            return res.status(404).json(ResponseObj.failure('User not found.'));
        }

        res.status(200).json(ResponseObj.success('User retrieved successfully.', { user }));
    } catch (error) {
        console.error(error);
        res.status(500).json(ResponseObj.failure('Server error', error));
    }
};

const sendPushNotification = async (req, res) => {
    const { firebaseToken, title, body } = req.body;

    if (!firebaseToken || !title || !body) {
        return res.status(400).json(ResponseObj.failure('Firebase Token, title, and body are required.'));
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
        res.status(200).json(ResponseObj.success('Notification sent successfully', { response }));
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json(ResponseObj.failure('Failed to send notification', error));
    }
};

const deleteAllUsers = async (req, res) => {
    try {
        const result = await User.deleteMany({});

        if (result.deletedCount === 0) {
            return res.status(404).json(ResponseObj.failure('No users found to delete.'));
        }

        res.status(200).json(ResponseObj.success('All users deleted successfully.', { deletedCount: result.deletedCount }));
    } catch (error) {
        console.error('Error deleting users:', error);
        res.status(500).json(ResponseObj.failure('Server error. Failed to delete users.', error));
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