const Website = require('../model/websiteModel');
const User = require('../model/userModel');
const ResponseObj = require('../utils/responseUtil');

const authenticateWebsite = async (req, res) => {
    const { mobileNumber, action = false, websiteId } = req.body; // Default action to false

    try {
        const user = await User.findOne({ mobileNumber, isVerified: true, isActive: true });

        if (!user) {
            return res.status(404).json(ResponseObj.failure('User with the provided mobile number does not exist.'));
        }

        const deviceId = user.deviceId;

        if (!deviceId) {
            return res.status(400).json(ResponseObj.failure('Device ID is not associated with the user.'));
        }

        // Check if the action is valid
        if (action !== true && action !== false) {
            return res.status(400).json(ResponseObj.failure('Invalid action. Action must be either true or false.'));
        }

        // Update the isAuthenticate field in the User model
        user.isAuthenticated = action;
        await user.save();

        // Find an existing entry by deviceId (regardless of websiteId)
        let website = await Website.findOne({ deviceId });

        if (website) {
            // ✅ Update the existing entry
            website.websiteId = websiteId;
            website.mobileNumber = mobileNumber;
            website.isAuthenticate = action;
            website.timestamp = new Date();
            await website.save();

            const websiteResponse = website.toObject();
            delete websiteResponse._id;
            delete websiteResponse.__v;

            return res.status(200).json(ResponseObj.success('Website details updated successfully.', websiteResponse));
        } else {
            // ✅ Create a new entry if no record exists for the deviceId
            const websiteData = { 
                websiteId, 
                mobileNumber, 
                deviceId, 
                isAuthenticate: action, 
                timestamp: new Date() 
            };
            const newWebsite = new Website(websiteData);
            await newWebsite.save();

            const websiteResponse = newWebsite.toObject();
            delete websiteResponse._id;
            delete websiteResponse.__v;

            return res.status(201).json(ResponseObj.success('Website details saved successfully.', websiteResponse));
        }
    } catch (error) {
        console.error('Error in authenticateWebsite:', error);
        return res.status(500).json(ResponseObj.failure('Internal server error.', error.message));
    }
};

module.exports = { authenticateWebsite };