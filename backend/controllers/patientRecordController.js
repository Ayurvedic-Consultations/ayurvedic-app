const mongoose = require('mongoose');

const Patient = require('../models/Patient');
const PatientRecord = require('../models/PatientRecord');

exports.getAllRecords = async (req, res) => {
    try {
        const allRecords = await PatientRecord.find({})
            .populate('patient')
            .exec();

        res.status(200).json({
            status: 'success',
            results: allRecords.length,
            data: {
                records: allRecords
            }
        });
    } catch (error) {
        console.error("Error fetching patient records:", error);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while fetching records.',
            error: error.message
        });
    }
};
