const mongoose = require('mongoose');

const signUpUserSchema = new mongoose.Schema({
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
    socialSecurityNumber: {
        type: String,
        required: false
    },
    state: {
        type: String,
        required: false
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
        required: false
    },
    pushTokenAPN: {
        type: String,
        required: false
    },
    birthDay: {
        type: String,
        required: false
    },
    photoURL: {
        type: String,
        required: false
    }
}, { 
    strict: true 
});

const SignUpUserModel = mongoose.model('SignUpUserModel', signUpUserSchema);

module.exports = SignUpUserModel;
