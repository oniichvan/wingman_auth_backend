const express = require('express');
const { registerUser, sendOTP, verifyOTP, authenticateUser, updateFirebaseToken, updateDeviceAndToken } = require('../controllers/userController');
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

module.exports = router;