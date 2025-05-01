const express = require("express");
const router = express.Router();
const {
    createPrakritiDetermination,
    getPrakritiDetermination,
    updatePrakritiDetermination,
    deletePrakritiDetermination,
} = require("../controllers/prakritiController");

// POST route to create a new Prakriti Determination entry
router.post("/", createPrakritiDetermination);

// GET route to fetch Prakriti Determination for a specific patient
router.get("/:patientEmail", getPrakritiDetermination);

// PUT route to update Prakriti Determination for a specific patient
router.put("/:patientEmail", updatePrakritiDetermination);

// DELETE route to delete Prakriti Determination for a specific patient
router.delete("/:patientEmail", deletePrakritiDetermination);

module.exports = router;
