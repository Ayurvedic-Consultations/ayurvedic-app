// routes/dietYogaRoutes.js
const express = require("express");
const router = express.Router();
const {
  getDietYogaByBooking,
  updateDiet,
  updateYoga,
  getDietYogaByPatientEmail,
  deleteDietYoga,
  prescribeDiet,
  prescribeYoga
} = require("../controllers/dietYogaController");
const auth = require("../middleware/auth");

// Create or update diet recommendation
router.post("/", auth, prescribeDiet);

// Create or update yoga recommendation
router.post("/yoga", auth, prescribeYoga);

// Get diet and yoga recommendation by booking ID
router.get("/booking/:bookingId", auth, getDietYogaByBooking);

// Update diet recommendation
router.put("/diet/:id", auth, updateDiet);

// Update yoga recommendation
router.put("/yoga/:id", auth, updateYoga);

// Add this new route
router.get("/patient/:patientEmail", auth, getDietYogaByPatientEmail);

// Delete diet and yoga recommendation
router.delete("/:id", auth, deleteDietYoga);

module.exports = router;
