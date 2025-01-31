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
    authenticateUserAction,
} = require('../controllers/userController');

const router = express.Router();

// Register and verify user in one API call
router.post('/register', registerUserAndGenerateOTP);
// Verify OTP
router.post('/verify-otp', verifyOTP);
// send push notification on login
router.post('/onLogin', sendPushNotificationOnLogin);
// Authenticate user
router.post('/authenticateUser', authenticateUserAction);


// Update Device ID and Firebase Token
router.post('/update-device-token', updateDeviceAndToken);
// Get all users
router.get('/all-users', getAllUsers);
// Get a user by mobile number
router.get('/user/:mobileNumber', getUserByMobileNumber);
// Send Push Notification
router.post('/send-notification', sendPushNotification);
// Delete all users
router.delete('/deleteAll', deleteAllUsers);

module.exports = router;