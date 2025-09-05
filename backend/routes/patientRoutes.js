const express = require('express');
const router = express.Router();
const { getAllPatients,
    deletePatient,
    getPatientById,
    getPatientDietYoga,
    addDietYoga } = require('../controllers/patientController');

router.get('/getAllPatients', getAllPatients);
router.delete('/deletePatient/:id', deletePatient);
router.get('/getPatient/:id', getPatientById);
router.get('/dietYoga/:patientId', getPatientDietYoga);
// router.post('/dietYoga', addDietYoga);

module.exports = router;
