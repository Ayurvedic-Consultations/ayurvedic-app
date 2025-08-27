const express = require("express");
const router = express.Router();
const {
    getAllRecords
} = require("../controllers/patientRecordController");

router.get("/getAllRecords", getAllRecords);

module.exports = router;
