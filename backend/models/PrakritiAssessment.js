const mongoose = require("mongoose");

const prakritiAssessmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
    },
    isAssessmentComplete: {
        type: Boolean,
        default: false
    },
    // Storing the results of the 20-30 questions
    responses: [
        {
            questionId: { type: String, required: true },
            doshaType: {
                type: String,
                enum: ["kapha", "pitta", "vata"],
                required: true
            },
            score: { type: Number, required: true } // 0-4 based on slider
        }
    ],
    // Final calculated totals for easy access
    calculatedScores: {
        kapha: { type: Number, default: 0 },
        pitta: { type: Number, default: 0 },
        vata: { type: Number, default: 0 }
    },
    dominantDosha: {
        type: String,
        enum: [
            "KAPHA",
            "PITTA",
            "VATA",
            "KAPHA-PITTA",
            "PITTA-KAPHA",
            "VATA-PITTA",
            "PITTA-VATA",
            "VATA-KAPHA",
            "KAPHA-VATA",
            "TRIDOSHIC (VATA-PITTA-KAPHA)"
        ],
        required: true
    }
}, {
    timestamps: true // This automatically creates 'createdAt' and 'updatedAt'
});

const PrakritiAssessment = mongoose.model("PrakritiAssessment", prakritiAssessmentSchema);
module.exports = PrakritiAssessment;