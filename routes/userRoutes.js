const express = require('express');
const {
    deleteAllUsers,
    sendPushNotification,
    sendPushNotificationOnLogin,
    registerUserAndGenerateOTP,
    verifyOTP,
    updateDeviceAndToken,
    getAllUsers,
    getUserByMobileNumber,
    getUserIfVerified,
    setUserAuthenticationToFalse,
} = require('../controllers/userController');

const router = express.Router();

// Register and verify user in one API call
router.post('/register', registerUserAndGenerateOTP);
// Verify OTP
router.post('/verify-otp', verifyOTP);
// send push notification on login
router.post('/onLogin', sendPushNotificationOnLogin);

// Set User isAuthenticated to false
router.post('/set-false', setUserAuthenticationToFalse);

// Update Device ID and Firebase Token
router.post('/update-device-token', updateDeviceAndToken);
// Get all users
router.get('/all-users', getAllUsers);

// Get a user if isVerified is true
router.get('/is-verified/:mobileNumber', getUserIfVerified);

// Get a user by mobile number
router.get('/user/:mobileNumber', getUserByMobileNumber);
// Send Push Notification
router.post('/send-notification', sendPushNotification);
// Delete all users
router.delete('/deleteAll', deleteAllUsers);

module.exports = router;