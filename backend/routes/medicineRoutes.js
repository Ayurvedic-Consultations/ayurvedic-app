const express = require('express');
const router = express.Router();
const { addMedicine, getAllMedicines, getMyMedicines, deleteMedicine } = require('../controllers/medicineController');
const auth = require('../middleware/auth');
const multer = require('multer');
const { addMedicinesFromZip } = require('../controllers/medicineController');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Public Routes
router.get('/', getAllMedicines); // Public route to view all medicines

// Retailer Routes (Protected)
router.post('/add', auth, upload.single('file'), addMedicinesFromZip); // Add medicine (Retailer only)
router.get('/my', auth, getMyMedicines); // Get logged-in retailer's medicines
router.delete('/:id', auth, deleteMedicine); // Delete medicine (Retailer only)

module.exports = router;
