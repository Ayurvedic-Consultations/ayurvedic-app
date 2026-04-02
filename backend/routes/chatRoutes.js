const express = require('express');
const router = express.Router();
const WebChatSession = require('../models/WebChatSession');
const nativeAi = require('../services/nativeAiService');
const Doctor = require('../models/Doctor');
const DoctorData = require('../models/DoctorData');

// Handles incoming messages from the frontend Sanjeevani AI chatbot
router.post('/message', async (req, res) => {
    try {
        const { userId, message, userEmail, userName } = req.body;
        if (!userId || !message) {
            return res.status(400).json({ error: 'userId and message are required' });
        }

        // 1. Get or Create Session
        let session = await WebChatSession.findOne({ userId });
        if (!session) {
            session = new WebChatSession({ userId });
            if (userEmail) {
                session.isRegistered = true;
                session.profile.email = userEmail;
            }
            if (userName) {
                session.profile.firstName = userName;
            }
            await session.save();
        }

        // Add user message to history
        session.lastActive = new Date();
        session.totalMessages += 1;
        session.conversationHistory.push({ role: 'user', content: message });

        if (session.conversationHistory.length > 50) {
            session.conversationHistory = session.conversationHistory.slice(-50);
        }

        // 2. Detect Intent via our Native Groq AI
        const intent = await nativeAi.detectIntent(message, session.currentFlow, session.conversationHistory);
        console.log(`[WebChat] Intent: ${intent.intent} | Flow: ${session.currentFlow}`);

        let responseText = '';
        let responseMetadata = null; // Custom UI elements (videos, doctors list, buttons)

        // 3. Routing engine (Simplified extraction of the whatsapp logic)
        // Check for hard resets
        if (/^(menu|start over|reset)$/i.test(message.trim())) {
            session.currentFlow = 'idle';
            responseText = `I've reset our conversation. 🌿 How can I help you today?\n\n• Tell me about any health concerns\n• Search for a doctor\n• Get wellness tips`;
        }
        else if (intent.intent === 'health_concern' || (session.currentFlow === 'health_consultation')) {
            session.currentFlow = 'health_consultation';

            // If they are just starting
            if (!session.healthData.symptoms) {
                session.healthData.symptoms = intent.extractedData || message;
                const assessment = await nativeAi.quickHealthAssessment(session.healthData.symptoms, session.profile.firstName);

                session.healthData.identifiedCategory = assessment.category;
                session.healthData.consultationStep = 'quick_assessment';

                responseText = assessment.quickAdvice;
                responseMetadata = {
                    type: 'options',
                    options: ['Find a Specialist', 'Watch Wellness Videos', 'Tell me more']
                };
            } else if (session.healthData.consultationStep === 'quick_assessment') {
                if (intent.intent === 'book_doctor' || message.includes('Specialist') || message === '1') {
                    // Trigger doctor search
                    session.currentFlow = 'doctor_matching';
                    responseText = "Let me find the best Ayurvedic specialists for your condition... 🩺";

                    try {
                        const doctors1 = await Doctor.find().lean();
                        const doctors2 = await DoctorData.find().lean();
                        const allDocs = [...doctors1, ...doctors2].map(d => ({
                            id: d._id.toString(),
                            name: `Dr. ${d.firstName || d.firstname} ${d.lastName || d.lastname}`,
                            specialization: d.specialization?.toString(),
                            experience: d.experience || 0,
                            price: d.price || d.fee || 0
                        }));

                        if (allDocs.length > 0) {
                            const ranking = await nativeAi.rankDoctorsForCondition(allDocs, session.healthData.identifiedCategory, session.healthData.symptoms);
                            const topDoctors = ranking.rankedIndices.slice(0, 3).map(idx => allDocs[idx]).filter(Boolean);

                            responseMetadata = {
                                type: 'doctors_list',
                                category: session.healthData.identifiedCategory,
                                reason: ranking.topPickReason,
                                doctors: topDoctors
                            };
                        } else {
                            responseMetadata = { type: 'action_fetch_doctors', category: session.healthData.identifiedCategory };
                        }
                    } catch (e) {
                        responseMetadata = { type: 'action_fetch_doctors', category: session.healthData.identifiedCategory };
                    }

                } else if (intent.intent === 'youtube_request' || message.includes('Videos') || message === '2') {
                    const vids = await nativeAi.getYouTubeRecommendations(session.healthData.identifiedCategory);
                    responseText = "Here are some helpful Ayurvedic wellness videos curated just for you: 🧘";
                    responseMetadata = { type: 'videos', videos: vids.videos };
                } else {
                    // Deeper dive
                    session.healthData.consultationStep = 'ask_duration';
                    responseText = "Let's dive deeper. How long have you been experiencing these symptoms? 💚";
                }
            } else {
                // For other deeper questions, we just do a general chat reply for now to keep it simple
                const response = await nativeAi.generateResponse(message, session.conversationHistory, { currentFlow: 'health_consultation' });
                responseText = response;
            }
        }
        else if (intent.intent === 'book_doctor' || session.currentFlow === 'doctor_matching') {
            session.currentFlow = 'doctor_matching';
            responseText = "I've pulled up the best available Ayurvedic specialists for you. 🩺";

            try {
                const doctors1 = await Doctor.find().lean();
                const doctors2 = await DoctorData.find().lean();
                const allDocs = [...doctors1, ...doctors2].map(d => ({
                    id: d._id.toString(),
                    name: `Dr. ${d.firstName || d.firstname} ${d.lastName || d.lastname}`,
                    specialization: d.specialization?.toString(),
                    experience: d.experience || 0,
                    price: d.price || d.fee || 0
                }));

                const category = intent.extractedData || session.healthData.identifiedCategory || 'General';
                const ranking = await nativeAi.rankDoctorsForCondition(allDocs, category, message);
                const topDoctors = ranking.rankedIndices.slice(0, 3).map(idx => allDocs[idx]).filter(Boolean);

                responseMetadata = {
                    type: 'doctors_list',
                    category: category,
                    reason: ranking.topPickReason,
                    doctors: topDoctors
                };
            } catch (e) {
                // Fallback
            }
        }
        else if (intent.intent === 'youtube_request') {
            const vids = await nativeAi.getYouTubeRecommendations(message);
            responseText = "Here are some videos that can help you: 🌿";
            responseMetadata = { type: 'videos', videos: vids.videos };
        }
        else {
            // General Chat / Idle
            session.currentFlow = 'idle';
            responseText = await nativeAi.generateResponse(message, session.conversationHistory, {
                userName: session.profile.firstName,
                currentFlow: 'idle'
            });
        }

        // Translate if requested
        if (intent.language && intent.language.toLowerCase() !== 'english' && intent.language.toLowerCase() !== 'en') {
            responseText = await nativeAi.translateMessage(responseText, intent.language);
        }

        // Add assistant response to history
        session.conversationHistory.push({
            role: 'assistant',
            content: responseText,
            metadata: responseMetadata,
            timestamp: new Date()
        });

        await session.save();

        res.json({
            success: true,
            response: responseText,
            metadata: responseMetadata,
            flow: session.currentFlow
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
});

module.exports = router;
