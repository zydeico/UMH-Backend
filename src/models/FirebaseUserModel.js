const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    phoneNumber: String,
    birthDay: String,
    will: String,
    insurancePolicy: String,
    pushTokenAPN: String,
    platform: String,
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
    registrationDateAndTime: {
        type: Date,
        default: Date.now
    },
    generatedByApi: {
        type: Boolean,
        default: true
    }
});

const FirebaseUserModel = mongoose.model('FirebaseUser', userSchema);

module.exports = FirebaseUserModel;
