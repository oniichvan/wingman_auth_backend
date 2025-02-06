const Website = require('../model/websiteModel');
const User = require('../model/userModel');

const authenticateWebsite = async (req, res) => {
    const { mobileNumber, action, websiteId } = req.body;

    try {
        // Check if the mobile number exists in the User model
        const user = await User.findOne({ mobileNumber });

        if (!user) {
            return res.status(404).json({ message: 'User with the provided mobile number does not exist.' });
        }

        // Get the deviceId linked with the mobileNumber from the User model
        const deviceId = user.deviceId; // Assuming deviceId is stored in the User model

        if (!deviceId) {
            return res.status(400).json({ message: 'Device ID is not associated with the user.' });
        }

        // Check if the website entry already exists
        let website = await Website.findOne({ mobileNumber, websiteId });

        if (website) {
            // If action is true, update the website details
            if (action) {
                website.isAuthenticate = true; // Set isAuthenticate to true
                website.timestamp = new Date(); // Update the timestamp
                website.deviceId = deviceId; // Update the deviceId (if needed)

                await website.save();

                // Remove the '_id' and '__v' fields from the response
                const websiteResponse = website.toObject();
                delete websiteResponse._id;
                delete websiteResponse.__v;

                return res.status(200).json({ message: 'Website details updated successfully.', data: websiteResponse });
            } else {
                // If action is false, do not save and return a message
                return res.status(200).json({ message: 'Action is false. No details were updated.' });
            }
        } else {
            // If website does not exist, save the new details
            if (action) {
                const websiteData = {
                    websiteId,
                    mobileNumber,
                    deviceId,
                    isAuthenticate: true, // Set isAuthenticate to true
                    timestamp: new Date(), // Save the timestamp
                };

                const newWebsite = new Website(websiteData);
                await newWebsite.save();

                // Remove the '_id' and '__v' fields from the response
                const websiteResponse = newWebsite.toObject();
                delete websiteResponse._id;
                delete websiteResponse.__v;

                return res.status(201).json({ message: 'Website details saved successfully.', data: websiteResponse });
            } else {
                // If action is false, do not save and return a message
                return res.status(200).json({ message: 'Action is false. No details were saved.' });
            }
        }
    } catch (error) {
        console.error('Error in authenticateWebsite:', error);
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};

module.exports = { authenticateWebsite };
