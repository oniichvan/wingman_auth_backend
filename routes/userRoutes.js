const express = require('express');
const {
    sendPushNotification,
    sendPushNotificationOnLogin,
    getOAuth,
    registerUserAndGenerateOTP,
    sendOTP,
    verifyOTP,
    authenticateUser,
    updateFirebaseToken,
    updateDeviceAndToken,
    getAllUsers,
    getUserByMobileNumber,
    websiteAuthentication, // Add the new function here
} = require('../controllers/userController');

const router = express.Router();

// Register and verify user in one API call
router.post('/register', registerUserAndGenerateOTP);
// Verify OTP
router.post('/verify-otp', verifyOTP);
// send push notification on login
router.post('/onLogin', sendPushNotificationOnLogin);


// Send OTP to registered mobile number
router.post('/send-otp', sendOTP);
// Authentication check
router.post('/authenticate', authenticateUser);
// Update Firebase Token
router.post('/update-token', updateFirebaseToken);
// Update Device ID and Firebase Token
router.post('/update-device-token', updateDeviceAndToken);
// Get all users
router.get('/all-users', getAllUsers);
// Get a user by mobile number
router.get('/user/:mobileNumber', getUserByMobileNumber);
// Route to fetch FCM Token
router.get('/getOAuth', getOAuth);
// Send Push Notification
router.post('/send-notification', sendPushNotification);
// Website Authentication API
router.post('/website-authentication', websiteAuthentication); // Add the new route here

module.exports = router;