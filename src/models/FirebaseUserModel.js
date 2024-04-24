const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    phoneNumber: String,
    email: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: false
    },
    pin: {
        type: String,
        required: false
    },
    pushTokenAPN: String,
    platform: String,
    registrationDateAndTime: {
        type: Date,
        default: Date.now
    },
    generatedByApi: {
        type: Boolean,
        default: true
    },
    birthDay: Date,
    will: String,
    insurancePolicy: String
});

const FirebaseUserModel = mongoose.model('FirebaseUser', userSchema);

module.exports = FirebaseUserModel;
