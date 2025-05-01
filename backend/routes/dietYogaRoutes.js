// routes/dietYogaRoutes.js
const express = require("express");
const router = express.Router();
const {
  createDietYoga,
  getDietYogaByBooking,
  updateDiet,
  updateYoga,
  getDietYogaByPatientEmail,
  deleteDietYoga
} = require("../controllers/dietYogaController");
const auth = require("../middleware/auth");

// Create or update diet and yoga recommendation
router.post("/", auth, createDietYoga);

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
