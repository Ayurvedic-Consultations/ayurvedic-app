const mongoose = require("mongoose");

const PrescriptionSchema = new mongoose.Schema({
    medicineName: { type: String, required: true }, // "Metformin 500mg"
    dosage: { type: String, required: true },   // "2 pills/day"
    instructions: { type: String, required: true },  // "Take after meals"
    duration: { type: String, required: true }, // "3 months"
});

const PatientRecordSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },

    doctorsConnected: [{
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
        feedback: { type: mongoose.Schema.Types.ObjectId, ref: "Feedback" }, // patient feedback for this doctor
        connectedAt: { type: Date, default: Date.now },
        prescriptions: [PrescriptionSchema], 
        recommendations: { type: String, required: true }, // eg - avoid sugar, exercise daily etc
        reason: { type: String }, // reason for connecting with this doctor
    }],

    // dietYogaPlan - find diet and yoga plans by searching with patient id

    // transactions - for transactions of this patient - do a transaction.find({payer: patientId}) - here patientid is this.patient

}, { timestamps: true });

module.exports = mongoose.model("PatientRecord", PatientRecordSchema);
