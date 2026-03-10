const { GoogleGenerativeAI } = require("@google/generative-ai");
const WhatsAppSession = require("../models/WhatsAppSession");
const Doctor = require("../models/Doctor");
const DoctorData = require("../models/DoctorData");
const Booking = require("../models/Booking");
const Patient = require("../models/Patient");
const ytSearch = require("yt-search");
const { translateToLanguage, detectAndTranslateToEnglish } = require("./translationService");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const LANGUAGE_NAMES = {
    en: "English", hi: "Hindi", bn: "Bengali", ta: "Tamil", te: "Telugu",
};

/**
 * Process an incoming message from a WhatsApp user
 */
const processMessage = async (whatsappNumber, messageText) => {
    try {
        // Find or identify session
        let session = await WhatsAppSession.findOne({ whatsappNumber, isActive: true });

        if (!session) {
            // Check if this is a LINK message
            if (messageText.startsWith("LINK:")) {
                return await handleLinkMessage(whatsappNumber, messageText);
            }
            return {
                reply: "👋 Welcome to *Ayurvedic Consultations*!\n\nTo get started, please link your account by scanning the QR code on our website.\n\nVisit: " + (process.env.FRONTEND_URL || "http://localhost:3000") + " and go to your Patient Dashboard.",
            };
        }

        // Update last message time
        session.lastMessageAt = new Date();

        // Detect and translate incoming message to English for processing
        const { translatedText, detectedLanguage } = await detectAndTranslateToEnglish(messageText);

        // Auto-update language preference if detected language is different
        if (detectedLanguage !== "en" && detectedLanguage !== session.preferredLanguage) {
            session.preferredLanguage = detectedLanguage;
        }

        const lang = session.preferredLanguage;

        // Check for language change command
        const langChangeMatch = messageText.toLowerCase().match(/^(language|lang|भाषा)[\s:]+(.+)$/i);
        if (langChangeMatch) {
            return await handleLanguageChange(session, langChangeMatch[2].trim());
        }

        // Check for special commands
        const lowerText = translatedText.toLowerCase().trim();

        if (lowerText === "help" || lowerText === "menu" || lowerText === "hi" || lowerText === "hello") {
            return await sendMainMenu(session);
        }

        if (lowerText === "cancel" || lowerText === "exit" || lowerText === "quit") {
            session.conversationState = "idle";
            session.bookingDraft = {};
            await session.save();
            const reply = await translateToLanguage("Operation cancelled. Send 'menu' to see options.", lang);
            return { reply };
        }

        if (lowerText === "status" || lowerText === "my appointments" || lowerText === "my bookings") {
            return await handleCheckStatus(session);
        }

        // Handle state machine flow
        switch (session.conversationState) {
            case "idle":
                return await handleIdleState(session, translatedText, lowerText);
            case "booking_flow":
            case "awaiting_doctor":
                return await handleAwaitingDoctor(session, translatedText);
            case "awaiting_date":
                return await handleAwaitingDate(session, translatedText);
            case "awaiting_time":
                return await handleAwaitingTime(session, translatedText);
            case "awaiting_illness":
                return await handleAwaitingIllness(session, translatedText);
            case "awaiting_confirm":
                return await handleAwaitingConfirm(session, translatedText, lowerText);
            default:
                session.conversationState = "idle";
                await session.save();
                return await sendMainMenu(session);
        }
    } catch (error) {
        console.error("❌ Bot error:", error);
        return { reply: "Sorry, something went wrong. Please try again or type 'menu' for options." };
    }
};

/**
 * Handle LINK message — link WhatsApp number to patient account
 */
const handleLinkMessage = async (whatsappNumber, messageText) => {
    try {
        const patientId = messageText.replace("LINK:", "").trim();
        const patient = await Patient.findById(patientId);

        if (!patient) {
            return { reply: "❌ Invalid link code. Please try scanning the QR code again from the website." };
        }

        // Check if this number is already linked to another account
        const existingSession = await WhatsAppSession.findOne({ whatsappNumber });
        if (existingSession) {
            existingSession.patientId = patient._id;
            existingSession.isActive = true;
            existingSession.linkedAt = new Date();
            await existingSession.save();
        } else {
            await WhatsAppSession.create({
                patientId: patient._id,
                whatsappNumber,
                preferredLanguage: patient.preferredLanguage || "en",
            });
        }

        // Update patient record
        patient.whatsappNumber = whatsappNumber;
        patient.whatsappLinked = true;
        await patient.save();

        return {
            reply:
                `✅ *Account Linked Successfully!*\n\n` +
                `Hello ${patient.firstName}! Your WhatsApp is now connected to your Ayurvedic Consultations account.\n\n` +
                `You can now:\n` +
                `📋 Book appointments\n` +
                `📊 Check booking status\n` +
                `🔔 Receive notifications\n\n` +
                `Type *menu* to see all options.\n` +
                `Type *language: hindi* to change language.`,
        };
    } catch (error) {
        console.error("❌ Link error:", error);
        return { reply: "❌ Failed to link account. Please try again." };
    }
};

/**
 * Handle language change command
 */
const handleLanguageChange = async (session, langInput) => {
    const langMap = {
        english: "en", en: "en",
        hindi: "hi", hi: "hi", हिंदी: "hi", हिन्दी: "hi",
        bengali: "bn", bn: "bn", বাংলা: "bn", bangla: "bn",
        tamil: "ta", ta: "ta", தமிழ்: "ta",
        telugu: "te", te: "te", తెలుగు: "te",
    };

    const lang = langMap[langInput.toLowerCase()];
    if (!lang) {
        return {
            reply: "❌ Unsupported language. Supported: English, Hindi, Bengali, Tamil, Telugu.\n\nExample: *language: hindi*",
        };
    }

    session.preferredLanguage = lang;
    await session.save();

    // Update patient too
    await Patient.findByIdAndUpdate(session.patientId, { preferredLanguage: lang });

    const langName = LANGUAGE_NAMES[lang];
    const reply = await translateToLanguage(`Language changed to ${langName}. All messages will now be in ${langName}.`, lang);
    return { reply: `✅ ${reply}` };
};

/**
 * Send main menu
 */
const sendMainMenu = async (session) => {
    const lang = session.preferredLanguage;
    let menu =
        `🌿 *Ayurvedic Consultations — WhatsApp Assistant*\n\n` +
        `Choose an option:\n\n` +
        `1️⃣ *Book Appointment* — Book a consultation with a doctor\n` +
        `2️⃣ *My Appointments* — Check your booking status\n` +
        `3️⃣ *Change Language* — Switch your preferred language\n` +
        `4️⃣ *Help* — Get assistance\n\n` +
        `Simply type the option number or describe what you need!\n\n` +
        `_Current language: ${LANGUAGE_NAMES[lang]}_`;

    if (lang !== "en") {
        menu = await translateToLanguage(menu, lang);
    }

    session.conversationState = "idle";
    await session.save();
    return { reply: menu };
};

/**
 * Handle idle state — detect user intent
 */
const handleIdleState = async (session, text, lowerText) => {
    const lang = session.preferredLanguage;

    // Intent detection using keywords and AI
    const bookingKeywords = ["book", "appointment", "consult", "doctor", "schedule", "1"];
    const statusKeywords = ["status", "check", "my appointment", "my booking", "2"];
    const langKeywords = ["language", "lang", "3"];

    if (bookingKeywords.some((k) => lowerText.includes(k)) || lowerText === "1") {
        return await startBookingFlow(session);
    }

    if (statusKeywords.some((k) => lowerText.includes(k)) || lowerText === "2") {
        return await handleCheckStatus(session);
    }

    if (langKeywords.some((k) => lowerText.includes(k)) || lowerText === "3") {
        let reply = "Please type your preferred language.\n\nSupported: English, Hindi, Bengali, Tamil, Telugu\n\nExample: *language: hindi*";
        if (lang !== "en") reply = await translateToLanguage(reply, lang);
        return { reply };
    }

    // Use Gemini to understand natural language intent
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `You are a WhatsApp chatbot for an Ayurvedic Consultation platform. The user said: "${text}"

Classify the intent as one of:
- BOOK_APPOINTMENT
- CHECK_STATUS
- CHANGE_LANGUAGE
- GREETING
- OTHER

Respond with ONLY the intent label.`;

        const result = await model.generateContent(prompt);
        const intent = result.response.text().trim().toUpperCase();

        if (intent === "BOOK_APPOINTMENT") return await startBookingFlow(session);
        if (intent === "CHECK_STATUS") return await handleCheckStatus(session);
        if (intent === "GREETING") return await sendMainMenu(session);
    } catch (e) {
        console.error("Intent detection error:", e.message);
    }

    // Default: show menu
    return await sendMainMenu(session);
};

/**
 * Start the booking flow — show available doctors
 */
const startBookingFlow = async (session) => {
    const lang = session.preferredLanguage;

    try {
        // Fetch doctors from both collections
        const doctors = await Doctor.find().select("firstName lastName specialization price _id");
        const doctorData = await DoctorData.find().select("firstname lastname specialization fee _id");

        const allDoctors = [
            ...doctors.map((d) => ({
                id: d._id,
                name: `Dr. ${d.firstName} ${d.lastName}`,
                spec: Array.isArray(d.specialization) ? d.specialization.join(", ") : d.specialization || "General",
                price: d.price,
                source: "Doctor",
            })),
            ...doctorData.map((d) => ({
                id: d._id,
                name: `Dr. ${d.firstname} ${d.lastname}`,
                spec: Array.isArray(d.specialization) ? d.specialization.join(", ") : d.specialization || "General",
                price: d.fee,
                source: "DoctorData",
            })),
        ];

        if (allDoctors.length === 0) {
            let reply = "😔 No doctors are available at the moment. Please try again later.";
            if (lang !== "en") reply = await translateToLanguage(reply, lang);
            return { reply };
        }

        // Store doctors list in draft for reference — stringify IDs for Mixed type
        const doctorsList = allDoctors.slice(0, 10).map(d => ({
            id: d.id.toString(),
            name: d.name,
            spec: d.spec,
            price: d.price,
            source: d.source,
        }));
        session.bookingDraft = { availableDoctors: doctorsList };
        session.markModified('bookingDraft');
        session.conversationState = "awaiting_doctor";
        await session.save();

        let doctorList = `👨‍⚕️ *Available Doctors*\n\n`;
        allDoctors.slice(0, 10).forEach((doc, i) => {
            doctorList += `${i + 1}️⃣ *${doc.name}*\n   📋 ${doc.spec}\n   💰 ₹${doc.price}\n\n`;
        });
        doctorList += `Reply with the *number* of the doctor you want to book with.`;

        if (lang !== "en") doctorList = await translateToLanguage(doctorList, lang);

        return { reply: doctorList };
    } catch (error) {
        console.error("Error fetching doctors:", error);
        return { reply: "❌ Unable to fetch doctors. Please try again." };
    }
};

/**
 * Handle doctor selection
 */
const handleAwaitingDoctor = async (session, text) => {
    const lang = session.preferredLanguage;
    const doctors = session.bookingDraft.availableDoctors || [];

    const num = parseInt(text.trim());
    if (isNaN(num) || num < 1 || num > doctors.length) {
        let reply = `Please reply with a number between 1 and ${doctors.length} to select a doctor.`;
        if (lang !== "en") reply = await translateToLanguage(reply, lang);
        return { reply };
    }

    const selected = doctors[num - 1];
    session.bookingDraft = {
        availableDoctors: session.bookingDraft.availableDoctors,
        doctorId: selected.id.toString(),
        doctorName: selected.name,
        doctorSource: selected.source,
        amountPaid: selected.price,
    };
    session.markModified('bookingDraft');
    session.conversationState = "awaiting_date";
    await session.save();

    let reply = `✅ Selected: *${selected.name}*\n\n📅 Please enter the *date* for your appointment.\n\nFormat: DD/MM/YYYY (e.g., 15/03/2026)`;
    if (lang !== "en") reply = await translateToLanguage(reply, lang);
    return { reply };
};

/**
 * Handle date input
 */
const handleAwaitingDate = async (session, text) => {
    const lang = session.preferredLanguage;

    // Try to parse date in various formats
    let date = null;
    const trimmed = text.trim();

    // DD/MM/YYYY or DD-MM-YYYY
    const dateMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (dateMatch) {
        date = new Date(`${dateMatch[3]}-${dateMatch[2].padStart(2, "0")}-${dateMatch[1].padStart(2, "0")}`);
    }

    // Natural language via Gemini
    if (!date || isNaN(date.getTime())) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const prompt = `Extract a date from this text: "${trimmed}". Today is ${new Date().toISOString().split("T")[0]}. Return ONLY the date in YYYY-MM-DD format. If no valid future date found, return "INVALID".`;
            const result = await model.generateContent(prompt);
            const dateStr = result.response.text().trim();
            if (dateStr !== "INVALID") {
                date = new Date(dateStr);
            }
        } catch (e) {
            console.error("Date parsing error:", e.message);
        }
    }

    if (!date || isNaN(date.getTime()) || date < new Date()) {
        let reply = "❌ Invalid or past date. Please enter a future date in DD/MM/YYYY format.\n\nExample: 15/03/2026";
        if (lang !== "en") reply = await translateToLanguage(reply, lang);
        return { reply };
    }

    session.bookingDraft = {
        ...session.bookingDraft.toObject ? session.bookingDraft.toObject() : session.bookingDraft,
        dateOfAppointment: date.toISOString(),
    };
    session.markModified('bookingDraft');
    session.conversationState = "awaiting_time";
    await session.save();

    let reply = `📅 Date: *${date.toLocaleDateString("en-IN")}*\n\n⏰ Please select a *time slot*:\n\n1️⃣ 9:00 AM - 10:00 AM\n2️⃣ 10:00 AM - 11:00 AM\n3️⃣ 11:00 AM - 12:00 PM\n4️⃣ 2:00 PM - 3:00 PM\n5️⃣ 3:00 PM - 4:00 PM\n6️⃣ 4:00 PM - 5:00 PM\n\nReply with the slot number.`;
    if (lang !== "en") reply = await translateToLanguage(reply, lang);
    return { reply };
};

/**
 * Handle time slot selection
 */
const handleAwaitingTime = async (session, text) => {
    const lang = session.preferredLanguage;

    const timeSlots = {
        1: "9:00 AM - 10:00 AM",
        2: "10:00 AM - 11:00 AM",
        3: "11:00 AM - 12:00 PM",
        4: "2:00 PM - 3:00 PM",
        5: "3:00 PM - 4:00 PM",
        6: "4:00 PM - 5:00 PM",
    };

    const num = parseInt(text.trim());
    if (isNaN(num) || !timeSlots[num]) {
        let reply = "Please reply with a number between 1 and 6 to select a time slot.";
        if (lang !== "en") reply = await translateToLanguage(reply, lang);
        return { reply };
    }

    session.bookingDraft = {
        ...session.bookingDraft.toObject ? session.bookingDraft.toObject() : session.bookingDraft,
        timeSlot: timeSlots[num],
    };
    session.markModified('bookingDraft');
    session.conversationState = "awaiting_illness";
    await session.save();

    let reply = `⏰ Time: *${timeSlots[num]}*\n\n🩺 Please describe your *health concern / illness* briefly.\n\nExample: "headaches and joint pain"`;
    if (lang !== "en") reply = await translateToLanguage(reply, lang);
    return { reply };
};

/**
 * Handle illness description
 */
const handleAwaitingIllness = async (session, text) => {
    const lang = session.preferredLanguage;

    if (text.trim().length < 3) {
        let reply = "Please describe your health concern in a few words.";
        if (lang !== "en") reply = await translateToLanguage(reply, lang);
        return { reply };
    }

    session.bookingDraft = {
        ...session.bookingDraft.toObject ? session.bookingDraft.toObject() : session.bookingDraft,
        patientIllness: text.trim(),
    };
    session.markModified('bookingDraft');
    session.conversationState = "awaiting_confirm";
    await session.save();

    // Build confirmation summary
    const draft = session.bookingDraft;
    const patient = await Patient.findById(session.patientId);

    let summary =
        `📋 *Booking Summary*\n\n` +
        `👨‍⚕️ Doctor: *${draft.doctorName}*\n` +
        `📅 Date: *${new Date(draft.dateOfAppointment).toLocaleDateString("en-IN")}*\n` +
        `⏰ Time: *${draft.timeSlot}*\n` +
        `🩺 Concern: *${draft.patientIllness}*\n` +
        `👤 Patient: *${patient?.firstName} ${patient?.lastName}*\n` +
        `💰 Fee: *₹${draft.amountPaid}*\n\n` +
        `Reply *YES* to confirm or *NO* to cancel.`;

    if (lang !== "en") summary = await translateToLanguage(summary, lang);
    return { reply: summary };
};

/**
 * Handle booking confirmation
 */
const handleAwaitingConfirm = async (session, text, lowerText) => {
    const lang = session.preferredLanguage;

    const yesWords = ["yes", "y", "confirm", "ok", "sure", "ha", "haan", "aam", "avunu", "aamam"];
    const noWords = ["no", "n", "cancel", "nahi", "na", "venda", "ledu"];

    if (noWords.some((w) => lowerText.includes(w))) {
        session.conversationState = "idle";
        session.bookingDraft = {};
        await session.save();
        let reply = "❌ Booking cancelled. Type *menu* to start over.";
        if (lang !== "en") reply = await translateToLanguage(reply, lang);
        return { reply };
    }

    if (!yesWords.some((w) => lowerText.includes(w))) {
        let reply = "Please reply *YES* to confirm or *NO* to cancel.";
        if (lang !== "en") reply = await translateToLanguage(reply, lang);
        return { reply };
    }

    // Create the actual booking
    try {
        const draft = session.bookingDraft;
        const patient = await Patient.findById(session.patientId);

        if (!patient) {
            return { reply: "❌ Patient account not found. Please re-link your WhatsApp." };
        }

        // Get doctor details
        let doctor = await Doctor.findById(draft.doctorId);
        let doctorEmail = doctor?.email;
        if (!doctor) {
            const dd = await DoctorData.findById(draft.doctorId);
            doctorEmail = dd?.email;
        }

        // Check for existing booking at same slot
        const existingBooking = await Booking.findOne({
            doctorId: draft.doctorId,
            timeSlot: draft.timeSlot,
            dateOfAppointment: draft.dateOfAppointment,
        });

        if (existingBooking) {
            session.conversationState = "awaiting_time";
            await session.save();
            let reply = "❌ This slot is already booked! Please choose a different time slot:\n\n1️⃣ 9:00 AM - 10:00 AM\n2️⃣ 10:00 AM - 11:00 AM\n3️⃣ 11:00 AM - 12:00 PM\n4️⃣ 2:00 PM - 3:00 PM\n5️⃣ 3:00 PM - 4:00 PM\n6️⃣ 4:00 PM - 5:00 PM";
            if (lang !== "en") reply = await translateToLanguage(reply, lang);
            return { reply };
        }

        // Create the booking
        console.log("📋 Creating booking with draft:", JSON.stringify(draft, null, 2));
        const newBooking = new Booking({
            doctorId: draft.doctorId,
            doctorName: draft.doctorName ? draft.doctorName.replace("Dr. ", "") : "Unknown",
            doctorEmail: doctorEmail || "doctor@platform.com",
            timeSlot: draft.timeSlot || "9:00 AM - 10:00 AM",
            dateOfAppointment: new Date(draft.dateOfAppointment),
            patientId: patient._id,
            patientEmail: patient.email || "patient@platform.com",
            patientName: `${patient.firstName || ""} ${patient.lastName || ""}`.trim() || "Patient",
            patientGender: patient.gender || "Not specified",
            patientAge: patient.age || 0,
            patientIllness: draft.patientIllness || "General consultation",
            meetLink: "no",
            amountPaid: draft.amountPaid || 0,
        });

        await newBooking.save();

        // Reset session state
        session.conversationState = "idle";
        session.bookingDraft = {};
        await session.save();

        let reply =
            `🎉 *Appointment Booked Successfully!*\n\n` +
            `🆔 Booking ID: ${newBooking._id}\n` +
            `👨‍⚕️ Doctor: ${draft.doctorName}\n` +
            `📅 Date: ${new Date(draft.dateOfAppointment).toLocaleDateString("en-IN")}\n` +
            `⏰ Time: ${draft.timeSlot}\n` +
            `💰 Amount: ₹${newBooking.amountPaid}\n\n` +
            `Status: ⏳ Pending doctor confirmation\n\n` +
            `You'll receive a notification when the doctor confirms and the meeting link is ready.\n\n`;

        // Add YouTube Video Suggestion
        try {
            const illness = draft.patientIllness || "General consultation";
            const searchResults = await ytSearch(illness + " ayurvedic cure");
            const videos = searchResults.videos;
            if (videos && videos.length > 0) {
                // sort by views descending
                videos.sort((a, b) => b.views - a.views);
                const bestVideo = videos[0];
                reply += `📺 *Helpful Video For Your Concern:*\nTitle: ${bestVideo.title}\nLink: ${bestVideo.url}\n\n`;
            }
        } catch (ytErr) {
            console.error("YouTube Search Error:", ytErr);
        }

        reply += `Type *menu* for more options.`;

        if (lang !== "en") reply = await translateToLanguage(reply, lang);
        return { reply, bookingCreated: newBooking };
    } catch (error) {
        console.error("❌ Booking creation error:", error);
        session.conversationState = "idle";
        session.bookingDraft = {};
        await session.save();
        return { reply: "❌ Failed to create booking. Please try again or book via the website." };
    }
};

/**
 * Handle checking appointment status
 */
const handleCheckStatus = async (session) => {
    const lang = session.preferredLanguage;

    try {
        const bookings = await Booking.find({ patientId: session.patientId })
            .sort({ createdAt: -1 })
            .limit(5);

        if (!bookings || bookings.length === 0) {
            let reply = "📋 You have no appointments yet. Type *book* to schedule one!";
            if (lang !== "en") reply = await translateToLanguage(reply, lang);
            return { reply };
        }

        let statusMsg = `📋 *Your Recent Appointments*\n\n`;

        bookings.forEach((b, i) => {
            const statusEmoji = {
                pending: "⏳",
                accepted: "✅",
                denied: "❌",
            };
            const emoji = statusEmoji[b.requestAccept] || "⏳";

            statusMsg += `${i + 1}. ${emoji} *Dr. ${b.doctorName}*\n`;
            statusMsg += `   📅 ${new Date(b.dateOfAppointment).toLocaleDateString("en-IN")} | ⏰ ${b.timeSlot}\n`;
            statusMsg += `   Status: ${b.requestAccept}\n`;
            if (b.meetLink && b.meetLink !== "no") {
                statusMsg += `   🔗 ${b.meetLink}\n`;
            }
            statusMsg += `\n`;
        });

        statusMsg += `Type *menu* for more options.`;

        if (lang !== "en") statusMsg = await translateToLanguage(statusMsg, lang);
        return { reply: statusMsg };
    } catch (error) {
        console.error("Status check error:", error);
        return { reply: "❌ Unable to fetch appointments. Please try again." };
    }
};

module.exports = {
    processMessage,
};
