const User = require('../model/userModel');

// @desc Register a new user
// @route POST /api/users/register
// @access Public
const registerUser = async (req, res) => {
    const { mobileNumber, countryCode, email, deviceId, firebaseToken, timestamp } = req.body;

    // Validate required fields
    if (!mobileNumber || !countryCode || !deviceId || !firebaseToken || !timestamp) {
        return res.status(400).json({ message: 'All fields except email are required.' });
    }

    try {
        // Check if the deviceId already exists
        const existingUser = await User.findOne({ deviceId });
        if (existingUser) {
            return res.status(400).json({ message: 'Device ID already registered.' });
        }

        // Create new user
        const user = new User({
            mobileNumber,
            countryCode,
            email,
            deviceId,
            firebaseToken,
            timestamp: new Date(timestamp)
        });

        await user.save(); // save the response in database
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// @desc Send OTP to registered mobile number
// @route POST /api/users/send-otp
// @access Public
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

        // Update OTP and set isVerified to false
        user.otp = otp;
        user.isVerified = false;
        await user.save();

        res.status(200).json({ message: 'OTP sent successfully.', otp }); // For testing purpose, return the OTP
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// @desc Verify OTP
// @route POST /api/users/verify-otp
// @access Public
const verifyOTP = async (req, res) => {
    const { mobileNumber, otp, firebaseToken } = req.body;

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
        user.firebaseToken = firebaseToken || user.firebaseToken; // Optional, only if provided
        user.otp = null; // Clear OTP after verification
        await user.save();

        res.status(200).json({ message: 'OTP verified successfully.', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};


module.exports = {
    registerUser,
    sendOTP,
    verifyOTP
};
