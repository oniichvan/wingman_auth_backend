const express = require('express');
const { registerUser, sendOTP, verifyOTP, authenticateUser } = require('../controllers/userController');
const router = express.Router();

// Register a new user
router.post('/register', registerUser);
// Send OTP to registered mobile number
router.post('/send-otp', sendOTP);
// Verify OTP
router.post('/verify-otp', verifyOTP);
// authentication check
router.post('/authenticate', authenticateUser);

module.exports = router;
