const express = require('express');
const router = express.Router();
const WebChatSession = require('../models/WebChatSession');
const nativeAi = require('../services/nativeAiService');
const Doctor = require('../models/Doctor');
const DoctorData = require('../models/DoctorData');
const bcrypt = require('bcryptjs');
const Patient = require('../models/Patient');

// ─── Utility: Fetch doctors from DB and rank by AI for given condition ────────
async function getTopDoctors(category, symptoms) {
    const [doctors1, doctors2] = await Promise.all([Doctor.find().lean(), DoctorData.find().lean()]);

    const normalize = (d) => ({
        id: d._id.toString(),
        name: `Dr. ${d.firstName || d.firstname || ''} ${d.lastName || d.lastname || ''}`.trim(),
        specialization: Array.isArray(d.specialization)
            ? d.specialization.join(', ')
            : (d.specialization || 'General Ayurveda'),
        experience: d.experience || d.yearsOfExperience || 0,
        price: d.price || d.fee || d.consultationFee || 0,
        rating: d.rating || d.averageRating || null,
        location: d.city || d.location || d.state || '',
        languages: Array.isArray(d.languages) ? d.languages.join(', ') : (d.language || ''),
        about: d.about || d.bio || d.description || ''
    });

    const allDocs = [...doctors1.map(normalize), ...doctors2.map(normalize)]
        .filter(d => d.name && d.name !== 'Dr.' && d.name !== 'Dr. ');

    if (allDocs.length === 0) return { doctors: [], reason: '' };

    const ranking = await nativeAi.rankDoctorsForCondition(allDocs, category || 'General', symptoms || '');
    const topDoctors = (ranking.rankedIndices || []).slice(0, 3).map(idx => allDocs[idx]).filter(Boolean);
    return { doctors: topDoctors, reason: ranking.topPickReason || '' };
}

// ─── Main Chat Handler ────────────────────────────────────────────────────────
router.post('/message', async (req, res) => {
    try {
        const { userId, message, isRegistered, userRole, fetchHistory } = req.body;
        if (!userId || !message) return res.status(400).json({ error: 'userId and message are required' });

        // 1. Get or create session
        let session = await WebChatSession.findOne({ userId });
        if (!session) {
            session = new WebChatSession({ userId });
        }
        // Hydrate profile from token if logged in
        if (isRegistered && !session.isRegistered) {
            session.isRegistered = true;
        }

        // 2. Handle init event
        if (message === 'INIT_CHAT_EVENT') {
            let responseText;
            let responseMetadata = null;

            if (isRegistered) {
                const role = userRole || 'patient';
                const name = session.profile?.firstName ? `, ${session.profile.firstName}` : '';
                const roleGreetings = {
                    admin: `Namaste 🙏 Welcome back Administrator${name}! I am Sanjeevani AI. How can I assist you with platform management today?`,
                    doctor: `Namaste 🙏 Welcome back Dr.${name}! Would you like to check your appointments, update your profile, or need anything else?`,
                    retailer: `Namaste 🙏 Welcome back Retailer${name}! Do you need to manage your medicine inventory or anything else today?`
                };
                responseText = roleGreetings[role] || `Namaste 🙏 Welcome back${name}! I am Sanjeevani AI — your personal Ayurvedic health companion. How can I help you today? 🌿`;
            } else {
                responseText = `Namaste 🙏 I am Sanjeevani AI — your personal Ayurvedic health companion.\n\nAre you already registered on our platform?`;
                responseMetadata = {
                    type: 'options',
                    options: [
                        { label: '🔑 Log in', action: '/signin' },
                        { label: '🌿 Register as Patient', action: '/signup-patient' },
                        { label: '⚕️ Register as Doctor', action: '/signup-doctor' },
                        { label: '🏪 Register as Retailer', action: '/signup-retailer' },
                        'Continue as Guest'
                    ]
                };
            }

            await session.save();
            return res.json({
                success: true,
                response: responseText,
                metadata: responseMetadata,
                history: session.conversationHistory
            });
        }

        // 3. Add user message to history
        session.lastActive = new Date();
        session.totalMessages = (session.totalMessages || 0) + 1;
        session.conversationHistory.push({ role: 'user', content: message, timestamp: new Date() });
        if (session.conversationHistory.length > 60) {
            session.conversationHistory = session.conversationHistory.slice(-60);
        }

        let responseText = '';
        let responseMetadata = null;

        // 4. If inside a multi-step wizard (registration/login), handle it without calling AI intent
        if (session.currentFlow === 'register_patient') {
            const step = session.healthData?.consultationStep;
            if (step === 'ask_firstname') {
                session.profile.firstName = message.trim();
                session.healthData.consultationStep = 'ask_lastname';
                responseText = `Nice name! 😊 And what's your Last Name?`;
            } else if (step === 'ask_lastname') {
                session.healthData.tempLastName = message.trim();
                session.healthData.consultationStep = 'ask_email';
                responseText = `Got it! Now, what's your Email Address?`;
            } else if (step === 'ask_email') {
                if (!message.includes('@')) {
                    responseText = `Hmm, that doesn't look right. Please enter a valid email address (e.g. name@email.com).`;
                } else {
                    session.profile.email = message.trim();
                    session.healthData.consultationStep = 'ask_password';
                    responseText = `Perfect! Finally, choose a strong Password for your account 🔒`;
                }
            } else if (step === 'ask_password') {
                try {
                    const hashedPassword = await bcrypt.hash(message.trim(), 10);
                    const newPatient = new Patient({
                        firstName: session.profile.firstName,
                        lastName: session.healthData.tempLastName || '',
                        email: session.profile.email,
                        password: hashedPassword,
                        age: 18, gender: 'Not specified', zipCode: 0, role: 'patient'
                    });
                    await newPatient.save();
                    session.isRegistered = true;
                    session.currentFlow = 'idle';
                    responseText = `🎉 You're all set! Welcome to the platform, ${session.profile.firstName}!\n\nNow, how can I help you with your health today?`;
                } catch (err) {
                    session.currentFlow = 'idle';
                    responseText = `This email seems to already be registered. Try saying "log in" instead, or continue as a guest.`;
                }
            } else {
                session.currentFlow = 'idle';
                responseText = `Let me start fresh. How can I help you today?`;
            }

        } else if (session.currentFlow === 'login_user') {
            const step = session.healthData?.consultationStep;
            if (step === 'ask_email') {
                session.profile.email = message.trim();
                session.healthData.consultationStep = 'ask_password';
                responseText = `Got it. Now please enter your Password.`;
            } else if (step === 'ask_password') {
                const user = await Patient.findOne({ email: session.profile.email });
                if (user && await bcrypt.compare(message.trim(), user.password)) {
                    session.isRegistered = true;
                    session.profile.firstName = user.firstName;
                    session.currentFlow = 'idle';
                    responseText = `Welcome back, ${user.firstName}! 🙏 Great to see you. How can I assist you today?`;
                } else {
                    session.currentFlow = 'idle';
                    responseText = `Hmm, that email or password doesn't match. You can continue as a guest, or try again by saying "log in".`;
                }
            } else {
                session.currentFlow = 'idle';
                responseText = `Let me know how I can help you!`;
            }

        } else {
            // 5. ── AI-FIRST INTENT DETECTION ──────────────────────────────────────
            const intent = await nativeAi.detectIntent(message, session.currentFlow, session.conversationHistory);
            const lang = intent.language || 'English';

            console.log(`[WebChat] Intent: ${intent.intent} | Flow: ${session.currentFlow} | Lang: ${lang} | Confidence: ${intent.confidence}`);

            // ── Route based purely on AI intent ──────────────────────────────────

            if (intent.intent === 'greeting') {
                session.currentFlow = 'idle';
                session.healthData = {};
                if (session.isRegistered || isRegistered) {
                    const ctxInfo = { userName: session.profile?.firstName, currentFlow: 'greeting', isReturning: true };
                    responseText = await nativeAi.generateResponse(message, session.conversationHistory, ctxInfo);
                } else {
                    responseText = `Namaste 🙏 Myself Sanjeevani AI.\n\nAre you registered on our platform?`;
                    responseMetadata = {
                        type: 'options',
                        options: [
                            { label: '🔑 Log in', action: '/signin' },
                            { label: '🌿 Register as Patient', action: '/signup-patient' },
                            { label: '⚕️ Register as Doctor', action: '/signup-doctor' },
                            { label: '🏪 Register as Retailer', action: '/signup-retailer' },
                            'Continue as Guest'
                        ]
                    };
                }

            } else if (intent.intent === 'want_registration') {
                session.currentFlow = 'register_patient';
                if (!session.healthData) session.healthData = {};
                session.healthData.consultationStep = 'ask_firstname';
                responseText = `I'd love to help you register! 🌿\n\nLet's start — what's your First Name?`;

            } else if (intent.intent === 'want_login') {
                session.currentFlow = 'login_user';
                if (!session.healthData) session.healthData = {};
                session.healthData.consultationStep = 'ask_email';
                responseText = `Sure! Please enter your registered Email Address.`;

            } else if (message === 'Continue as Guest' || intent.intent === 'register_no') {
                session.currentFlow = 'idle';
                responseText = await nativeAi.generateResponse(
                    "The user wants to continue as a guest. Greet them warmly and let them know they can ask health questions or explore the platform.",
                    [], { currentFlow: 'idle' }
                );

            } else if (intent.intent === 'health_concern') {
                session.currentFlow = 'health_consultation';
                const symptoms = intent.extractedData || message;
                if (!session.healthData) session.healthData = {};
                session.healthData.symptoms = symptoms;

                const assessment = await nativeAi.quickHealthAssessment(symptoms, session.profile?.firstName, lang);
                session.healthData.identifiedCategory = assessment.category;
                session.healthData.consultationStep = 'quick_assessment';

                responseText = assessment.quickAdvice;
                responseMetadata = {
                    type: 'options',
                    options: ['🩺 Find a Specialist', '🧘 Yoga Plan', '🥗 Diet Plan', '📺 Wellness Videos']
                };

            } else if (intent.intent === 'book_doctor') {
                // Fetch from real DB, rank by AI, show actual cards
                session.currentFlow = 'doctor_matching';
                const category = intent.extractedData || session.healthData?.identifiedCategory || '';
                const symptoms = session.healthData?.symptoms || message;
                const { doctors, reason } = await getTopDoctors(category, symptoms);

                if (doctors.length > 0) {
                    const name = session.profile?.firstName ? `, ${session.profile.firstName}` : '';
                    const catLabel = category ? ` for ${category}` : '';
                    responseText = `Here are the best matched Ayurvedic specialists${catLabel} available on our platform${name} 🩺`;
                    responseMetadata = { type: 'doctors_list', category, reason, doctors };
                } else {
                    responseText = `I couldn't find any doctors listed right now. Please visit our Doctors page to browse all available specialists.`;
                    responseMetadata = { type: 'action_fetch_doctors', category: category || 'General' };
                }

            } else if (intent.intent === 'diet_plan') {
                session.currentFlow = 'idle';
                responseText = await nativeAi.generateDietPlan(message, session.profile?.firstName, session.healthData);

            } else if (intent.intent === 'yoga_plan') {
                session.currentFlow = 'idle';
                responseText = await nativeAi.generateYogaPlan(message, session.profile?.firstName, session.healthData);

            } else if (intent.intent === 'youtube_request') {
                session.currentFlow = 'idle';
                const topic = session.healthData?.identifiedCategory || intent.extractedData || message;
                const vids = await nativeAi.getYouTubeRecommendations(topic);
                responseText = `Here are some helpful Ayurvedic videos for you 🎬`;
                responseMetadata = { type: 'videos', videos: vids.videos };

            } else if (intent.intent === 'check_booking') {
                responseText = await nativeAi.generateResponse(message, session.conversationHistory, {
                    userName: session.profile?.firstName,
                    currentFlow: 'check_booking',
                    customInstruction: 'Tell the user they can check their appointments by going to their dashboard. Offer to navigate them there.'
                });
                responseMetadata = { type: 'options', options: [{ label: '📅 Go to Appointments', action: '/patient/appointments' }] };

            } else if (intent.intent === 'want_recommendations') {
                session.currentFlow = 'idle';
                responseText = await nativeAi.generateResponse(message, session.conversationHistory, {
                    userName: session.profile?.firstName,
                    healthData: session.healthData,
                    customInstruction: 'Provide a warm, specific Ayurvedic health recommendation. If they mentioned a condition before, use that context.'
                });
                // Give relevant follow-up options
                responseMetadata = {
                    type: 'options',
                    options: ['🥗 Get Diet Plan', '🧘 Get Yoga Plan', '📺 Watch Videos']
                };

            } else if (intent.intent === 'farewell') {
                session.currentFlow = 'idle';
                responseText = await nativeAi.generateResponse(message, session.conversationHistory, {
                    userName: session.profile?.firstName,
                    customInstruction: 'Say a warm, friendly goodbye and wish them good health.'
                });

            } else {
                // General question / platform info / anything else
                // ALWAYS clear sticky flows here so old context never leaks
                session.currentFlow = 'idle';
                responseText = await nativeAi.generateResponse(message, session.conversationHistory, {
                    userName: session.profile?.firstName,
                    healthData: session.healthData,
                    currentFlow: 'idle'
                });
            }

            // ── Translate response if user's language is non-English ─────────────
            if (lang && lang.toLowerCase() !== 'english' && lang.toLowerCase() !== 'en' && responseText) {
                responseText = await nativeAi.translateMessage(responseText, lang);
            }
        }

        // 6. Save assistant response to history
        session.conversationHistory.push({
            role: 'assistant',
            content: responseText,
            metadata: responseMetadata,
            timestamp: new Date()
        });
        await session.save();

        return res.json({
            success: true,
            response: responseText,
            metadata: responseMetadata,
            flow: session.currentFlow
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({ error: 'Failed to process message. Please try again.' });
    }
});

module.exports = router;
