/**
 * WhatsApp Bot Service - Intelligent Conversation Orchestrator
 * 
 * A smart, empathetic Ayurvedic health assistant that:
 * - Analyzes patient health concerns and gives immediate recommendations
 * - Filters doctors by availability & expertise for the patient's condition
 * - Helps book consultations seamlessly
 * - Proactively shares relevant YouTube wellness videos
 * - Provides regular follow-ups and ayurvedic guidance
 */
const WhatsAppSession = require('../models/WhatsAppSession');
const Doctor = require('../models/Doctor');
const DoctorData = require('../models/DoctorData');
const Booking = require('../models/Booking');
const Patient = require('../models/Patient');
const gemini = require('./geminiService');
const whatsapp = require('./whatsappApiService');
const bcrypt = require('bcrypt');

// ============================================================
// MAIN MESSAGE HANDLER
// ============================================================
async function handleIncomingMessage(phoneNumber, messageText, messageId) {
    try {
        // Mark message as read
        await whatsapp.markMessageAsRead(messageId);

        // Get or create session
        let session = await WhatsAppSession.findOne({ phoneNumber });
        if (!session) {
            session = new WhatsAppSession({ phoneNumber });
            await session.save();
        }

        // Update session activity
        session.lastActive = new Date();
        session.totalMessages += 1;

        // Add user message to history
        session.conversationHistory.push({
            role: 'user',
            content: messageText,
            timestamp: new Date()
        });

        // Keep only last 50 messages
        if (session.conversationHistory.length > 50) {
            session.conversationHistory = session.conversationHistory.slice(-50);
        }

        // Detect user intent with full context
        const intent = await gemini.detectIntent(
            messageText,
            session.currentFlow,
            session.conversationHistory
        );
        console.log(`📩 [${phoneNumber}] Intent: ${intent.intent} (${intent.confidence}) | Flow: ${session.currentFlow}`);

        let responseText = '';

        // Route based on current flow and detected intent
        responseText = await routeMessage(session, messageText, intent);

        // Add assistant response to history
        session.conversationHistory.push({
            role: 'assistant',
            content: responseText,
            timestamp: new Date()
        });

        await session.save();

        // Send the response via WhatsApp
        await whatsapp.sendTextMessage(phoneNumber, responseText);

        return { success: true, response: responseText };
    } catch (error) {
        console.error('❌ Bot Handler Error:', error);
        const errorMsg = "I'm sorry, something went wrong on my end. Could you try sending your message again? 🙏";
        await whatsapp.sendTextMessage(phoneNumber, errorMsg);
        return { success: false, error: error.message };
    }
}

// ============================================================
// SMART MESSAGE ROUTER
// ============================================================
async function routeMessage(session, message, intent) {
    const flow = session.currentFlow;

    // ------- GLOBAL OVERRIDES (work from any flow) -------

    // Emergency detection
    if (isEmergency(message)) {
        session.currentFlow = 'idle';
        return "🚨 This sounds like it could be a medical emergency!\n\nPlease call emergency services immediately or go to the nearest hospital.\n\nEmergency numbers:\n• India: 112 or 108 (ambulance)\n• General: Your local emergency number\n\nYour safety comes first. I'll be here when you're ready to talk. 🙏💚";
    }

    // User wants to start fresh / go to menu
    if (/^(menu|start over|reset|main menu|home)$/i.test(message.trim())) {
        return resetToMenu(session);
    }

    // ------- FLOW-SPECIFIC HANDLING -------

    // Registration flow (don't interrupt)
    if (flow === 'registration') {
        return handleRegistrationFlow(session, message, intent);
    }

    // Booking flow (don't interrupt unless they want to cancel)
    if (flow === 'booking') {
        if (intent.intent === 'confirmation_no' || /\b(cancel|stop|nevermind)\b/i.test(message)) {
            session.currentFlow = 'idle';
            session.bookingData.bookingStep = 'none';
            return "No problem, I've cancelled the booking process. 😊\n\nHow else can I help you today? You can:\n• Tell me about any health concerns\n• Browse available doctors\n• Get wellness tips & videos";
        }
        return handleBookingFlow(session, message, intent);
    }

    // Doctor matching flow
    if (flow === 'doctor_matching') {
        // Let them override to go back to health chat
        if (intent.intent === 'health_concern') {
            return startHealthConsultation(session, message, intent);
        }
        return handleDoctorMatching(session, message, intent);
    }

    // Health consultation flow
    if (flow === 'health_consultation') {
        // Allow booking intent to take priority when in health flow
        if (intent.intent === 'book_doctor' || intent.intent === 'confirmation_yes') {
            // Check if we have enough health context to find doctors
            if (session.healthData.symptoms && session.healthData.identifiedCategory) {
                session.currentFlow = 'doctor_matching';
                session.doctorMatching.matchingStep = 'showing_doctors';
                return await findAndPresentDoctors(session);
            }
            // If they said yes after quick assessment
            if (session.healthData.consultationStep === 'quick_assessment' ||
                session.healthData.consultationStep === 'analysis_complete') {
                session.currentFlow = 'doctor_matching';
                session.doctorMatching.matchingStep = 'showing_doctors';
                return await findAndPresentDoctors(session);
            }
        }
        if (intent.intent === 'youtube_request') {
            return await handleYouTubeRequest(session, session.healthData.identifiedCategory || session.healthData.symptoms);
        }
        return handleHealthConsultation(session, message, intent);
    }

    // Follow-up flow
    if (flow === 'follow_up') {
        if (intent.intent === 'health_concern') {
            return startHealthConsultation(session, message, intent);
        }
        if (intent.intent === 'book_doctor') {
            return startDoctorSearch(session);
        }
        // Fall through to idle handling
    }

    // ------- IDLE / GENERAL CHAT -------
    return handleIdleState(session, message, intent);
}

// ============================================================
// IDLE STATE - Smart first-contact handler
// ============================================================
async function handleIdleState(session, message, intent) {
    const userName = `${session.profile.firstName || ''} ${session.profile.lastName || ''}`.trim();

    // New user or greeting
    if (intent.intent === 'greeting' || session.totalMessages <= 1) {
        return handleGreeting(session);
    }

    // Health concern — the most important flow
    if (intent.intent === 'health_concern') {
        return startHealthConsultation(session, message, intent);
    }

    // Wants to book a doctor
    if (intent.intent === 'book_doctor') {
        if (!session.isRegistered) {
            session.currentFlow = 'registration';
            session.registrationStep = 'ask_register';
            return "I'd love to help you find the right doctor! 🩺\n\nBut first, I need to know — have you already registered with Ayurvedic AI? (Yes/No)";
        }
        // If we have prior health context, go directly to doctor matching
        if (session.lastHealthTopic || session.healthData.identifiedCategory) {
            session.currentFlow = 'doctor_matching';
            session.doctorMatching.matchingStep = 'showing_doctors';
            return await findAndPresentDoctors(session);
        }
        // Otherwise, ask about their concern first
        return startHealthConsultation(session, message, intent);
    }

    // Check booking status
    if (intent.intent === 'check_booking') {
        return await handleCheckBooking(session);
    }

    // YouTube/video request
    if (intent.intent === 'youtube_request') {
        const topic = session.lastHealthTopic || session.healthData.identifiedCategory || message;
        return await handleYouTubeRequest(session, topic);
    }

    // Wants health recommendations
    if (intent.intent === 'want_recommendations') {
        if (session.lastHealthTopic) {
            return startHealthConsultation(session, session.lastHealthTopic, intent);
        }
        session.currentFlow = 'health_consultation';
        session.healthData.consultationStep = 'ask_symptoms';
        return `I'd be happy to share some Ayurvedic wellness tips! 🌿\n\nTo give you the most relevant advice, could you tell me what health area you'd like help with?\n\nFor example: digestion, stress, sleep, skin, joint pain, immunity...`;
    }

    // Registration responses (might come from a stale prompt)
    if (intent.intent === 'register_yes' || intent.intent === 'register_no') {
        session.currentFlow = 'registration';
        return handleRegistrationFlow(session, message, intent);
    }

    // Farewell
    if (intent.intent === 'farewell') {
        session.currentFlow = 'idle';
        return `Take care${userName ? ', ' + session.profile.firstName : ''}! 🌿💚\n\nRemember, I'm always here whenever you need:\n• Health guidance\n• Doctor bookings\n• Wellness tips\n\nStay healthy and well! 🙏`;
    }

    // General conversation — use Gemini but stay helpful
    session.currentFlow = 'general_chat';
    const response = await gemini.generateResponse(message, session.conversationHistory, {
        userName,
        currentFlow: 'general_chat',
        lastHealthTopic: session.lastHealthTopic,
        customInstruction: 'The patient is chatting generally. Be helpful and warm. If their message relates to health, gently offer to help with a health assessment or doctor booking. Always remind them you can help with bookings, health tips, and videos.'
    });
    return response;
}

// ============================================================
// GREETING - Personalized welcome
// ============================================================
function handleGreeting(session) {
    const firstName = session.profile.firstName;

    if (session.isRegistered && firstName) {
        const lastTopic = session.lastHealthTopic;
        let greeting = `Hello ${firstName}! 💚 Welcome back to Ayurvedic AI.\n\n`;

        if (lastTopic) {
            greeting += `How are you feeling about your ${lastTopic}? I hope things are improving! 🌿\n\n`;
        }

        greeting += `How can I help you today?\n\n`;
        greeting += `• Share any health concern with me\n`;
        greeting += `• Book a doctor consultation\n`;
        greeting += `• Get wellness tips & videos\n`;
        greeting += `• Check your appointment status\n\n`;
        greeting += `Just tell me what's on your mind! 😊`;
        return greeting;
    }

    // New user
    session.currentFlow = 'registration';
    session.registrationStep = 'ask_register';
    return `Namaste! 🙏🌿 Welcome to Ayurvedic AI!\n\nI'm your personal Ayurvedic health assistant. I can:\n\n• Analyze your health concerns and give Ayurvedic recommendations\n• Find the best specialist doctors for your condition\n• Help you book consultations\n• Share wellness tips & helpful videos\n\nHave you already registered with us? (Yes/No)`;
}

// ============================================================
// REGISTRATION FLOW
// ============================================================
async function handleRegistrationFlow(session, message, intent) {
    const step = session.registrationStep;

    // Handle "ask_register" step
    if (step === 'ask_register' || step === 'none') {
        if (intent.intent === 'register_yes' || intent.intent === 'confirmation_yes') {
            // Already registered — link their account
            session.registrationStep = 'completed';
            session.isRegistered = true;
            session.currentFlow = 'idle';
            return `Great, welcome back! 💚\n\nHow can I help you today?\n\n• Tell me about any health concerns\n• Book a doctor consultation\n• Get Ayurvedic wellness tips & videos`;
        }

        if (intent.intent === 'register_no' || intent.intent === 'confirmation_no') {
            session.registrationStep = 'firstName';
            return "No worries! Let's get you set up quickly — it takes less than a minute! 😊\n\nThis will let you use both WhatsApp and our Website.\n\nWhat's your First Name?";
        }

        // Unclear response
        session.registrationStep = 'firstName';
        return "Let me get you registered quickly — you'll be able to use WhatsApp and our Website seamlessly! 😊\n\nWhat's your First Name?";
    }

    if (step === 'firstName') {
        session.profile.firstName = message.trim();
        session.registrationStep = 'lastName';
        return `Nice to meet you, ${session.profile.firstName}! 🌟\n\nWhat's your Last Name?`;
    }

    if (step === 'lastName') {
        session.profile.lastName = message.trim();
        session.registrationStep = 'email';
        return "Great! What's your Email ID?";
    }

    if (step === 'email') {
        if (!message.includes('@') || !message.includes('.')) {
            return "That doesn't seem like a valid email. Could you please enter a valid email address?";
        }

        const existingPatient = await Patient.findOne({ email: message.trim().toLowerCase() });
        if (existingPatient) {
            // Link to existing account
            session.patientId = existingPatient._id;
            session.isRegistered = true;
            session.registrationStep = 'completed';
            session.currentFlow = 'idle';
            session.profile.email = message.trim().toLowerCase();
            return `I found your existing account! I've linked your WhatsApp to your profile. 🎉\n\nWelcome, ${session.profile.firstName}! How can I help you today?\n\n• Tell me about any health concerns\n• Book a doctor consultation\n• Get wellness tips & videos`;
        }

        session.profile.email = message.trim().toLowerCase();
        session.registrationStep = 'dob';
        return "Perfect! What's your Date of Birth? (DD-MM-YYYY format)";
    }

    if (step === 'dob') {
        session.profile.dob = message.trim();
        session.registrationStep = 'age';
        return "Got it! And your Age? (just the number)";
    }

    if (step === 'age') {
        const age = parseInt(message.trim());
        if (isNaN(age) || age < 1 || age > 150) {
            return "Please enter a valid age as a number (e.g., 28)";
        }
        session.profile.age = age;
        session.registrationStep = 'gender';
        return "Your Gender?\n\n• Male\n• Female\n• Other";
    }

    if (step === 'gender') {
        const gender = message.trim().toLowerCase();
        if (['male', 'female', 'other', 'm', 'f'].includes(gender)) {
            session.profile.gender = gender === 'm' ? 'Male' : gender === 'f' ? 'Female' : gender.charAt(0).toUpperCase() + gender.slice(1);
        } else {
            session.profile.gender = message.trim();
        }
        session.registrationStep = 'zipCode';
        return "Your Zip Code / Pincode?";
    }

    if (step === 'zipCode') {
        session.profile.zipCode = message.trim();
        session.registrationStep = 'password';
        return "Almost done! Choose a Password for your account.\n\n🔒 This lets you log into our patient portal website too.\n(At least 5 characters)";
    }

    if (step === 'password') {
        if (message.length < 5) {
            return "For security, please choose a password with at least 5 characters.";
        }

        try {
            const hashedPassword = await bcrypt.hash(message.trim(), 10);

            // Parse DOB
            let dobDate;
            const parts = session.profile.dob.split('-');
            if (parts.length === 3) {
                dobDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            } else {
                dobDate = new Date();
            }

            const newPatient = new Patient({
                firstName: session.profile.firstName,
                lastName: session.profile.lastName,
                email: session.profile.email,
                phone: session.phoneNumber,
                dob: dobDate,
                age: session.profile.age,
                gender: session.profile.gender,
                zipCode: session.profile.zipCode,
                address: session.profile.zipCode,
                password: hashedPassword,
                role: 'patient'
            });

            await newPatient.save();

            session.isRegistered = true;
            session.patientId = newPatient._id;
            session.registrationStep = 'completed';
            session.currentFlow = 'idle';
            session.profile.password = '';

            return `You're all set, ${session.profile.firstName}! 🎉✨\n\nYour account is created and linked to WhatsApp. You can also log in on our website anytime.\n\nNow, how can I help you?\n\n• Tell me about any health concerns\n• Book a doctor consultation\n• Get Ayurvedic wellness tips & videos`;

        } catch (error) {
            console.error('Registration error:', error);
            if (error.code === 11000) {
                return "An account with those details already exists! You can continue using this WhatsApp to access all features. How can I help you today?";
            }
            return "I encountered an error during registration. Don't worry — you can still chat with me! How can I help you?";
        }
    }

    return "Let's get you registered! What's your First Name? 😊";
}

// ============================================================
// HEALTH CONSULTATION FLOW - Smart, flexible assessment
// ============================================================

/**
 * Start a new health consultation with immediate quick assessment
 */
async function startHealthConsultation(session, message, intent) {
    session.currentFlow = 'health_consultation';
    session.healthData.symptoms = intent.extractedData || message;
    session.lastHealthTopic = session.healthData.symptoms;

    const userName = session.profile.firstName || '';

    // Give IMMEDIATE quick assessment — don't make them wait through 6 questions
    const assessment = await gemini.quickHealthAssessment(session.healthData.symptoms, userName);

    // Store the assessment data
    session.healthData.identifiedCategory = assessment.category;
    session.healthData.aiAnalysis = assessment.quickAdvice;
    session.healthData.consultationStep = 'quick_assessment';

    // Build the response: quick advice + actionable options
    let response = assessment.quickAdvice;
    response += `\n\nWhat would you like to do next?\n\n`;
    response += `1️⃣ Find a specialist doctor for this\n`;
    response += `2️⃣ Get helpful video resources\n`;
    response += `3️⃣ Tell me more details for a deeper assessment\n`;
    response += `\nJust reply with 1, 2, 3, or tell me anything! 😊`;

    return response;
}

async function handleHealthConsultation(session, message, intent) {
    const step = session.healthData.consultationStep;

    // Quick assessment follow-up — user is choosing what to do next
    if (step === 'quick_assessment') {
        const msg = message.trim().toLowerCase();

        // Option 1: Find doctors
        if (msg === '1' || intent.intent === 'book_doctor' ||
            /\b(doctor|book|consult|specialist|appointment|find.*doctor|give.*doctor|show.*doctor|who\s*can\s*help)\b/i.test(message)) {

            if (!session.isRegistered) {
                session.currentFlow = 'registration';
                session.registrationStep = 'ask_register';
                return "I'll find the perfect doctor for you! 🩺\n\nBut first — have you already registered with us? (Yes/No)";
            }

            session.currentFlow = 'doctor_matching';
            session.doctorMatching.matchingStep = 'showing_doctors';
            return await findAndPresentDoctors(session);
        }

        // Option 2: YouTube videos
        if (msg === '2' || intent.intent === 'youtube_request' || /\b(video|youtube|watch)\b/i.test(message)) {
            return await handleYouTubeRequest(session, session.healthData.identifiedCategory || session.healthData.symptoms);
        }

        // Option 3: Tell me more (deeper assessment)
        if (msg === '3' || intent.intent === 'health_concern' || /\b(more|detail|deeper|full)\b/i.test(message)) {
            session.healthData.consultationStep = 'ask_duration';
            return "Let me understand your situation better. 💚\n\nHow long have you been experiencing these symptoms?";
        }

        // Yes/confirmation — most likely wants to see doctors
        if (intent.intent === 'confirmation_yes') {
            if (!session.isRegistered) {
                session.currentFlow = 'registration';
                session.registrationStep = 'ask_register';
                return "Great! Let me find the right specialist for you. 🩺\n\nFirst, have you already registered with us? (Yes/No)";
            }
            session.currentFlow = 'doctor_matching';
            session.doctorMatching.matchingStep = 'showing_doctors';
            return await findAndPresentDoctors(session);
        }

        // No/decline
        if (intent.intent === 'confirmation_no') {
            session.currentFlow = 'follow_up';
            return "No problem at all! 😊\n\nTake your time to try the suggestions I shared. I'm always here if you need:\n• More health advice\n• To book a doctor\n• Wellness videos\n\nFeel better soon! 🌿💚";
        }

        // New symptoms or unrelated — evaluate as a new concern
        if (intent.intent === 'health_concern') {
            return startHealthConsultation(session, message, intent);
        }

        // Default: gentle redirect
        return "I'm here to help! You can:\n\n1️⃣ Find a specialist doctor\n2️⃣ Get helpful video resources\n3️⃣ Share more details for a deeper assessment\n\nOr just tell me what you'd like! 😊";
    }

    // Deeper assessment questions
    if (step === 'ask_duration') {
        session.healthData.duration = message;
        session.healthData.consultationStep = 'ask_severity';
        return "Got it. On a scale of 1-10, how severe would you say it is?\n\n(1 = very mild, 10 = very severe)";
    }

    if (step === 'ask_severity') {
        session.healthData.severity = message;
        session.healthData.consultationStep = 'ask_lifestyle';
        return "Thank you. Can you briefly share your daily routine?\n\nLike your sleep pattern, diet habits, stress level, and exercise.";
    }

    if (step === 'ask_lifestyle') {
        session.healthData.lifestyle = message;
        session.healthData.consultationStep = 'ask_history';
        return "Any past medical conditions or surgeries?\n\n(Type 'None' if not applicable)";
    }

    if (step === 'ask_history') {
        session.healthData.medicalHistory = message;
        session.healthData.consultationStep = 'ask_medications';
        return "Currently taking any medications or supplements?\n\n(Type 'None' if not applicable)";
    }

    if (step === 'ask_medications') {
        session.healthData.currentMedications = message;
        session.healthData.consultationStep = 'analysis_complete';

        // Full detailed analysis
        const analysis = await gemini.analyzeHealthConcern(session.healthData);
        session.healthData.aiAnalysis = analysis.analysis;
        session.healthData.identifiedCategory = analysis.category;
        session.lastHealthTopic = analysis.category;

        let response = `🌿 Detailed Ayurvedic Assessment\n\n`;
        response += analysis.analysis;

        if (analysis.dietSuggestions) {
            response += `\n\n🍽️ Diet: ${analysis.dietSuggestions}`;
        }
        if (analysis.yogaSuggestions) {
            response += `\n🧘 Yoga: ${analysis.yogaSuggestions}`;
        }

        response += `\n\nI'd recommend consulting a ${analysis.suggestedSpecialization} specialist for personalized guidance.`;
        response += `\n\nWould you like me to find available doctors for you? 🩺`;

        return response;
    }

    if (step === 'analysis_complete') {
        if (intent.intent === 'confirmation_yes' || intent.intent === 'book_doctor' ||
            /\b(yes|sure|ok|doctor|book|please|find)\b/i.test(message)) {

            if (!session.isRegistered) {
                session.currentFlow = 'registration';
                session.registrationStep = 'ask_register';
                return "Let me find the right doctor for you! 🩺\n\nFirst, have you registered with us? (Yes/No)";
            }

            session.currentFlow = 'doctor_matching';
            session.doctorMatching.matchingStep = 'showing_doctors';
            return await findAndPresentDoctors(session);
        }

        if (intent.intent === 'youtube_request' || /\b(video|youtube|watch)\b/i.test(message)) {
            return await handleYouTubeRequest(session, session.healthData.identifiedCategory);
        }

        session.currentFlow = 'follow_up';
        return "No problem! 😊\n\nTry the suggestions I shared and see how you feel. You can always come back for:\n• More guidance\n• Doctor booking\n• Wellness videos\n\nTake care! 🌿💚";
    }

    // Fallback — use Gemini with health context
    const response = await gemini.generateResponse(message, session.conversationHistory, {
        userName: session.profile.firstName || '',
        healthData: session.healthData,
        currentFlow: 'health_consultation',
        customInstruction: 'The patient is in a health consultation. Stay focused on their health concern. Offer to find doctors or give more tips.'
    });
    return response;
}

// ============================================================
// DOCTOR MATCHING - Smart, expertise-based matching
// ============================================================
async function findAndPresentDoctors(session) {
    try {
        const category = session.healthData.identifiedCategory || session.lastHealthTopic || 'General';
        const symptoms = session.healthData.symptoms || 'General consultation';

        // Fetch all doctors from both collections
        const doctors = await Doctor.find().lean();
        const doctorDataEntries = await DoctorData.find().lean();

        // Check upcoming bookings to determine availability
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);

        const upcomingBookings = await Booking.find({
            dateOfAppointment: { $gte: tomorrow, $lte: nextWeek },
            requestAccept: { $ne: 'denied' }
        }).lean();

        // Count bookings per doctor to assess availability
        const doctorBookingCounts = {};
        upcomingBookings.forEach(b => {
            const did = b.doctorId.toString();
            doctorBookingCounts[did] = (doctorBookingCounts[did] || 0) + 1;
        });

        // Combine and format all doctors
        let allDoctors = [];

        doctors.forEach(doc => {
            const docId = doc._id.toString();
            const bookingCount = doctorBookingCounts[docId] || 0;
            allDoctors.push({
                id: docId,
                name: `Dr. ${doc.firstName} ${doc.lastName}`,
                specialization: Array.isArray(doc.specialization) ? doc.specialization.join(', ') : doc.specialization || 'General Ayurveda',
                experience: doc.experience ? `${doc.experience} years` : 'Experienced',
                price: doc.price || 0,
                email: doc.email,
                source: 'Doctor',
                bookingCount,
                available: bookingCount < 10 // Consider available if less than 10 bookings this week
            });
        });

        doctorDataEntries.forEach(doc => {
            const docId = doc._id.toString();
            const bookingCount = doctorBookingCounts[docId] || 0;
            allDoctors.push({
                id: docId,
                name: `Dr. ${doc.firstname} ${doc.lastname}`,
                specialization: Array.isArray(doc.specialization) ? doc.specialization.join(', ') : doc.specialization || 'General Ayurveda',
                experience: doc.experience ? `${doc.experience} years` : 'Experienced',
                price: doc.fee || 0,
                email: doc.email,
                source: 'DoctorData',
                languages: doc.languages || [],
                timings: doc.timings || '',
                bookingCount,
                available: bookingCount < 10
            });
        });

        // Filter only available doctors
        let availableDoctors = allDoctors.filter(d => d.available);
        if (availableDoctors.length === 0) {
            availableDoctors = allDoctors; // Fallback to all if none pass availability
        }

        // Smart matching: score doctors by specialization relevance
        const categoryLower = category.toLowerCase();
        const symptomsLower = symptoms.toLowerCase();

        availableDoctors = availableDoctors.map(doc => {
            let relevanceScore = 0;
            const specLower = doc.specialization.toLowerCase();

            // Exact category match
            if (specLower.includes(categoryLower) || categoryLower.includes(specLower)) {
                relevanceScore += 10;
            }
            // Symptom keyword matching
            const specWords = specLower.split(/[,\s]+/);
            const symptomWords = symptomsLower.split(/\s+/);
            for (const sw of symptomWords) {
                if (sw.length > 3 && specWords.some(sp => sp.includes(sw) || sw.includes(sp))) {
                    relevanceScore += 3;
                }
            }
            // General Ayurveda is a catch-all
            if (specLower.includes('general') || specLower.includes('ayurved')) {
                relevanceScore += 2;
            }
            // Panchakarma for chronic conditions
            if (specLower.includes('panchakarma') && /\b(chronic|long|months|years)\b/i.test(symptoms)) {
                relevanceScore += 5;
            }
            // Experience bonus
            const expYears = parseInt(doc.experience) || 0;
            if (expYears >= 10) relevanceScore += 2;
            else if (expYears >= 5) relevanceScore += 1;

            // Lower booking count = more available
            relevanceScore -= doc.bookingCount * 0.5;

            return { ...doc, relevanceScore };
        });

        // Sort by relevance score (descending)
        availableDoctors.sort((a, b) => b.relevanceScore - a.relevanceScore);

        // Take top 5
        const topDoctors = availableDoctors.slice(0, 5);
        session.doctorMatching.matchedDoctors = topDoctors;

        if (topDoctors.length === 0) {
            session.currentFlow = 'idle';
            return "I'm sorry, I couldn't find available doctors right now. 😔\n\nPlease try again later or visit our website for more options. Our team will help you!";
        }

        // Use AI to provide context on why these doctors are recommended
        let doctorList = `🩺 Based on your concern about "${symptoms}", here are the best available Ayurvedic doctors:\n\n`;

        topDoctors.forEach((doc, idx) => {
            const availabilityStatus = doc.bookingCount === 0 ? '🟢 Fully Available' :
                doc.bookingCount < 5 ? '🟡 Limited Slots' : '🟠 Few Slots Left';

            doctorList += `${idx + 1}️⃣ ${doc.name}\n`;
            doctorList += `   • ${doc.specialization}\n`;
            doctorList += `   • ${doc.experience} experience\n`;
            doctorList += `   • Fee: ₹${doc.price}\n`;
            doctorList += `   • ${availabilityStatus}\n\n`;
        });

        doctorList += `Reply with a number (1-${topDoctors.length}) to select a doctor and see available time slots. 📅`;

        return doctorList;
    } catch (error) {
        console.error('Doctor Matching Error:', error);
        session.currentFlow = 'idle';
        return "I had trouble finding doctors right now. Please try again in a moment. 🙏";
    }
}

async function handleDoctorMatching(session, message, intent) {
    const step = session.doctorMatching.matchingStep;

    if (step === 'showing_doctors') {
        const selection = parseInt(message.trim());
        const doctors = session.doctorMatching.matchedDoctors;

        if (isNaN(selection) || selection < 1 || selection > doctors.length) {
            return `Please reply with a number between 1 and ${doctors.length} to select your doctor. 😊`;
        }

        const selectedDoctor = doctors[selection - 1];
        session.doctorMatching.selectedDoctorId = selectedDoctor.id;
        session.doctorMatching.selectedDoctorName = selectedDoctor.name;
        session.doctorMatching.matchingStep = 'doctor_selected';

        // Check for this doctor's existing bookings to generate truly available slots
        const slots = await generateSmartSlots(selectedDoctor.id);

        let slotMessage = `Great choice! ${selectedDoctor.name} is an excellent specialist. 👨‍⚕️\n\n`;
        slotMessage += `📅 Available time slots:\n\n`;

        slots.forEach((slot, idx) => {
            slotMessage += `${idx + 1}. ${slot}\n`;
        });

        slotMessage += `\nReply with the slot number that works for you.`;

        session.bookingData.availableSlots = slots;
        session.currentFlow = 'booking';
        session.bookingData.bookingStep = 'select_slot';

        return slotMessage;
    }

    return await findAndPresentDoctors(session);
}

// ============================================================
// BOOKING FLOW
// ============================================================

/**
 * Generate available time slots — checks existing bookings to avoid conflicts
 */
async function generateSmartSlots(doctorId) {
    const now = new Date();
    const allSlots = [];
    const times = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

    // Check existing bookings for this doctor
    let bookedSlots = [];
    try {
        const existingBookings = await Booking.find({
            doctorId,
            dateOfAppointment: { $gte: now },
            requestAccept: { $ne: 'denied' }
        }).lean();
        bookedSlots = existingBookings.map(b => `${new Date(b.dateOfAppointment).toDateString()}-${b.timeSlot}`);
    } catch (e) {
        // If error checking, just show all slots
    }

    for (let dayOffset = 1; dayOffset <= 4; dayOffset++) {
        const date = new Date(now);
        date.setDate(date.getDate() + dayOffset);
        const dateStr = date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

        // Pick 2-3 available slots per day
        const daySlots = [];
        for (const time of times) {
            const slotKey = `${date.toDateString()}-${time}`;
            if (!bookedSlots.includes(slotKey)) {
                daySlots.push(`${dateStr} — ${time}`);
            }
            if (daySlots.length >= 2) break;
        }
        allSlots.push(...daySlots);
        if (allSlots.length >= 6) break;
    }

    // Ensure we always have at least some slots
    if (allSlots.length === 0) {
        for (let dayOffset = 1; dayOffset <= 3; dayOffset++) {
            const date = new Date(now);
            date.setDate(date.getDate() + dayOffset);
            const dateStr = date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
            allSlots.push(`${dateStr} — 10:00 AM`);
            allSlots.push(`${dateStr} — 03:00 PM`);
        }
    }

    return allSlots.slice(0, 6);
}

async function handleBookingFlow(session, message, intent) {
    const step = session.bookingData.bookingStep;

    if (step === 'select_slot') {
        const selection = parseInt(message.trim());
        const slots = session.bookingData.availableSlots || [];

        if (slots.length === 0) {
            session.currentFlow = 'idle';
            return "It looks like the slots have expired. Let me find doctors again for you. Just say 'find doctor'! 🩺";
        }

        if (isNaN(selection) || selection < 1 || selection > slots.length) {
            return `Please reply with a number between 1 and ${slots.length} to pick a time slot. 😊`;
        }

        const selectedSlot = slots[selection - 1];
        session.bookingData.selectedSlot = selectedSlot;
        session.bookingData.bookingStep = 'confirm';

        const doctor = session.doctorMatching.selectedDoctorName || 'the doctor';
        const matchedDoc = session.doctorMatching.matchedDoctors?.find(
            d => d.id === session.doctorMatching.selectedDoctorId?.toString()
        );

        return `📋 Booking Summary\n\n` +
            `👨‍⚕️ Doctor: ${doctor}\n` +
            `📅 Slot: ${selectedSlot}\n` +
            `🏥 Concern: ${session.healthData.symptoms || 'General consultation'}\n` +
            `💰 Fee: ₹${matchedDoc?.price || 'N/A'}\n\n` +
            `Shall I confirm this booking? (Yes/No)`;
    }

    if (step === 'confirm') {
        if (intent.intent === 'confirmation_yes' || /\b(yes|confirm|sure|ok|go\s*ahead|please|book)\b/i.test(message)) {
            try {
                await createBookingFromWhatsApp(session);
                session.bookingData.bookingStep = 'booked';
                session.currentFlow = 'follow_up';

                const doctorName = session.doctorMatching.selectedDoctorName;
                const slot = session.bookingData.selectedSlot;

                // Reset health data for next consultation
                session.healthData = {
                    symptoms: '', duration: '', severity: '', lifestyle: '',
                    medicalHistory: '', currentMedications: '', consultationStep: 'none',
                    aiAnalysis: '', identifiedCategory: ''
                };

                let response = `🎉 Your appointment is booked!\n\n`;
                response += `📋 Details:\n`;
                response += `👨‍⚕️ ${doctorName}\n`;
                response += `📅 ${slot}\n`;
                response += `📌 Status: Pending Doctor Confirmation\n\n`;
                response += `I'll keep you updated on the status! 🔔\n\n`;
                response += `In the meantime, would you like me to share some helpful wellness videos for your condition? 🎥🌿`;

                return response;
            } catch (error) {
                console.error('Booking creation error:', error);
                return "I ran into an issue creating your booking. 😔\n\nPlease try again or visit our website to book directly. I'm sorry for the inconvenience! 🙏";
            }
        }

        if (intent.intent === 'confirmation_no' || /\b(no|cancel|nah|not\s*now)\b/i.test(message)) {
            session.bookingData.bookingStep = 'none';
            session.currentFlow = 'idle';
            return "No problem, booking cancelled. 😊\n\nFeel free to come back anytime. I can also help with:\n• Different doctors or time slots\n• Wellness tips & videos\n• Health guidance";
        }

        return "Would you like me to confirm this appointment? (Yes/No)";
    }

    // Fallback
    session.currentFlow = 'idle';
    return resetToMenu(session);
}

/**
 * Create the actual booking in the database
 */
async function createBookingFromWhatsApp(session) {
    try {
        const doctorId = session.doctorMatching.selectedDoctorId;
        let doctor = await Doctor.findById(doctorId);
        let isDoctorData = false;

        if (!doctor) {
            doctor = await DoctorData.findById(doctorId);
            isDoctorData = true;
        }

        if (!doctor) throw new Error('Doctor not found');

        const doctorName = isDoctorData
            ? `${doctor.firstname} ${doctor.lastname}`
            : `${doctor.firstName} ${doctor.lastName}`;
        const doctorEmail = doctor.email;

        // Parse the selected slot
        const slotParts = session.bookingData.selectedSlot.split(' — ');
        const timeSlot = slotParts.length > 1 ? slotParts[1] : session.bookingData.selectedSlot;

        // Parse the date from slot
        const appointmentDate = new Date();
        appointmentDate.setDate(appointmentDate.getDate() + 1);

        // Find or link patient
        let patientId = session.patientId;
        let patientEmail = session.profile.email || `whatsapp_${session.phoneNumber}@ayurvedic.app`;
        let patientName = `${session.profile.firstName || ''} ${session.profile.lastName || ''}`.trim() || 'WhatsApp User';

        if (!patientId) {
            const existingPatient = await Patient.findOne({ phone: session.phoneNumber });
            if (existingPatient) {
                patientId = existingPatient._id;
                patientEmail = existingPatient.email;
                patientName = `${existingPatient.firstName} ${existingPatient.lastName}`;
                session.patientId = patientId;
            }
        }

        const bookingData = {
            doctorId: doctor._id,
            doctorName,
            doctorEmail,
            timeSlot,
            dateOfAppointment: appointmentDate,
            patientId: patientId || doctor._id,
            patientEmail,
            patientName,
            patientGender: session.profile.gender || 'Not specified',
            patientAge: session.profile.age || 0,
            patientIllness: session.healthData.symptoms || session.lastHealthTopic || 'General consultation',
            meetLink: 'pending',
            amountPaid: isDoctorData ? (doctor.fee || 0) : (doctor.price || 0),
            requestAccept: 'pending'
        };

        const booking = new Booking(bookingData);
        await booking.save();

        session.bookingData.bookingId = booking._id;
        return booking;
    } catch (error) {
        console.error('CreateBooking Error:', error);
        throw error;
    }
}

// ============================================================
// YOUTUBE VIDEO RECOMMENDATIONS
// ============================================================
async function handleYouTubeRequest(session, topic) {
    const healthTopic = topic || session.lastHealthTopic || session.healthData.identifiedCategory || 'Ayurvedic wellness';

    const recommendations = await gemini.getYouTubeRecommendations(healthTopic);

    if (!recommendations.videos || recommendations.videos.length === 0) {
        return `I couldn't find specific video recommendations right now. 📺\n\nTry searching YouTube for "Ayurvedic remedies for ${healthTopic}" — you'll find great content! 🌿`;
    }

    const typeLabels = {
        'educational': '📚 Learn',
        'remedy': '🌿 Remedy',
        'yoga': '🧘 Yoga/Exercise',
        'long-form': '📚 Deep Dive',
        'short-form': '⚡ Quick Tips'
    };

    let response = `🎥 Helpful videos for ${healthTopic}:\n\n`;

    recommendations.videos.forEach((video, idx) => {
        const label = typeLabels[video.type] || '📺';
        response += `${idx + 1}. ${label}: ${video.title}\n`;
        response += `   ${video.description}\n`;
        response += `   🔗 ${video.link}\n\n`;
    });

    response += "Would you like to:\n• Discuss more about your health\n• Book a doctor consultation\n• Get more video recommendations";

    // Keep the flow conversational
    if (session.currentFlow !== 'health_consultation') {
        session.currentFlow = 'follow_up';
    }

    return response;
}

// ============================================================
// CHECK BOOKING STATUS
// ============================================================
async function handleCheckBooking(session) {
    try {
        let query = {};

        if (session.patientId) {
            query.patientId = session.patientId;
        } else if (session.profile.email) {
            query.patientEmail = session.profile.email;
        } else {
            // Try to find by phone
            const patient = await Patient.findOne({ phone: session.phoneNumber });
            if (patient) {
                query.patientId = patient._id;
                session.patientId = patient._id;
            } else {
                return "I don't have any bookings linked to your WhatsApp yet. 📋\n\nWould you like to book a consultation? Just tell me your health concern! 🌿";
            }
        }

        const bookings = await Booking.find(query)
            .sort({ createdAt: -1 })
            .limit(5);

        if (bookings.length === 0) {
            return "You don't have any recent appointments. 📋\n\nWould you like to book one? Just share your health concern and I'll find the right doctor for you! 🩺";
        }

        let response = "📋 Your Appointments:\n\n";
        bookings.forEach((booking, idx) => {
            const status = booking.requestAccept === 'accepted' ? '✅ Confirmed' :
                booking.requestAccept === 'denied' ? '❌ Denied' : '⏳ Pending';

            response += `${idx + 1}. Dr. ${booking.doctorName}\n`;
            response += `   📅 ${new Date(booking.dateOfAppointment).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}\n`;
            response += `   ⏰ ${booking.timeSlot}\n`;
            response += `   ${status}\n`;

            if (booking.meetLink && booking.meetLink !== 'no' && booking.meetLink !== 'pending') {
                response += `   🔗 Join: ${booking.meetLink}\n`;
            }
            response += '\n';
        });

        response += "Need anything else? I'm here to help! 😊";
        return response;
    } catch (error) {
        console.error('Check Booking Error:', error);
        return "I had trouble checking your bookings. Please try again. 🙏";
    }
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function resetToMenu(session) {
    session.currentFlow = 'idle';
    session.healthData.consultationStep = 'none';
    session.bookingData.bookingStep = 'none';
    session.doctorMatching.matchingStep = 'none';

    const name = session.profile.firstName || '';
    return `${name ? `Hi ${name}! ` : ''}Here's what I can help you with 🌿\n\n` +
        `• Share any health concern — I'll give you Ayurvedic guidance\n` +
        `• Book a doctor — I'll find the right specialist\n` +
        `• Get wellness videos — based on your needs\n` +
        `• Check appointments — see your booking status\n\n` +
        `What would you like to do? 😊`;
}

function isEmergency(message) {
    const emergencyPatterns = /\b(chest\s*pain|heart\s*attack|can'?t\s*breathe|difficulty\s*breathing|severe\s*bleeding|stroke|unconscious|seizure|suicid|dying|emergency|overdose|poison)\b/i;
    return emergencyPatterns.test(message);
}

/**
 * Start doctor search from follow-up flow
 */
async function startDoctorSearch(session) {
    if (session.lastHealthTopic) {
        if (!session.isRegistered) {
            session.currentFlow = 'registration';
            session.registrationStep = 'ask_register';
            return "I'll find the best doctor for you! 🩺\n\nFirst, have you registered with us? (Yes/No)";
        }
        session.currentFlow = 'doctor_matching';
        session.doctorMatching.matchingStep = 'showing_doctors';
        return await findAndPresentDoctors(session);
    }

    session.currentFlow = 'health_consultation';
    session.healthData.consultationStep = 'ask_symptoms';
    return "I'd be happy to help you find a doctor! 🩺\n\nFirst, could you tell me what health concern you'd like to address? This will help me match you with the best specialist.";
}

/**
 * Handle interactive message responses (button clicks, list selections)
 */
async function handleInteractiveResponse(phoneNumber, interactiveData, messageId) {
    const buttonReply = interactiveData.button_reply;
    const listReply = interactiveData.list_reply;
    const responseText = buttonReply ? buttonReply.title : listReply ? listReply.title : '';

    if (responseText) {
        return handleIncomingMessage(phoneNumber, responseText, messageId);
    }

    return { success: false, error: 'Unknown interactive response' };
}

module.exports = {
    handleIncomingMessage,
    handleInteractiveResponse
};
