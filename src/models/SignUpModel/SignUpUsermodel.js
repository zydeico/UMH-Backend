const mongoose = require('mongoose');

const signUpUserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
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
    },
    pushTokenAPN: {
        type: String,
        required: false
    },
    birthDay: {
        type: String,
        required: true
    }
}, { 
    strict: true 
});

const SignUpUserModel = mongoose.model('SignUpUserModel', signUpUserSchema);

module.exports = SignUpUserModel;
