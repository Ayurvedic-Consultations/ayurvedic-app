const express = require('express');
const router = express.Router();
const { getAllRetailers,
    getSingleRetailer
 } = require('../controllers/retailerController');

router.get('/getAllRetailers', getAllRetailers);
router.get('/getSingleRetailer/:id', getSingleRetailer);

module.exports = router;
