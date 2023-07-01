const mongoose = require('mongoose')

const watchlistSchema = new mongoose.Schema({
    auctionId: {
        type: mongoose.Types.ObjectId
    },
    userId: {
        type: mongoose.Types.ObjectId
    }
})


var watchListsModel = mongoose.model('watchLists', watchlistSchema);
module.exports = watchListsModel;