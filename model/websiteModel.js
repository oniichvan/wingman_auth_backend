const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({
    websiteId: {
        type: String,
        required: true,
    },
    mobileNumber: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                // Check if the mobile number is exactly 10 digits and contains only numbers
                return /^\d{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid mobile number!`
        }
    },
    deviceId: {
        type: String,
    },
    isAuthenticate: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Website', websiteSchema);