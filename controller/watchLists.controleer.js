const { default: mongoose } = require('mongoose');
const auctionModel = require('../model/auction.model');
const userModel = require('../model/user.model');
const watchListsModel = require('../model/watchlist.model');

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