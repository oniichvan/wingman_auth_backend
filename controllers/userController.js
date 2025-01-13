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

        // Check if OTP has expired
        if (new Date() > user.otpExpiration) {
            return res.status(400).json({ message: 'OTP has expired.' });
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

// @desc Authenticate user based on user input
// @route POST /api/auth/authenticate
// @access Public
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

// @desc Update Firebase Token
// @route POST /api/auth/update-token
// @access Public
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


module.exports = {
    registerUser,
    sendOTP,
    verifyOTP,
    authenticateUser,
    updateFirebaseToken
};
