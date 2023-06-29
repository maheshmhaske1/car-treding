const { default: mongoose } = require('mongoose');
const auctionModel = require('../model/auction.model');
const { stat } = require('fs-extra');

exports.createAuction = async (req, res) => {
    const { name, RC, loan_no, feul_type, starting_price } = req.body;

    if (!req.file)
        return res.json({
            status: false,
            message: `please select image`,
        });

    const vehicle_img = req.file.filename;

    const auction = new auctionModel({
        name: name,
        RC: RC,
        vehicle_img: vehicle_img,
        loan_no: loan_no,
        feul_type: feul_type,
        starting_price: starting_price,
        current_bidding_price: starting_price
    });

    try {
        const savedAuction = await auction.save();
        res.json({
            status: true,
            message: "vehicle added in Auction",
            data: savedAuction
        });
    } catch (error) {
        res.json({
            status: false,
            message: "Something went wrong"
        });
    }
};

exports.getAuctions = async (req, res) => {
    const { status } = req.params
    console.log(typeof (Number(status)))
    try {
        // const auctions = await auctionModel.find({ status: status });
        const auctions = await auctionModel.aggregate([
            {
                $match: { status: Number(status) }
            },
            {
                $lookup: {
                    from: "bidders",
                    localField: "_id",
                    foreignField: "auctionId",
                    as: "auction"
                }
            },
          
          
        ])
        res.json({
            status: true,
            message: 'vehicle details',
            data: auctions
        });
    } catch (error) {
        res.json({
            status: false,
            message: "Something went wrong"
        });
    }
};

exports.getAuctionById = async (req, res) => {
    const auctionId = req.params.id;

    try {
        const auction = await auctionModel.findOne(mongoose.Types.ObjectId(auctionId));
        if (!auction) {
            return res.json({
                status: false,
                message: "Auction not found"
            });
        }
        res.json({
            status: true,
            message: 'vehicle details',
            data: auction
        });
    } catch (error) {
        res.json({
            status: false,
            message: "Something went wrong", error
        });
    }
};

exports.updateAuction = async (req, res) => {
    const auctionId = req.params.id;
    const updates = req.body;

    try {
        const updatedAuction = await auctionModel.findByIdAndUpdate(auctionId, updates, { new: true });
        if (!updatedAuction) {
            return res.json({
                status: false,
                message: "Auction not found"
            });
        }
        return res.json({
            status: true,
            message: "Auction edited"
        });
    } catch (error) {
        res.json({
            status: false,
            message: "Something went wrong"
        });
    }
};

exports.deleteAuction = async (req, res) => {
    const auctionId = req.params.id;

    try {
        const deletedAuction = await auctionModel.findByIdAndRemove(auctionId);
        if (!deletedAuction) {
            return res.json({
                status: false,
                message: "Auction not found"
            });
        }
        res.json({
            status: true,
            message: "Auction deleted successfully"
        });
    } catch (error) {
        res.json({
            status: false,
            message: "Something went wrong"
        });
    }
};
