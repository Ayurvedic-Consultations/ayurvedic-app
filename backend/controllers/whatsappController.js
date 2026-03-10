const WhatsAppSession = require("../models/WhatsAppSession");
const Patient = require("../models/Patient");
const { processMessage } = require("../services/whatsappBotService");
const { transcribeAudio } = require("../services/speechService");
const { sendTextMessage } = require("../services/whatsappService");
const QRCode = require("qrcode");
const mongoose = require("mongoose");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * POST /api/whatsapp/webhook
 */
exports.handleInboundWebhook = async (req, res) => {
    try {
        const { From: from, Body: body, NumMedia: numMedia, MediaUrl0: mediaUrl, MediaContentType0: mediaType } = req.body;
        console.log(`📩 WhatsApp from ${from}: ${body || "[media]"}`);

        let messageText = body || "";

        if (parseInt(numMedia) > 0 && mediaType && mediaType.includes("audio")) {
            console.log("🎤 Processing voice note...");
            const session = await WhatsAppSession.findOne({ whatsappNumber: from, isActive: true });
            const transcription = await transcribeAudio(mediaUrl, session?.preferredLanguage || "en");
            if (transcription.text) {
                messageText = transcription.text;
            } else {
                await sendTextMessage(from, "🎤 Sorry, I couldn't understand the voice note. Please try again or type your message.");
                return res.status(200).send("<Response></Response>");
            }
        }

        if (!messageText.trim()) {
            await sendTextMessage(from, "Please send a text or voice message.");
            return res.status(200).send("<Response></Response>");
        }

        const result = await processMessage(from, messageText);
        if (result.reply) await sendTextMessage(from, result.reply);

        res.status(200).set("Content-Type", "text/xml").send("<Response></Response>");
    } catch (error) {
        console.error("❌ Webhook error:", error.message);
        res.status(200).set("Content-Type", "text/xml").send("<Response></Response>");
    }
};

/**
 * GET /api/whatsapp/webhook
 */
exports.verifyWebhook = (req, res) => {
    res.status(200).send("Webhook is active");
};

/**
 * POST /api/whatsapp/link
 */
exports.linkWhatsApp = async (req, res) => {
    try {
        const { patientId } = req.body;
        if (!patientId || !isValidObjectId(patientId)) {
            return res.status(400).json({ error: "Valid Patient ID is required" });
        }

        const patient = await Patient.findById(patientId);
        if (!patient) return res.status(404).json({ error: "Patient not found" });

        const whatsappNumber = (process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886").replace("whatsapp:", "");
        const linkMessage = `LINK:${patientId}`;
        const deepLink = `https://wa.me/${whatsappNumber.replace("+", "")}?text=${encodeURIComponent(linkMessage)}`;

        const qrCodeDataUrl = await QRCode.toDataURL(deepLink, {
            width: 300, margin: 2,
            color: { dark: "#075E54", light: "#FFFFFF" },
        });

        return res.status(200).json({
            message: "QR code generated",
            qrCode: qrCodeDataUrl,
            deepLink,
            whatsappNumber,
            isLinked: patient.whatsappLinked || false,
        });
    } catch (error) {
        console.error("❌ Link error:", error.message);
        return res.status(500).json({ error: "Server error: " + error.message });
    }
};

/**
 * GET /api/whatsapp/link-status/:patientId
 */
exports.getLinkStatus = async (req, res) => {
    try {
        const { patientId } = req.params;
        console.log(`🔍 Checking link status for patient ID: ${patientId}`);
        if (!isValidObjectId(patientId)) {
            console.log("❌ Invalid ObjectId");
            return res.status(200).json({ isLinked: false, whatsappNumber: null, preferredLanguage: "en", linkedAt: null });
        }

        const patient = await Patient.findById(patientId);
        if (!patient) {
            console.log("❌ Patient not found in DB");
            return res.status(200).json({ isLinked: false, whatsappNumber: null, preferredLanguage: "en", linkedAt: null });
        }

        console.log("✅ Patient found. whatsappLinked:", patient.whatsappLinked, "whatsappNumber:", patient.whatsappNumber);

        const session = await WhatsAppSession.findOne({ patientId, isActive: true });
        console.log("✅ Session found:", !!session);

        return res.status(200).json({
            isLinked: patient.whatsappLinked || false,
            whatsappNumber: patient.whatsappNumber || null,
            preferredLanguage: session?.preferredLanguage || patient.preferredLanguage || "en",
            linkedAt: session?.linkedAt || null,
        });
    } catch (error) {
        console.error("❌ Link status error:", error.message);
        return res.status(200).json({ isLinked: false, whatsappNumber: null, preferredLanguage: "en", linkedAt: null });
    }
};

/**
 * DELETE /api/whatsapp/unlink/:patientId
 */
exports.unlinkWhatsApp = async (req, res) => {
    try {
        const { patientId } = req.params;
        if (!isValidObjectId(patientId)) return res.status(400).json({ error: "Invalid Patient ID" });

        await WhatsAppSession.updateMany({ patientId }, { isActive: false });
        await Patient.findByIdAndUpdate(patientId, { whatsappLinked: false, whatsappNumber: null });

        return res.status(200).json({ message: "WhatsApp unlinked successfully" });
    } catch (error) {
        console.error("❌ Unlink error:", error.message);
        return res.status(500).json({ error: "Server error" });
    }
};

/**
 * POST /api/whatsapp/send-notification
 */
exports.sendNotification = async (req, res) => {
    try {
        const { patientId, message } = req.body;
        if (!patientId || !message) return res.status(400).json({ error: "patientId and message are required" });
        if (!isValidObjectId(patientId)) return res.status(400).json({ error: "Invalid Patient ID" });

        const session = await WhatsAppSession.findOne({ patientId, isActive: true });
        if (!session) return res.status(404).json({ error: "No active WhatsApp session" });

        const result = await sendTextMessage(session.whatsappNumber, message);
        return res.status(200).json({ message: "Notification sent", delivered: !!result });
    } catch (error) {
        console.error("❌ Send notification error:", error.message);
        return res.status(500).json({ error: "Server error" });
    }
};

/**
 * POST /api/whatsapp/update-language
 */
exports.updateLanguage = async (req, res) => {
    try {
        const { patientId, language } = req.body;
        const validLangs = ["en", "hi", "bn", "ta", "te"];
        if (!validLangs.includes(language)) return res.status(400).json({ error: "Invalid language" });
        if (!isValidObjectId(patientId)) return res.status(400).json({ error: "Invalid Patient ID" });

        await Patient.findByIdAndUpdate(patientId, { preferredLanguage: language });
        await WhatsAppSession.updateMany({ patientId, isActive: true }, { preferredLanguage: language });

        return res.status(200).json({ message: "Language updated", language });
    } catch (error) {
        console.error("❌ Language update error:", error.message);
        return res.status(500).json({ error: "Server error" });
    }
};
