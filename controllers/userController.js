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

module.exports = {
    registerUser
};
