/**
 * WhatsApp Bot Service - Main Conversation Orchestrator
 * Handles all conversation flows: Registration, Health Consultation,
 * Doctor Matching, Booking, and General Chat
 */
const WhatsAppSession = require('../models/WhatsAppSession');
const Doctor = require('../models/Doctor');
const DoctorData = require('../models/DoctorData');
const Booking = require('../models/Booking');
const Patient = require('../models/Patient');
const gemini = require('./geminiService');
const whatsapp = require('./whatsappApiService');

/**
 * Main message handler - routes to appropriate flow
 */
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

        // Keep only last 50 messages in history
        if (session.conversationHistory.length > 50) {
            session.conversationHistory = session.conversationHistory.slice(-50);
        }

        // Detect user intent
        const intent = await gemini.detectIntent(messageText, session.currentFlow);
        console.log(`📩 [${phoneNumber}] Intent: ${intent.intent} | Flow: ${session.currentFlow}`);

        let responseText = '';

        // Route based on current flow and intent
        if (session.currentFlow === 'idle' || session.currentFlow === 'general_chat') {
            responseText = await handleIdleState(session, messageText, intent);
        } else if (session.currentFlow === 'registration') {
            responseText = await handleRegistrationFlow(session, messageText, intent);
        } else if (session.currentFlow === 'health_consultation') {
            responseText = await handleHealthConsultation(session, messageText, intent);
        } else if (session.currentFlow === 'doctor_matching') {
            responseText = await handleDoctorMatching(session, messageText, intent);
        } else if (session.currentFlow === 'booking') {
            responseText = await handleBookingFlow(session, messageText, intent);
        } else {
            responseText = await handleIdleState(session, messageText, intent);
        }

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
        const errorMsg = "I'm sorry, I ran into a small issue. Could you try sending your message again? 🙏";
        await whatsapp.sendTextMessage(phoneNumber, errorMsg);
        return { success: false, error: error.message };
    }
}

/**
 * Handle idle state - first message or returning user
 */
async function handleIdleState(session, message, intent) {
    // Check for specific intents
    if (intent.intent === 'greeting' || session.totalMessages <= 1) {
        return handleGreeting(session);
    }

    if (intent.intent === 'health_concern') {
        session.currentFlow = 'health_consultation';
        session.healthData.consultationStep = 'ask_symptoms';
        session.healthData.symptoms = message;
        return handleHealthConsultation(session, message, intent);
    }

    if (intent.intent === 'book_doctor') {
        if (!session.isRegistered) {
            session.currentFlow = 'registration';
            session.registrationStep = 'ask_register';
            return "I'd love to help you book a doctor consultation! 🩺\n\nBut first, I'll need a few details. Have you already registered with Ayurvedic AI?";
        }
        session.currentFlow = 'health_consultation';
        session.healthData.consultationStep = 'ask_symptoms';
        return "I'd be happy to help you find the right Ayurvedic doctor! 🌿\n\nCould you tell me what health concern or symptoms you'd like to address? This will help me match you with the best specialist.";
    }

    if (intent.intent === 'check_booking') {
        return await handleCheckBooking(session);
    }

    if (intent.intent === 'youtube_request') {
        return await handleYouTubeRequest(session, message);
    }

    if (intent.intent === 'register_yes' || intent.intent === 'register_no') {
        // User might be responding to a registration prompt
        session.currentFlow = 'registration';
        return handleRegistrationFlow(session, message, intent);
    }

    // General conversation - use Gemini
    session.currentFlow = 'general_chat';
    const response = await gemini.generateResponse(message, session.conversationHistory, {
        userName: session.profile.fullName,
        currentFlow: 'general_chat'
    });
    return response;
}

/**
 * Handle greeting for new or returning users
 */
function handleGreeting(session) {
    if (session.isRegistered && session.profile.fullName) {
        return `Welcome back, ${session.profile.fullName}! 🌿💚\n\nI'm AyurCare AI, your Ayurvedic health companion.\n\nHow can I help you today?\n\n• Tell me about any health concerns\n• Book a doctor consultation\n• Get Ayurvedic wellness tips\n• Check your appointment status\n\nJust type what's on your mind! 😊`;
    }

    session.currentFlow = 'registration';
    session.registrationStep = 'ask_register';
    return `Namaste! 🙏🌿 Welcome to AyurCare AI!\n\nI'm your personal Ayurvedic health assistant on WhatsApp. I can help you with:\n\n• Understanding your health concerns\n• Getting Ayurvedic wellness guidance\n• Booking expert doctor consultations\n\nHave you already registered with us? If not, it only takes a minute! 😊`;
}

// ============================================================
// REGISTRATION FLOW
// ============================================================

async function handleRegistrationFlow(session, message, intent) {
    const step = session.registrationStep;

    // Handle "ask_register" step
    if (step === 'ask_register' || step === 'none') {
        if (intent.intent === 'register_yes' || intent.intent === 'confirmation_yes') {
            session.registrationStep = 'completed';
            session.isRegistered = true;
            session.currentFlow = 'idle';
            return `Great, welcome back! 💚\n\nHow can I help you today? You can:\n• Tell me about any health concerns\n• Book a doctor consultation\n• Ask me anything about Ayurveda`;
        }

        if (intent.intent === 'register_no' || intent.intent === 'confirmation_no') {
            session.registrationStep = 'collect_name';
            return "No worries! Let's get you set up quickly. 😊\n\nCould you please share your full name?";
        }

        // Default - ask to register
        session.registrationStep = 'collect_name';
        return "Let's get you registered quickly! It'll help me assist you better. 😊\n\nCould you please share your full name?";
    }

    if (step === 'collect_name') {
        session.profile.fullName = message.trim();
        session.registrationStep = 'collect_age';
        return `Nice to meet you, ${session.profile.fullName}! 🌟\n\nCould you share your age?`;
    }

    if (step === 'collect_age') {
        const age = parseInt(message.trim());
        if (isNaN(age) || age < 1 || age > 150) {
            return "Hmm, that doesn't look like a valid age. Could you please enter your age as a number? (e.g., 28)";
        }
        session.profile.age = age;
        session.registrationStep = 'collect_gender';
        return "Got it! And what's your gender?\n\n• Male\n• Female\n• Other";
    }

    if (step === 'collect_gender') {
        const gender = message.trim().toLowerCase();
        if (['male', 'female', 'other', 'm', 'f'].includes(gender)) {
            session.profile.gender = gender === 'm' ? 'Male' : gender === 'f' ? 'Female' : gender.charAt(0).toUpperCase() + gender.slice(1);
        } else {
            session.profile.gender = message.trim();
        }
        session.registrationStep = 'collect_location';
        return "Where are you located? Just your city name is fine! 📍";
    }

    if (step === 'collect_location') {
        session.profile.location = message.trim();
        session.registrationStep = 'collect_conditions';
        return "Almost done! Do you have any known medical conditions I should be aware of?\n\n(You can type 'None' or 'Skip' if you prefer not to share)";
    }

    if (step === 'collect_conditions') {
        const lower = message.trim().toLowerCase();
        if (lower === 'none' || lower === 'skip' || lower === 'no') {
            session.profile.medicalConditions = 'None specified';
        } else {
            session.profile.medicalConditions = message.trim();
        }

        session.registrationStep = 'completed';
        session.isRegistered = true;
        session.currentFlow = 'idle';

        return `You're all set, ${session.profile.fullName}! 🎉✨\n\nHere's what I have:\n• Name: ${session.profile.fullName}\n• Age: ${session.profile.age}\n• Gender: ${session.profile.gender}\n• Location: ${session.profile.location}\n\nNow, how can I help you today?\n\n• Tell me about any health concerns\n• Book a doctor consultation\n• Get Ayurvedic wellness tips`;
    }

    // Fallback
    session.registrationStep = 'collect_name';
    return "Let's start your registration! Could you please share your full name? 😊";
}

// ============================================================
// HEALTH CONSULTATION FLOW
// ============================================================

async function handleHealthConsultation(session, message, intent) {
    const step = session.healthData.consultationStep;

    if (step === 'ask_symptoms' || step === 'none') {
        if (session.healthData.symptoms) {
            // Already have symptoms from idle handler
            session.healthData.consultationStep = 'ask_duration';
            return `I understand you're dealing with: "${session.healthData.symptoms}" 🤔\n\nI'm sorry to hear that. Let me ask a few questions to better understand your situation.\n\nHow long have you been experiencing this?`;
        }
        session.healthData.symptoms = message;
        session.healthData.consultationStep = 'ask_duration';
        return `Thank you for sharing that with me. 💚\n\nI want to understand this better to help you. How long have you been experiencing these symptoms?`;
    }

    if (step === 'ask_duration') {
        session.healthData.duration = message;
        session.healthData.consultationStep = 'ask_severity';
        return "Got it. On a scale of 1-10, how would you rate the severity?\n\n(1 = very mild, 10 = very severe)";
    }

    if (step === 'ask_severity') {
        session.healthData.severity = message;
        session.healthData.consultationStep = 'ask_lifestyle';
        return "Thank you. Can you briefly describe your daily routine?\n\nFor example: your sleep pattern, diet, stress level, and exercise habits.";
    }

    if (step === 'ask_lifestyle') {
        session.healthData.lifestyle = message;
        session.healthData.consultationStep = 'ask_history';
        return "Do you have any past medical conditions or surgeries I should know about?\n\n(Type 'None' if not applicable)";
    }

    if (step === 'ask_history') {
        session.healthData.medicalHistory = message;
        session.healthData.consultationStep = 'ask_medications';
        return "Are you currently taking any medications or supplements?\n\n(Type 'None' if not applicable)";
    }

    if (step === 'ask_medications') {
        session.healthData.currentMedications = message;
        session.healthData.consultationStep = 'analysis_complete';

        // Perform AI analysis
        const analysis = await gemini.analyzeHealthConcern(session.healthData);
        session.healthData.aiAnalysis = analysis.analysis;
        session.healthData.identifiedCategory = analysis.category;

        const responseLines = [
            `🌿 *Ayurvedic Insight*\n`,
            analysis.analysis,
            `\n\nBased on this, I'd recommend consulting an Ayurvedic doctor specializing in ${analysis.suggestedSpecialization}.`,
            `\nWould you like me to find available doctors for you? 🩺`
        ];

        return responseLines.join('\n');
    }

    if (step === 'analysis_complete') {
        if (intent.intent === 'confirmation_yes' || intent.intent === 'book_doctor' ||
            message.toLowerCase().includes('yes') || message.toLowerCase().includes('sure') ||
            message.toLowerCase().includes('doctor')) {
            session.currentFlow = 'doctor_matching';
            session.doctorMatching.matchingStep = 'showing_doctors';
            return await findAndPresentDoctors(session);
        }

        if (intent.intent === 'youtube_request' || message.toLowerCase().includes('video')) {
            return await handleYouTubeRequest(session, session.healthData.identifiedCategory);
        }

        // User doesn't want to book
        session.currentFlow = 'idle';
        return "No problem at all! 😊\n\nRemember, you can always come back to:\n• Discuss health concerns\n• Book a doctor consultation\n• Get wellness tips\n\nTake care and stay healthy! 🌿💚";
    }

    // Fallback to general conversation
    const response = await gemini.generateResponse(message, session.conversationHistory, {
        userName: session.profile.fullName,
        healthData: session.healthData,
        currentFlow: 'health_consultation'
    });
    return response;
}

// ============================================================
// DOCTOR MATCHING FLOW
// ============================================================

async function findAndPresentDoctors(session) {
    try {
        const category = session.healthData.identifiedCategory || 'General';

        // Search doctors from both collections
        const doctors = await Doctor.find().limit(20);
        const doctorDataEntries = await DoctorData.find().limit(20);

        // Combine and format doctors
        let allDoctors = [];

        doctors.forEach(doc => {
            allDoctors.push({
                id: doc._id.toString(),
                name: `Dr. ${doc.firstName} ${doc.lastName}`,
                specialization: Array.isArray(doc.specialization) ? doc.specialization.join(', ') : doc.specialization || 'General',
                experience: doc.experience ? `${doc.experience} years` : 'N/A',
                price: doc.price || 0,
                email: doc.email,
                source: 'Doctor'
            });
        });

        doctorDataEntries.forEach(doc => {
            allDoctors.push({
                id: doc._id.toString(),
                name: `Dr. ${doc.firstname} ${doc.lastname}`,
                specialization: Array.isArray(doc.specialization) ? doc.specialization.join(', ') : doc.specialization || 'General',
                experience: doc.experience ? `${doc.experience} years` : 'N/A',
                price: doc.fee || 0,
                email: doc.email,
                source: 'DoctorData'
            });
        });

        // Filter by relevance to category (case-insensitive matching)
        const categoryLower = category.toLowerCase();
        let relevantDoctors = allDoctors.filter(d => {
            const specLower = d.specialization.toLowerCase();
            return specLower.includes(categoryLower) ||
                categoryLower.includes(specLower) ||
                specLower.includes('general') ||
                specLower.includes('ayurved');
        });

        // If no matching specialists, show all doctors
        if (relevantDoctors.length === 0) {
            relevantDoctors = allDoctors;
        }

        // Take top 5
        const topDoctors = relevantDoctors.slice(0, 5);
        session.doctorMatching.matchedDoctors = topDoctors;

        if (topDoctors.length === 0) {
            session.currentFlow = 'idle';
            return "I'm sorry, I couldn't find any available doctors at the moment. 😔\n\nPlease try again later or contact us through our website. Our team will get back to you soon!";
        }

        // Format doctor list
        let doctorList = `🩺 Here are the best Ayurvedic doctors for your concern:\n\n`;

        topDoctors.forEach((doc, idx) => {
            doctorList += `${idx + 1}️⃣ ${doc.name}\n`;
            doctorList += `   • Specialization: ${doc.specialization}\n`;
            doctorList += `   • Experience: ${doc.experience}\n`;
            doctorList += `   • Fee: ₹${doc.price}\n\n`;
        });

        doctorList += `\nWhich doctor would you like to consult? Reply with the number (1-${topDoctors.length}).`;

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
        // User should be selecting a doctor by number
        const selection = parseInt(message.trim());
        const doctors = session.doctorMatching.matchedDoctors;

        if (isNaN(selection) || selection < 1 || selection > doctors.length) {
            return `Please reply with a number between 1 and ${doctors.length} to select a doctor. 😊`;
        }

        const selectedDoctor = doctors[selection - 1];
        session.doctorMatching.selectedDoctorId = selectedDoctor.id;
        session.doctorMatching.selectedDoctorName = selectedDoctor.name;
        session.doctorMatching.matchingStep = 'doctor_selected';

        // Generate available time slots
        const slots = generateAvailableSlots();

        let slotMessage = `Great choice! ${selectedDoctor.name} is an excellent doctor. 👨‍⚕️\n\n`;
        slotMessage += `📅 Available time slots:\n\n`;

        slots.forEach((slot, idx) => {
            slotMessage += `${idx + 1}. ${slot}\n`;
        });

        slotMessage += `\nWhich slot works for you? Reply with the number.`;

        // Store slots temporarily
        session.bookingData.availableSlots = slots;
        session.currentFlow = 'booking';
        session.bookingData.bookingStep = 'select_slot';

        return slotMessage;
    }

    // Fallback
    return await findAndPresentDoctors(session);
}

// ============================================================
// BOOKING FLOW
// ============================================================

function generateAvailableSlots() {
    const now = new Date();
    const slots = [];

    const times = ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'];

    for (let dayOffset = 1; dayOffset <= 3; dayOffset++) {
        const date = new Date(now);
        date.setDate(date.getDate() + dayOffset);
        const dateStr = date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

        // Pick 2 random slots per day
        const shuffled = times.sort(() => 0.5 - Math.random());
        slots.push(`${dateStr} - ${shuffled[0]}`);
        slots.push(`${dateStr} - ${shuffled[1]}`);
    }

    return slots;
}

async function handleBookingFlow(session, message, intent) {
    const step = session.bookingData.bookingStep;

    if (step === 'select_slot') {
        const selection = parseInt(message.trim());
        const slots = session.bookingData.availableSlots || generateAvailableSlots();

        if (isNaN(selection) || selection < 1 || selection > slots.length) {
            return `Please reply with a number between 1 and ${slots.length} to select a time slot. 😊`;
        }

        const selectedSlot = slots[selection - 1];
        session.bookingData.selectedSlot = selectedSlot;
        session.bookingData.bookingStep = 'confirm';

        const doctor = session.doctorMatching.selectedDoctorName || 'the doctor';

        return `📋 Booking Summary:\n\n` +
            `👨‍⚕️ Doctor: ${doctor}\n` +
            `📅 Slot: ${selectedSlot}\n` +
            `🏥 Concern: ${session.healthData.symptoms || 'General consultation'}\n` +
            `💰 Fee: ₹${session.doctorMatching.matchedDoctors?.find(d => d.id === session.doctorMatching.selectedDoctorId?.toString())?.price || 'N/A'}\n\n` +
            `Shall I confirm this appointment for you? (Yes/No)`;
    }

    if (step === 'confirm') {
        if (intent.intent === 'confirmation_yes' || message.toLowerCase().includes('yes') ||
            message.toLowerCase().includes('confirm') || message.toLowerCase().includes('sure')) {

            // Create the booking
            try {
                const bookingResult = await createBookingFromWhatsApp(session);
                session.bookingData.bookingStep = 'booked';
                session.currentFlow = 'idle';

                // Reset health data for next consultation
                session.healthData = {
                    symptoms: '', duration: '', severity: '', lifestyle: '',
                    medicalHistory: '', currentMedications: '', consultationStep: 'none',
                    aiAnalysis: '', identifiedCategory: ''
                };

                return `🎉 Your appointment has been booked successfully!\n\n` +
                    `📋 Booking Details:\n` +
                    `👨‍⚕️ Doctor: ${session.doctorMatching.selectedDoctorName}\n` +
                    `📅 Slot: ${session.bookingData.selectedSlot}\n` +
                    `📌 Status: Pending Confirmation\n\n` +
                    `Your request has been sent to the doctor. You'll be notified once it's approved! 🔔\n\n` +
                    `You can check your appointment status anytime by just asking me here. 💚`;
            } catch (error) {
                console.error('Booking creation error:', error);
                return "I'm sorry, there was an issue creating your booking. Please try again or visit our website to book directly. 🙏";
            }
        }

        if (intent.intent === 'confirmation_no' || message.toLowerCase().includes('no') ||
            message.toLowerCase().includes('cancel')) {
            session.bookingData.bookingStep = 'none';
            session.currentFlow = 'idle';
            return "No problem! The booking has been cancelled. 😊\n\nFeel free to come back anytime you'd like to book a consultation. I'm always here to help! 🌿💚";
        }

        return "Would you like me to confirm this appointment? Please reply with Yes or No. 😊";
    }

    // Fallback
    session.currentFlow = 'idle';
    return "It seems like we got a bit off track. How can I help you? 😊\n\n• Tell me about health concerns\n• Book a doctor\n• Get wellness tips";
}

/**
 * Create a booking in the database from WhatsApp conversation
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

        if (!doctor) {
            throw new Error('Doctor not found');
        }

        const doctorName = isDoctorData
            ? `${doctor.firstname} ${doctor.lastname}`
            : `${doctor.firstName} ${doctor.lastName}`;

        const doctorEmail = doctor.email;

        // Parse the selected slot to extract date and time
        const slotParts = session.bookingData.selectedSlot.split(' - ');
        const timeSlot = slotParts.length > 1 ? slotParts[1] : session.bookingData.selectedSlot;

        // Create a date from the slot
        const appointmentDate = new Date();
        appointmentDate.setDate(appointmentDate.getDate() + 1); // Default to tomorrow

        // Try to find or create a patient link
        let patientId = session.patientId;
        let patientEmail = `whatsapp_${session.phoneNumber}@ayurvedic.app`;
        let patientName = session.profile.fullName || 'WhatsApp User';

        if (!patientId) {
            // Check if patient exists by phone
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
            patientId: patientId || doctor._id, // Fallback to doctor ID if no patient
            patientEmail,
            patientName,
            patientGender: session.profile.gender || 'Not specified',
            patientAge: session.profile.age || 0,
            patientIllness: session.healthData.symptoms || 'General consultation',
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
// UTILITY HANDLERS
// ============================================================

async function handleCheckBooking(session) {
    try {
        if (!session.patientId) {
            return "I don't have any booking records linked to your WhatsApp account. 📋\n\nIf you've booked through our website, please check there or share your booking ID with me.";
        }

        const bookings = await Booking.find({ patientId: session.patientId })
            .sort({ createdAt: -1 })
            .limit(3);

        if (bookings.length === 0) {
            return "You don't have any recent bookings. Would you like to book a consultation now? 🩺";
        }

        let response = "📋 Your Recent Appointments:\n\n";
        bookings.forEach((booking, idx) => {
            const status = booking.requestAccept === 'accepted' ? '✅ Confirmed' :
                booking.requestAccept === 'denied' ? '❌ Denied' : '⏳ Pending';
            response += `${idx + 1}. Dr. ${booking.doctorName}\n`;
            response += `   📅 ${new Date(booking.dateOfAppointment).toLocaleDateString('en-IN')}\n`;
            response += `   ⏰ ${booking.timeSlot}\n`;
            response += `   Status: ${status}\n`;
            if (booking.meetLink && booking.meetLink !== 'no' && booking.meetLink !== 'pending') {
                response += `   🔗 Meet: ${booking.meetLink}\n`;
            }
            response += '\n';
        });

        return response;
    } catch (error) {
        console.error('Check Booking Error:', error);
        return "I had trouble checking your bookings. Please try again. 🙏";
    }
}

async function handleYouTubeRequest(session, message) {
    const topic = session.healthData.identifiedCategory || message;
    const recommendations = await gemini.getYouTubeRecommendations(topic);

    if (recommendations.videos.length === 0) {
        return "I couldn't find specific video recommendations right now. Try searching for Ayurvedic remedies on YouTube! 📺🌿";
    }

    let response = `🎥 Here are some helpful Ayurvedic videos for you:\n\n`;

    recommendations.videos.forEach((video, idx) => {
        response += `${idx + 1}. ${video.title}\n`;
        response += `   ${video.description}\n`;
        response += `   📺 ${video.type === 'long-form' ? 'Detailed Guide' : 'Quick Tips'}\n`;
        response += `   🔗 ${video.link}\n\n`;
    });

    response += "I hope these help! Would you like to discuss anything else? 😊";
    return response;
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
