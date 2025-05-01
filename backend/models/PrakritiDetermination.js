const mongoose = require("mongoose");

const prakritiDeterminationSchema = new mongoose.Schema({
    patientEmail: {
        type: String,
        required: true,
        unique: true, // Ensures each patient has only one Prakriti Determination entry
    },
    physicalTraits: {
        bodyBuild: {
            type: String,
            enum: ["Thin", "Well Built"],
            required: true,
        },
        height: {
            type: String,
            enum: ["Small", "Medium", "Tall"],
            required: true,
        },
        appearance: {
            type: String,
            enum: ["Prominent", "Normal"],
            required: true,
        },
        skinTexture: {
            type: String,
            enum: ["Dry", "Oily", "Combination"],
            required: true,
        },
        hairType: {
            type: String,
            enum: ["Thin", "Thick", "Curly"],
            required: true,
        },
        voiceQuality: {
            type: String,
            enum: ["Soft", "Moderate", "Loud"],
            required: true,
        },
    },
    physiologicalTraits: {
        digestion: {
            type: String,
            enum: ["Regular", "Irregular", "Mixed"],
            required: true,
        },
        bodyTemperature: {
            type: String,
            enum: ["Feels Cold Easily", "Feels Hot Easily"],
            required: true,
        },
        thirstLevel: {
            type: String,
            enum: ["Frequent", "Normal", "Intense"],
            required: true,
        },
        sleepingPattern: {
            type: Number,
            required: true,
        },
        appetite: {
            type: String,
            enum: ["Strong", "Weak", "Irregular"],
            required: true,
        },
        dietaryHabits: {
            type: String,
            enum: ["Heavy", "Medium", "Light"],
            required: true,
        },
    },
    psychologicalTraits: {
        decisionMakingAbility: {
            type: String,
            enum: ["Often Changes Decision", "Sometimes Changes Decision", "Rarely Changes Decision"],
            required: true,
        },
        comprehension: {
            type: String,
            enum: ["Quick", "Delayed"],
            required: true,
        },
    },
    behavioralTraits: {
        politeness: {
            type: String,
            enum: ["Polite/Humble", "Sometimes Polite", "Rarely Polite"],
            required: true,
        },
        emotionalStability: {
            type: String,
            enum: ["Calm and composed", "Balanced", "Rarely Disturbed"],
            required: true,
        },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const PrakritiDetermination = mongoose.model("PrakritiDetermination", prakritiDeterminationSchema);

module.exports = PrakritiDetermination;
