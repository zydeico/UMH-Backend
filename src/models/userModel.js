const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    pin: {
        type: Number,
        required: true
    },
    pushTokenAPN: {
        type: String,
        required: true,
        unique: true
    },
    platform: {
        type: String,
        required: true
    },
    registrationDateAndTime: {
        type: Date,
        default: Date.now,
        required: false
    }
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
