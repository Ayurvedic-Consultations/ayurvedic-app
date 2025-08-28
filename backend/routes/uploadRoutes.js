const express = require('express');
const router = express.Router();
const { uploadDoctorsFromGoogleSheet, getAllDoctors, deleteDoctor } = require('../controllers/uploadController');

router.post('/', async (req, res) => {
    try {
        await uploadDoctorsFromGoogleSheet();
        res.status(200).json({ message: 'Upload query called successfully - Please check if data upload was successfull' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload doctor data - ' + error.message });
    }
});

router.get('/getdoctors', getAllDoctors);
router.delete('/deleteDoctor/:id', deleteDoctor);

module.exports = router;
