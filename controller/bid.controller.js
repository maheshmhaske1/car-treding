const biddersModel = require("../model/bid.model");
const auctionModel = require("../model/auction.model");
const { default: mongoose } = require("mongoose");
const userModel = require("../model/user.model");

exports.addBid = async (req, res) => {
    const { userId, auctionId, bid_price } = req.body;

    if (!userId || !auctionId || !bid_price) {
        return res.json({
            status: false,
            message: "userId, auctionId, bid_price are required values",
        });
    }

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

    if (auctionDetails.current_bidding_price > bid_price) {
        return res.json({
            status: false,
            message: "bidding price must be greater than previous bidding",
        });
    }

    function isDifferenceMultipleOf1000(value1, value2) {
        const difference = Math.abs(value1 - value2);
        return difference % 1000 === 0;
    }

    const isMultipleOf1000 = isDifferenceMultipleOf1000(
        bid_price,
        auctionDetails.current_bidding_price
    );
    if (!isMultipleOf1000) {
        return res.json({
            status: false,
            message: "bidding price must be in multiple of 1000",
        });
    }

    await new biddersModel({
        userId: userId,
        auctionId: auctionId,
        bid_price: bid_price,
    })
        .save()
        .then(async (success) => {
            await auctionModel.findOneAndUpdate(
                {
                    _id: mongoose.Types.ObjectId(auctionId),
                },
                {
                    $set: {
                        bid_remains: auctionDetails.bid_remains - 1,
                        current_bidding_price: bid_price,
                    },
                },
                { returnOriginal: false }
            )
                .then((success) => {
                    return res.json({
                        status: true,
                        message: "bid added"
                    })
                })
                .catch((error) => {
                    return res.json({
                        status: false,
                        message: "something went wrong"
                    })
                })

        })
        .catch((error) => {
            return res.json({
                status: false,
                message: "something went wrong"
            })
        });
};
