const mongoose = require('mongoose');

const SignUpEmailSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    uid: {
        type: String,
        required: true
    }
});

const SignUpEmailModel = mongoose.model('SignUpEmail', SignUpEmailSchema);

module.exports = SignUpEmailModel;
