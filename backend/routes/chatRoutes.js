const express = require('express');
const router = express.Router();
const WebChatSession = require('../models/WebChatSession');
const nativeAi = require('../services/nativeAiService');
const Doctor = require('../models/Doctor');
const DoctorData = require('../models/DoctorData');
const bcrypt = require('bcryptjs');
const Patient = require('../models/Patient');
const Booking = require('../models/Booking');

// ─── Utility: Fetch doctors from DB, filter by specialization, rank by AI ─────
async function getTopDoctors(category, symptoms) {
    const [doctors1, doctors2] = await Promise.all([Doctor.find().lean(), DoctorData.find().lean()]);

    const normalize = (d) => ({
        id: d._id.toString(),
        name: `Dr. ${d.firstName || d.firstname || ''} ${d.lastName || d.lastname || ''}`.trim(),
        email: d.email || '',
        specialization: Array.isArray(d.specialization)
            ? d.specialization.join(', ')
            : (d.specialization || 'General Ayurveda'),
        experience: d.experience || d.yearsOfExperience || 0,
        price: d.price || d.fee || d.consultationFee || 0,
        rating: d.rating || d.averageRating || null,
        location: (() => {
            const loc = d.city || d.location || d.zipCode || d.state || '';
            if (typeof loc === 'object' && loc !== null) return loc.specific || loc.pincode || '';
            return loc;
        })(),
        languages: Array.isArray(d.languages) ? d.languages.join(', ') : (d.language || ''),
        about: d.about || d.bio || d.description || ''
    });

    const allDocs = [...doctors1.map(normalize), ...doctors2.map(normalize)]
        .filter(d => d.name && d.name !== 'Dr.' && d.name !== 'Dr. ');

    if (allDocs.length === 0) return { doctors: [], reason: '' };

    // Pre-filter: prioritize doctors whose specialization matches the category
    const categoryLower = (category || '').toLowerCase();
    const symptomsLower = (symptoms || '').toLowerCase();

    const scored = allDocs.map(doc => {
        const specLower = doc.specialization.toLowerCase();
        let score = 0;
        // Direct specialization match
        if (categoryLower && (specLower.includes(categoryLower) || categoryLower.includes(specLower))) score += 10;
        // Keyword overlap with symptoms
        const specWords = specLower.split(/[,\s\/]+/).filter(w => w.length > 2);
        const symptomWords = symptomsLower.split(/\s+/).filter(w => w.length > 3);
        for (const sw of symptomWords) {
            if (specWords.some(sp => sp.includes(sw) || sw.includes(sp))) score += 3;
        }
        // General Ayurveda catch-all (lower priority)
        if (specLower.includes('general') || specLower.includes('ayurved')) score += 1;
        // Experience bonus
        const exp = parseInt(doc.experience) || 0;
        if (exp >= 10) score += 2;
        else if (exp >= 5) score += 1;
        return { ...doc, _score: score };
    });

    // Sort by relevance score, take top matches
    scored.sort((a, b) => b._score - a._score);
    const candidateDocs = scored.slice(0, 10); // Narrow down to top 10 for AI ranking

    if (candidateDocs.length <= 3) {
        // If 3 or fewer, no need for AI ranking
        return { doctors: candidateDocs.slice(0, 3), reason: candidateDocs[0]?._score > 5 ? `Best specialization match for ${category}` : '' };
    }

    // AI ranking on the pre-filtered set
    try {
        const ranking = await nativeAi.rankDoctorsForCondition(candidateDocs, category || 'General', symptoms || '');
        const topDoctors = (ranking.rankedIndices || []).slice(0, 3).map(idx => candidateDocs[idx]).filter(Boolean);
        return { doctors: topDoctors.length > 0 ? topDoctors : candidateDocs.slice(0, 3), reason: ranking.topPickReason || '' };
    } catch (e) {
        console.error('AI ranking failed, using score-based fallback:', e.message);
        return { doctors: candidateDocs.slice(0, 3), reason: '' };
    }
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

        // ── QUICK-ROUTE: Handle exact button clicks from option menus ─────────
        // These are the exact label strings sent when users click our preset buttons.
        // We match them directly to skip AI intent detection (which often misclassifies them).
        const msgTrimmed = message.trim();
        const BUTTON_TO_INTENT = {
            '📺 Wellness Videos': 'youtube_request',
            '📺 Watch Videos': 'youtube_request',
            'Watch Videos': 'youtube_request',
            '🥗 Diet Plan': 'diet_plan',
            '🥗 Get Diet Plan': 'diet_plan',
            '🧘 Yoga Plan': 'yoga_plan',
            '🧘 Get Yoga Plan': 'yoga_plan',
            '🩺 Find a Specialist': 'book_doctor',
            'Continue as Guest': 'register_no',
        };

        let intent;
        if (BUTTON_TO_INTENT[msgTrimmed]) {
            intent = {
                intent: BUTTON_TO_INTENT[msgTrimmed],
                extractedData: session.healthData?.symptoms || session.healthData?.identifiedCategory || '',
                confidence: 1.0,
                language: 'English'
            };
        } else {
            // 4. ── AI-FIRST INTENT DETECTION ──────────────────────────────────────
            intent = await nativeAi.detectIntent(message, session.currentFlow, session.conversationHistory);
        }
        const lang = intent.language || 'English';

        console.log(`[WebChat] Intent: ${intent.intent} | Flow: ${session.currentFlow} | Lang: ${lang} | Confidence: ${intent.confidence}`);

        // ── Route based on intent ──────────────────────────────────────

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
            session.currentFlow = 'idle';
            responseText = `Sure thing! You can register securely via our official portals. What type of account do you need?`;
            responseMetadata = {
                type: 'options',
                options: [
                    { label: '🌿 Register as Patient', action: '/signup-patient' },
                    { label: '⚕️ Register as Doctor', action: '/signup-doctor' },
                    { label: '🏪 Register as Retailer', action: '/signup-retailer' }
                ]
            };

        } else if (intent.intent === 'want_login') {
            session.currentFlow = 'idle';
            responseText = `Sure! Please log in securely through the portal to access your full profile and book consultations.`;
            responseMetadata = {
                type: 'options',
                options: [
                    { label: '🔑 Go to Login', action: '/signin' }
                ]
            };

        } else if (message === 'Continue as Guest' || intent.intent === 'register_no') {
            session.currentFlow = 'idle';
            responseText = await nativeAi.generateResponse(
                "The user wants to continue as a guest. Greet them warmly and let them know they can ask health questions or explore the platform.",
                [], { currentFlow: 'idle' }
            );

        } else if (intent.intent === 'health_concern') {
            session.currentFlow = 'health_consultation';
            const newSymptoms = intent.extractedData || message;
            
            if (!session.healthData) session.healthData = {};
            
            // If we already have symptoms and this looks like a follow-up, append it instead of wiping the context
            if (session.healthData.symptoms && session.healthData.symptoms !== newSymptoms) {
                if (!session.healthData.symptoms.includes(newSymptoms)) {
                    session.healthData.symptoms = session.healthData.symptoms + " | " + newSymptoms;
                }
            } else {
                session.healthData.symptoms = newSymptoms;
            }

            const assessment = await nativeAi.quickHealthAssessment(
                session.healthData.symptoms, 
                session.profile?.firstName, 
                lang, 
                session.conversationHistory
            );
            session.healthData.identifiedCategory = assessment.category;
            session.healthData.consultationStep = 'quick_assessment';

            responseText = assessment.quickAdvice;
            responseMetadata = {
                type: 'options',
                options: ['🩺 Find a Specialist', '🧘 Yoga Plan', '🥗 Diet Plan', '📺 Wellness Videos']
            };

        } else if (intent.intent === 'book_doctor') {
            if (!(session.isRegistered || isRegistered)) {
                session.currentFlow = 'idle';
                responseText = `You need to log in to our platform to book a consultation with doctors. Since you haven't logged in yet, would you like to log in now?`;
                responseMetadata = {
                    type: 'options',
                    options: [
                        { label: '🔑 Log in', action: '/signin' },
                        { label: '🌿 Register as Patient', action: '/signup-patient' }
                    ]
                };
            } else {
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
            }

        } else if (intent.intent === 'diet_plan') {
            session.currentFlow = 'idle';
            const dietContext = intent.extractedData || session.healthData?.symptoms || message;
            if (intent.extractedData && !session.healthData?.symptoms) {
                if (!session.healthData) session.healthData = {};
                session.healthData.symptoms = intent.extractedData;
            }
            responseText = await nativeAi.generateDietPlan(dietContext, session.profile?.firstName, session.healthData);

        } else if (intent.intent === 'yoga_plan') {
            session.currentFlow = 'idle';
            const yogaContext = intent.extractedData || session.healthData?.symptoms || message;
            if (intent.extractedData && !session.healthData?.symptoms) {
                if (!session.healthData) session.healthData = {};
                session.healthData.symptoms = intent.extractedData;
            }
            responseText = await nativeAi.generateYogaPlan(yogaContext, session.profile?.firstName, session.healthData);

        } else if (intent.intent === 'youtube_request') {
            session.currentFlow = 'idle';
            // Prefer extractedData (the actual health topic) over generic category
            const topic = intent.extractedData || session.healthData?.identifiedCategory || session.healthData?.symptoms || message;
            if (intent.extractedData && !session.healthData?.symptoms) {
                if (!session.healthData) session.healthData = {};
                session.healthData.symptoms = intent.extractedData;
            }
            const vids = await nativeAi.getYouTubeRecommendations(topic);
            responseText = `Here are the top videos for "${topic}":`;
            responseMetadata = { type: 'videos', videos: vids.videos };

        } else if (intent.intent === 'check_booking') {
            session.currentFlow = 'idle';
            if (!(session.isRegistered || isRegistered)) {
                responseText = `To check your bookings, you must be logged in. Would you like to log in now?`;
                responseMetadata = {
                    type: 'options',
                    options: [
                        { label: '🔑 Log in', action: '/signin' },
                        { label: '🌿 Register as Patient', action: '/signup-patient' }
                    ]
                };
            } else {
                let bookedStr = "You have no recent bookings.";
                try {
                    const recents = await Booking.find({ $or: [{ patientId: userId }, { patientEmail: session.profile?.email }] }).sort({ createdAt: -1 }).limit(1);
                    if (recents && recents.length > 0) {
                        const b = recents[0];
                        const dName = b.doctorName || "Doctor";
                        const dDate = new Date(b.dateOfAppointment).toLocaleDateString();
                        const timeSlot = b.timeSlot || "Scheduled Time";
                        const status = b.requestAccept || "Pending";
                        let statusText = status;
                        if (status === 'accepted') statusText = '✅ Accepted — ' + (b.meetLink && b.meetLink !== 'no' ? b.meetLink : 'Link to be provided');
                        else if (status === 'rejected') statusText = '❌ Rejected';
                        else statusText = '⏳ Pending Approval';

                        bookedStr = `Your last booking is with **Dr. ${dName}** on **${dDate}** at **${timeSlot}**.\n\nStatus: ${statusText}`;
                    }
                } catch (e) {
                    console.error(e);
                }
                responseText = bookedStr;
                responseMetadata = { type: 'options', options: [{ label: '📅 Go to My Dashboard', action: '/patient-home' }] };
            }

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

        } else if (intent.intent === 'confirmation_yes') {
            // Smart context-aware confirmation: check what the bot last offered
            const lastBotMsg = [...session.conversationHistory].reverse().find(m => m.role === 'assistant');
            const lastText = (lastBotMsg?.content || '').toLowerCase();

            if (lastText.includes('video') || lastText.includes('wellness video') || lastText.includes('watch')) {
                // User confirmed they want videos
                const topic = session.healthData?.identifiedCategory || session.healthData?.symptoms || 'Ayurvedic wellness';
                const vids = await nativeAi.getYouTubeRecommendations(topic);
                responseText = `Here are the top videos for ${topic}:`;
                responseMetadata = { type: 'videos', videos: vids.videos };
            } else if (lastText.includes('doctor') || lastText.includes('specialist') || lastText.includes('consult')) {
                // User confirmed they want to book a doctor — use proper getTopDoctors flow
                session.currentFlow = 'doctor_matching';
                const category = session.healthData?.identifiedCategory || 'General Ayurveda';
                const symptoms = session.healthData?.symptoms || '';
                const { doctors, reason } = await getTopDoctors(category, symptoms);

                if (doctors.length > 0) {
                    responseText = `Here are the best specialists for you:`;
                    responseMetadata = { type: 'doctors_list', category, reason, doctors };
                } else {
                    responseText = `Please browse our doctors page for available specialists.`;
                    responseMetadata = { type: 'options', options: [{ label: 'Browse Doctors', action: '/doctors' }] };
                }
            } else if (lastText.includes('diet') || lastText.includes('food') || lastText.includes('eat')) {
                responseText = await nativeAi.generateDietPlan(message, session.profile?.firstName, session.healthData);
            } else if (lastText.includes('yoga') || lastText.includes('exercise') || lastText.includes('asana')) {
                responseText = await nativeAi.generateYogaPlan(message, session.profile?.firstName, session.healthData);
            } else {
                responseText = await nativeAi.generateResponse(message, session.conversationHistory, {
                    userName: session.profile?.firstName, healthData: session.healthData, currentFlow: session.currentFlow
                });
            }

        } else if (intent.intent === 'off_topic') {
            session.currentFlow = 'idle';
            responseText = "I appreciate your curiosity, but I'm specifically designed to help with Ayurvedic health guidance and navigating the JeevanHub platform. I can help you with health concerns, diet plans, yoga routines, doctor consultations, and platform-related queries. How can I assist you with your wellness today?";

        } else if (intent.intent === 'platform_question') {
            session.currentFlow = 'idle';
            responseText = await nativeAi.generateResponse(message, session.conversationHistory, {
                userName: session.profile?.firstName,
                customInstruction: 'The user is asking about platform features or navigation. Use the PLATFORM KNOWLEDGE section to give accurate, specific answers with exact page routes. Be concise and helpful.'
            });

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
