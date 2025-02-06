const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
    email: {
        type: String,
        validate: {
            validator: function (v) {
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        },
        required: false
    },
    deviceName: {
        type: String,
        required: true,
    },
    deviceId: {
        type: String,
    },
    firebaseToken: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    },
    otp: {
        type: Number
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    websiteId: { // Add websiteId field
        type: String,
        required: true,
    },
    websiteName: { // Add websiteName field
        type: String,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);