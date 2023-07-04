const { default: mongoose } = require('mongoose');
const auctionModel = require('../model/auction.model');
const userModel = require('../model/user.model');
const watchListsModel = require('../model/watchlist.model');
const OtpModel = require('../model/otp.model');

const twilio = require('twilio');

const accountSid = 'AC72fc445885973171de671fdcf71deaeb';
const authToken = 'df36864272f6d1dfdb3d0655d489cd00';
const client = twilio(accountSid, authToken);

exports.add = async (req, res) => {
    const { userId, auctionId } = req.body

    const auctionDetails = await auctionModel.findOne({
        _id: mongoose.Types.ObjectId(auctionId),
    });
    const userDetails = await userModel.findOne({
        _id: mongoose.Types.ObjectId(userId),
    });

    if (!auctionDetails) {
        return res.json({
            status: false,
            message: "invalid auction id",
        });
    }

    if (!userDetails) {
        return res.json({
            status: false,
            message: "invalid user id",
        });
    }

    await new watchListsModel({
        userId: userId,
        auctionId: auctionId
    })
        .save()
        .then(success => {
            return res.json({
                status: true,
                message: "added in watchlist"
            })
        })
        .catch(error => {
            return res.json({
                status: false,
                message: error,
            });
        })
}

exports.getWatchlist = async (req, res) => {
    const { userId } = req.params

    const userDetails = await userModel.findOne({
        _id: mongoose.Types.ObjectId(userId),
    });

    if (!userDetails) {
        return res.json({
            status: false,
            message: "invalid user id",
        });
    }
    const watchList = await watchListsModel.find({ userId: mongoose.Types.ObjectId(userId) })
    console.log(watchList)

    await watchListsModel.aggregate([
        {
            $match: { userId: mongoose.Types.ObjectId(userId) }
        },
        {
            $lookup: {
                from: "auctions",
                foreignField: "_id",
                localField: "auctionId",
                as: "auctions"
            }
        }
    ])
        .then(success => {
            return res.json({
                status: true,
                message: "watchlist",
                data: success
            })
        })
        .catch(error => {
            return res.json({
                status: false,
                message: error,
            });
        })
}

exports.removeWatchlist = async (req, res) => {
    const { userId, auctionId } = req.body

    const auctionDetails = await auctionModel.findOne({
        _id: mongoose.Types.ObjectId(auctionId),
    });
    const userDetails = await userModel.findOne({
        _id: mongoose.Types.ObjectId(userId),
    });

    if (!auctionDetails) {
        return res.json({
            status: false,
            message: "invalid auction id",
        });
    }

    if (!userDetails) {
        return res.json({
            status: false,
            message: "invalid user id",
        });
    }


    await watchListsModel.findOneAndDelete({
        userId: mongoose.Types.ObjectId(userId),
        auctionId: mongoose.Types.ObjectId(auctionId),
    })
        .then(success => {
            return res.json({
                status: true,
                message: "deleted"
            })
        })
        .catch(error => {
            return res.json({
                status: false,
                message: error,
            });
        })
}


exports.sendOTP = async (req, res) => {
    const { phoneNumber } = req.body;

    try {
        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000);

        // Create a new OTP document in the database
        const newOtp = new OtpModel({
            phoneNumber,
            otp
        });
        await newOtp.save();

        // Send OTP via SMS using Twilio
        await client.messages.create({
            body: `Your OTP: ${otp}`,
            from: 'YOUR_TWILIO_PHONE_NUMBER',
            to: phoneNumber
        });

        return res.json({
            status: true,
            message: 'OTP sent successfully'
        });
    } catch (error) {
        return res.json({
            status: false,
            message: error
        });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    const { phoneNumber, otp } = req.body;

    try {
        // Find the OTP document for the provided phone number
        const otpData = await OtpModel.findOne({ phoneNumber });

        if (!otpData) {
            return res.json({
                status: false,
                message: 'OTP not found'
            });
        }

        // Check if the OTP is expired
        const currentTime = new Date();
        if (currentTime > otpData.expiresAt) {
            // Delete the expired OTP document
            await OtpModel.deleteOne({ phoneNumber });

            return res.json({
                status: false,
                message: 'OTP has expired'
            });
        }

        // Check if the provided OTP matches the stored OTP
        if (otp !== otpData.otp) {
            return res.json({
                status: false,
                message: 'Invalid OTP'
            });
        }

        // OTP verification successful
        return res.json({
            status: true,
            message: 'OTP verified successfully'
        });
    } catch (error) {
        return res.json({
            status: false,
            message: error.message
        });
    }
};