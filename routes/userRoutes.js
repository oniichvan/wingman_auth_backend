const express = require('express');
const {
    sendPushNotification,
    getOAuth,
    registerUserAndGenerateOTP,
    sendOTP, verifyOTP, authenticateUser, updateFirebaseToken, updateDeviceAndToken, getAllUsers, getUserByMobileNumber} = require('../controllers/userController');
const router = express.Router();

// Register a new user
router.post('/register', registerUser);
// Send OTP to registered mobile number
router.post('/send-otp', sendOTP);
// Verify OTP
router.post('/verify-otp', verifyOTP);
// authentication check
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


module.exports = router;