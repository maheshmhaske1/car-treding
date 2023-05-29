const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    full_name: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    photo: {
        type: String
    },
    mobile: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        default: ''
    },
    company_name: {
        type: String,
        default: ''
    },
    company_address: {
        type: String,
        default: ''
    },
    DOB: {
        type: Date,
    },
    token: {
        type: String
    },

})


var userModel = mongoose.model('users', userSchema);
module.exports = userModel;