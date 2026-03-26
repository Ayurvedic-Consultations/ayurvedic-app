const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const {
    // createPrakritiDetermination,
    // getPrakritiDetermination,
    // updatePrakritiDetermination,
    // deletePrakritiDetermination,
    submitAssessment,
    getPrakritiAssessment,
    deleteAssessment
} = require("../controllers/prakritiController");

// // POST route to create a new Prakriti Determination entry
// router.post("/", createPrakritiDetermination);

// // GET route to fetch Prakriti Determination for a specific patient
// router.get("/:patientEmail", getPrakritiDetermination);

// // PUT route to update Prakriti Determination for a specific patient
// router.put("/:patientEmail", updatePrakritiDetermination);

// // DELETE route to delete Prakriti Determination for a specific patient
// router.delete("/:patientEmail", deletePrakritiDetermination);

// POST route to submit a new Prakriti Assessment
router.post("/assessment", verifyToken, submitAssessment);

// GET route to fetch Prakriti Assessment for a specific patient
router.post("/assessment/getall", verifyToken, getPrakritiAssessment);

// DELETE route to delete Prakriti Assessment for a specific patient
router.delete("/assessment/:patientEmail", verifyToken, deleteAssessment);

module.exports = router;
