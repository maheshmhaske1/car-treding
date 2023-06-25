const express = require('express');
const router = express.Router();

const auctionController = require('../controller/auction.controller');
const {upload_vehicle} = require('../middleware/upload')

router.post('/create', upload_vehicle,auctionController.createAuction);
router.get('/get/:status', auctionController.getAuctions);
router.get('/getById/:id', auctionController.getAuctionById);
router.put('/update/:id', auctionController.updateAuction);
router.delete('/delete/:id', auctionController.deleteAuction);

module.exports = router;
