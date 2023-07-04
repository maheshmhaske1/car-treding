const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Expiry time in seconds (10 minutes)
  }
});

const OtpModel = mongoose.model('otps', OtpSchema);
module.exports = OtpModel;
