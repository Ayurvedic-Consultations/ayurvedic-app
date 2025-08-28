const mongoose = require("mongoose");

const PrescriptionSchema = new mongoose.Schema({
    medicineName: { type: String, required: true },
    dosage: { type: String, required: true },   // "2 pills/day"
    duration: { type: String, required: true }  // "7 days"
});

const RecommendationSchema = new mongoose.Schema({
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const TransactionSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    details: { type: String }
});

const PatientRecordSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },

    doctorsConnected: [{
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
        feedback: { type: String }, // patient feedback for this doctor
        connectedAt: { type: Date, default: Date.now },
        prescriptions: [PrescriptionSchema],
        recommendations: [RecommendationSchema],
    }],

    transactions: [TransactionSchema],
}, { timestamps: true });

module.exports = mongoose.model("PatientRecord", PatientRecordSchema);
