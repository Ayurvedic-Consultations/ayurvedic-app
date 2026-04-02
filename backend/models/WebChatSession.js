const mongoose = require('mongoose');

const webChatSessionSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true }, // Can be Guest ID or Patient ID
    isRegistered: { type: Boolean, default: false },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },

    // Conversation State
    currentFlow: { type: String, default: 'idle' }, // idle, registration, health_consultation, doctor_matching, booking
    conversationHistory: [{
        role: { type: String, enum: ['system', 'user', 'assistant'] },
        content: { type: String },
        timestamp: { type: Date, default: Date.now },
        metadata: { type: mongoose.Schema.Types.Mixed } // Actions, buttons, attached doctors
    }],

    // Health Context Memory
    healthData: {
        symptoms: String,
        duration: String,
        severity: String,
        lifestyle: String,
        medicalHistory: String,
        currentMedications: String,
        consultationStep: { type: String, default: 'none' },
        identifiedCategory: String,
        aiAnalysis: String
    },

    // Doctor Matching Memory
    doctorMatching: {
        matchedDoctors: [{ type: mongoose.Schema.Types.Mixed }],
        selectedDoctorId: String,
        matchingStep: { type: String, default: 'none' }
    },

    // Profile Context
    language: { type: String, default: 'English' },
    profile: {
        firstName: String,
        email: String
    },

    lastActive: { type: Date, default: Date.now },
    totalMessages: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('WebChatSession', webChatSessionSchema);
