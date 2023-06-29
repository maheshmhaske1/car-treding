const mongoose = require('mongoose')

const biddersSchema = new mongoose.Schema({
    auctionId: {
        type: mongoose.Types.ObjectId
    },
    userId: {
        type: mongoose.Types.ObjectId
    },
    bid_price: {
        type: Number,
        default: ''
    },
    is_win: {
        status: Number //1.panding 2.not won 3.won
    }
})


var biddersModel = mongoose.model('bidders', biddersSchema);
module.exports = biddersModel;