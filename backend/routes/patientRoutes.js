const express = require('express');
const router = express.Router();
const { getAllPatients,
    deletePatient,
    getPatientById,
    getPatientDietYoga,
    getOrdersByBuyerId,
    updatePatient,
    createTempOrder,
    addDietYoga } = require('../controllers/patientController');

router.get('/getAllPatients', getAllPatients);
router.put('/updatePatient/:id', updatePatient);
router.delete('/deletePatient/:id', deletePatient);
router.get('/getPatient/:id', getPatientById);
router.get('/dietYoga/:patientId', getPatientDietYoga);
router.get('/orders/:buyerId', getOrdersByBuyerId);
// router.post('/dietYoga', addDietYoga);
// router.post('/createTempOrder', createTempOrder);

module.exports = router;
