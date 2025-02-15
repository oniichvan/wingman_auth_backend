const Website = require('../model/websiteModel');
const User = require('../model/userModel');
const ResponseObj = require('../utils/responseUtil'); // Import ResponseObj

const authenticateWebsite = async (req, res) => {
    const { mobileNumber, action, websiteId } = req.body;

    try {
        const user = await User.findOne({ mobileNumber });

        if (!user) {
            return res.status(404).json(ResponseObj.failure('User with the provided mobile number does not exist.'));
        }

        const deviceId = user.deviceId; 

        if (!deviceId) {
            return res.status(400).json(ResponseObj.failure('Device ID is not associated with the user.'));
        }

        let website = await Website.findOne({ mobileNumber, websiteId });

        if (website) {
            if (action) {
                website.isAuthenticate = true;
                website.timestamp = new Date();
                website.deviceId = deviceId;
                await website.save();

                const websiteResponse = website.toObject();
                delete websiteResponse._id;
                delete websiteResponse.__v;

                return res.status(200).json(ResponseObj.success('Website details updated successfully.', websiteResponse));
            } else {
                return res.status(200).json(ResponseObj.success('Action is false. No details were updated.'));
            }
        } else {
            if (action) {
                const websiteData = { websiteId, mobileNumber, deviceId, isAuthenticate: true, timestamp: new Date() };
                const newWebsite = new Website(websiteData);
                await newWebsite.save();

                const websiteResponse = newWebsite.toObject();
                delete websiteResponse._id;
                delete websiteResponse.__v;

                return res.status(201).json(ResponseObj.success('Website details saved successfully.', websiteResponse));
            } else {
                return res.status(200).json(ResponseObj.success('Action is false. No details were saved.'));
            }
        }
    } catch (error) {
        console.error('Error in authenticateWebsite:', error);
        return res.status(500).json(ResponseObj.failure('Internal server error.', error.message));
    }
};

module.exports = { authenticateWebsite };
