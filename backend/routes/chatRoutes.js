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

        // Add user message to history, UNLESS it's the init event
        if (message !== 'INIT_CHAT_EVENT') {
            session.lastActive = new Date();
            session.totalMessages += 1;
            session.conversationHistory.push({ role: 'user', content: message });

            if (session.conversationHistory.length > 50) {
                session.conversationHistory = session.conversationHistory.slice(-50);
            }
        }

        let responseText = '';
        let responseMetadata = null; // Custom UI elements

        // ----- INTERCEPT INIT_CHAT_EVENT -----
        if (message === 'INIT_CHAT_EVENT') {
            if (req.body.isRegistered) {
                const roleText = req.body.userRole || 'User';
                responseText = `Namaste 🙏 Welcome back! I am Sanjeevani AI your virtual Ayurvedic assistant.\n\nHow can I help you today? You can search for doctors or ask me health-related questions.`;
            } else {
                responseText = `Namaste 🙏 I am Sanjeevani AI.\n\nAre you already registered on our platform, or would you like me to help you sign in / sign up?`;
                responseMetadata = {
                    type: 'options',
                    options: [
                        'Log in',
                        'Register as Patient',
                        'Continue as Guest'
                    ]
                };
            }
        }
        else {
            // 2. Detect Intent via our Native Groq AI
            let intent = await nativeAi.detectIntent(message, session.currentFlow, session.conversationHistory);

            // Context overrides
            if (/sign.?up|register|create account/i.test(message)) {
                intent = { intent: 'want_registration' };
            } else if (/sign.?in|log.?in/i.test(message)) {
                intent = { intent: 'want_login' };
            } else if (/^(hi|hello|hey|namaste|good\s*(morning|evening|afternoon))/i.test(message)) {
                intent = { intent: 'greeting' };
            }

            console.log(`[WebChat] Intent: ${intent.intent} | Flow: ${session.currentFlow}`);

            // Break out of sticky flows if user just says Hi again
            if (intent.intent === 'greeting') {
                session.currentFlow = 'idle';
                session.healthData = {};
                session.doctorMatching = {};
            }

            // 3. Routing engine (Simplified extraction of the whatsapp logic)
            // Check for hard resets
            if (/^(menu|start over|reset)$/i.test(message.trim()) || intent.intent === 'greeting') {
                session.currentFlow = 'idle';
                responseText = `Namaste 🙏 I am Sanjeevani AI. How can I help you today?\n\n• Tell me about any health concerns\n• Search for a doctor\n• Get wellness tips`;
            }
            else if (intent.intent === 'want_registration') {
                session.currentFlow = 'register_patient';
                session.healthData.consultationStep = 'ask_firstname';
                responseText = "I can definitely help you register as a new patient right here! 🌿\n\nTo start, what is your First Name?";
            }
            else if (intent.intent === 'want_login') {
                session.currentFlow = 'login_user';
                session.healthData.consultationStep = 'ask_email';
                responseText = "Welcome back! To sign in, please provide your registered email address.";
            }
            else if (session.currentFlow === 'register_patient') {
                const step = session.healthData.consultationStep;
                if (step === 'ask_firstname') {
                    session.profile.firstName = message.trim();
                    session.healthData.consultationStep = 'ask_lastname';
                    responseText = "Nice to meet you! And what is your Last Name?";
                } else if (step === 'ask_lastname') {
                    session.healthData.identifiedCategory = message.trim(); // using as temp storage for lastName
                    session.healthData.consultationStep = 'ask_email';
                    responseText = "Got it. What is your Email Address?";
                } else if (step === 'ask_email') {
                    if (!message.includes('@')) {
                        responseText = "Please provide a valid email format.";
                    } else {
                        session.profile.email = message.trim();
                        session.healthData.consultationStep = 'ask_password';
                        responseText = "Great! Finally, choose a secure Password for your account.";
                    }
                } else if (step === 'ask_password') {
                    const password = message.trim();
                    const Patient = require('../models/Patient');
                    const bcrypt = require('bcryptjs');
                    try {
                        const hashedPassword = await bcrypt.hash(password, 10);
                        const newPatient = new Patient({
                            firstName: session.profile.firstName,
                            lastName: session.healthData.identifiedCategory,
                            email: session.profile.email,
                            password: hashedPassword,
                            age: 20, gender: 'Not specified', zipCode: 0,
                            role: 'patient'
                        });
                        await newPatient.save();
                        session.isRegistered = true;
                        session.currentFlow = 'idle';
                        responseText = "Registration successful! You are now officially registered on our platform. 🎉\n\nHow can I help you with your health today?";
                    } catch (err) {
                        session.currentFlow = 'idle';
                        responseText = "It looks like this email is already registered. Please say 'sign in' if you would like to log in, or tell me your health concerns as a guest! 🌿";
                    }
                }
            }
            else if (session.currentFlow === 'login_user') {
                const step = session.healthData.consultationStep;
                if (step === 'ask_email') {
                    session.profile.email = message.trim();
                    session.healthData.consultationStep = 'ask_password';
                    responseText = "Thank you. Now, please enter your Password.";
                } else if (step === 'ask_password') {
                    const Patient = require('../models/Patient');
                    const bcrypt = require('bcryptjs');
                    try {
                        const user = await Patient.findOne({ email: session.profile.email });
                        if (user && await bcrypt.compare(message.trim(), user.password)) {
                            session.isRegistered = true;
                            session.profile.firstName = user.firstName;
                            session.currentFlow = 'idle';
                            responseText = `Login successful! Welcome back, ${user.firstName}. 🙏\n\nHow can I assist you today?`;
                        } else {
                            session.currentFlow = 'idle';
                            responseText = "Incorrect password or account not found. You are now in Guest mode. You can try logging in again by saying 'sign in'.";
                        }
                    } catch (e) {
                        session.currentFlow = 'idle';
                        responseText = "An error occurred. You are still in Guest mode.";
                    }
                }
            }
            else if (message === 'Continue as Guest') {
                responseText = "Welcome! As a guest, you can still ask me health questions or search for doctors. What's on your mind? 🌿";
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
        } // close the INIT_CHAT_EVENT else block

    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
});

module.exports = router;
