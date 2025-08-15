const express = require('express');
const router = express.Router();
const { uploadDoctorsFromGoogleSheet } = require('../controllers/uploadController');
const {getAllDoctors} = require('../controllers/uploadController');

router.post('/', async (req, res) => {
    try {
        await uploadDoctorsFromGoogleSheet();
        res.status(200).json({ message: 'Upload query called successfully - Please check if data upload was successfull' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload doctor data - ' + error.message });
    }
});

router.get('/getdoctors', getAllDoctors);

module.exports = router;
