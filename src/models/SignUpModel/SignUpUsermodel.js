const mongoose = require('mongoose');

const signUpUserSchema = new mongoose.Schema(
    {
        uid: {
            type: String,
            required: true,
            unique: true
        },
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
        },
        pin: {
            type: String,
            required: false
        },
        generatedByApi: {
            type: Boolean,
            required: false
        }, 
        registrationDate: {
            type: Date,
            required: false
        }
    },
    {
        strict: 'throw',
        minimize: false
    }
);

const SignUpUserModel = mongoose.model('SignUpUserModel', signUpUserSchema);

module.exports = SignUpUserModel;
