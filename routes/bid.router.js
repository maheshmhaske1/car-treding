const express = require('express');
const router = express.Router();

const bidController = require('../controller/bid.controller');

router.post('/add', bidController.addBid);

module.exports = router;
