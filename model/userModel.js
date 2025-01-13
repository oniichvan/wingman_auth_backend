const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    mobileNumber: { 
        type: String, 
        required: true 
    },
    countryCode: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        validate: {
            validator: function(v) {
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        },
        required: false
    },
    deviceId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    firebaseToken: { 
        type: String, 
        required: true 
    },
    timestamp: { 
        type: Date, 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);