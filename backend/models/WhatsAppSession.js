const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    messageType: { type: String, enum: ['text', 'interactive', 'template'], default: 'text' }
});

const whatsappSessionSchema = new mongoose.Schema({
    phoneNumber: { type: String, required: true, unique: true, index: true },

    // Registration state
    isRegistered: { type: Boolean, default: false },
    registrationStep: {
        type: String,
        enum: ['none', 'firstName', 'lastName', 'age', 'dob', 'gender', 'email', 'zipCode', 'password', 'completed'],
        default: 'none'
    },
    // Temporarily holds registration info before creating actual Patient
    profile: {
        firstName: { type: String, default: '' },
        lastName: { type: String, default: '' },
        age: { type: Number, default: null },
        dob: { type: String, default: '' },
        gender: { type: String, default: '' },
        email: { type: String, default: '' },
        zipCode: { type: String, default: '' },
        password: { type: String, default: '' } // Raw password kept temporarily during setup, then wiped if needed
    },

    // Linked patient account (if registered on the platform)
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: null },

    // Current conversation flow state
    currentFlow: {
        type: String,
        enum: ['idle', 'registration', 'health_consultation', 'doctor_matching', 'booking', 'general_chat'],
        default: 'idle'
    },

    // Health consultation data
    healthData: {
        symptoms: { type: String, default: '' },
        duration: { type: String, default: '' },
        severity: { type: String, default: '' },
        lifestyle: { type: String, default: '' },
        medicalHistory: { type: String, default: '' },
        currentMedications: { type: String, default: '' },
        consultationStep: {
            type: String,
            enum: ['none', 'ask_symptoms', 'ask_duration', 'ask_severity', 'ask_lifestyle', 'ask_history', 'ask_medications', 'analysis_complete'],
            default: 'none'
        },
        aiAnalysis: { type: String, default: '' },
        identifiedCategory: { type: String, default: '' }
    },

    // Doctor matching state
    doctorMatching: {
        matchedDoctors: [{ type: mongoose.Schema.Types.Mixed }],
        selectedDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', default: null },
        selectedDoctorName: { type: String, default: '' },
        matchingStep: {
            type: String,
            enum: ['none', 'showing_doctors', 'doctor_selected', 'showing_slots', 'slot_selected', 'confirm_booking'],
            default: 'none'
        }
    },

    // Booking flow state
    bookingData: {
        selectedSlot: { type: String, default: '' },
        selectedDate: { type: String, default: '' },
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
        bookingStep: {
            type: String,
            enum: ['none', 'select_slot', 'select_date', 'confirm', 'booked'],
            default: 'none'
        }
    },

    // Conversation history for Gemini context
    conversationHistory: [messageSchema],

    // Language preference
    language: { type: String, default: 'en' },

    // Session metadata
    lastActive: { type: Date, default: Date.now },
    totalMessages: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

// Index for efficient queries
whatsappSessionSchema.index({ lastActive: -1 });
whatsappSessionSchema.index({ isRegistered: 1 });

module.exports = mongoose.model('WhatsAppSession', whatsappSessionSchema);
