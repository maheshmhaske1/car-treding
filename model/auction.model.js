const mongoose = require('mongoose')

const auctionSchema = new mongoose.Schema({
    name: {
        type: String,
        default: ''
    },
    RC: {
        type: Boolean,
    },
    vehicle_img: {
        type: String,
        default: ''
    },
    loan_no: {
        type: String,
        default: ''
    },
    feul_type: {
        type: String
    },
    starting_price: {
        type: Number,
    },
    bid_remains: {
        type: Number,
        default: 20
    },
    current_bidding_price: {
        type: Number
    },
    cat: {
        type: String
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: Number, //1.pending 2.live 3.closed
        default: 1
    }
})


var auctionModel = mongoose.model('auctions', auctionSchema);
module.exports = auctionModel;