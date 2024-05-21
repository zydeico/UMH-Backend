const mongoose = require('mongoose');

const signUpUserModel = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true,
        unique: false
    },
    phone: {
        type: String,
        required: true
    },
    securitySocialNumber: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    platform: {
        type: String,
        required: true
    },
    isBiometricActive: {
        type: Boolean,
        required: true
    }
});

const SignUpUserModel = mongoose.model('SignUpUserModel', signUpUserModel);

module.exports = SignUpUserModel;
