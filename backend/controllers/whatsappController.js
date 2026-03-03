const WhatsAppSession = require("../models/WhatsAppSession");
const Patient = require("../models/Patient");
const { processMessage } = require("../services/whatsappBotService");
const { transcribeAudio, mapDetectedLanguage } = require("../services/speechService");
const { sendTextMessage } = require("../services/whatsappService");
const QRCode = require("qrcode");

/**
 * POST /api/whatsapp/webhook
 * Main Twilio webhook — receives all inbound WhatsApp messages (text + audio)
 */
exports.handleInboundWebhook = async (req, res) => {
    try {
        const {
            From: from,
            Body: body,
            NumMedia: numMedia,
            MediaUrl0: mediaUrl,
            MediaContentType0: mediaType,
        } = req.body;

        console.log(`📩 WhatsApp message from ${from}: ${body || "[media]"}`);

        let messageText = body || "";

        // Handle audio/voice notes
        if (parseInt(numMedia) > 0 && mediaType && mediaType.includes("audio")) {
            console.log("🎤 Processing voice note...");

            // Get patient's preferred language for better transcription
            const session = await WhatsAppSession.findOne({
                whatsappNumber: from,
                isActive: true,
            });
            const preferredLang = session?.preferredLanguage || "en";

            const transcription = await transcribeAudio(mediaUrl, preferredLang);

            if (transcription.text) {
                messageText = transcription.text;
                console.log(`🎤 Transcribed: ${messageText}`);
            } else {
                // Send error message via Twilio
                await sendTextMessage(
                    from,
                    "🎤 Sorry, I couldn't understand the voice note. Please try again or type your message."
                );
                return res.status(200).send("<Response></Response>");
            }
        }

        if (!messageText.trim()) {
            await sendTextMessage(from, "Please send a text or voice message.");
            return res.status(200).send("<Response></Response>");
        }

        // Process the message through the bot
        const result = await processMessage(from, messageText);

        // Send the reply back via Twilio
        if (result.reply) {
            await sendTextMessage(from, result.reply);
        }

        // TwiML empty response (we send messages via REST API, not TwiML)
        res.status(200).set("Content-Type", "text/xml").send("<Response></Response>");
    } catch (error) {
        console.error("❌ Webhook error:", error);
        res.status(200).set("Content-Type", "text/xml").send("<Response></Response>");
    }
};

/**
 * GET /api/whatsapp/webhook
 * Twilio webhook verification (not always needed for Twilio, but good practice)
 */
exports.verifyWebhook = (req, res) => {
    res.status(200).send("Webhook is active");
};

/**
 * POST /api/whatsapp/link
 * Link a patient account to a WhatsApp number — called from frontend
 * Body: { patientId }
 * Returns: QR code data URL and deep link
 */
exports.linkWhatsApp = async (req, res) => {
    try {
        const { patientId } = req.body;

        if (!patientId) {
            return res.status(400).json({ error: "Patient ID is required" });
        }

        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }

        // Generate the WhatsApp deep link
        const whatsappNumber = (
            process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886"
        ).replace("whatsapp:", "");

        const linkMessage = `LINK:${patientId}`;
        const deepLink = `https://wa.me/${whatsappNumber.replace("+", "")}?text=${encodeURIComponent(linkMessage)}`;

        // Generate QR code as data URL
        const qrCodeDataUrl = await QRCode.toDataURL(deepLink, {
            width: 300,
            margin: 2,
            color: {
                dark: "#075E54", // WhatsApp green
                light: "#FFFFFF",
            },
        });

        return res.status(200).json({
            message: "QR code generated",
            qrCode: qrCodeDataUrl,
            deepLink: deepLink,
            whatsappNumber: whatsappNumber,
            isLinked: patient.whatsappLinked || false,
        });
    } catch (error) {
        console.error("❌ Link generation error:", error);
        return res.status(500).json({ error: "Server error" });
    }
};

/**
 * GET /api/whatsapp/link-status/:patientId
 * Check if a patient has WhatsApp linked
 */
exports.getLinkStatus = async (req, res) => {
    try {
        const { patientId } = req.params;

        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }

        const session = await WhatsAppSession.findOne({
            patientId,
            isActive: true,
        });

        return res.status(200).json({
            isLinked: patient.whatsappLinked || false,
            whatsappNumber: patient.whatsappNumber || null,
            preferredLanguage: session?.preferredLanguage || patient.preferredLanguage || "en",
            linkedAt: session?.linkedAt || null,
        });
    } catch (error) {
        console.error("❌ Link status error:", error);
        return res.status(500).json({ error: "Server error" });
    }
};

/**
 * DELETE /api/whatsapp/unlink/:patientId
 * Unlink WhatsApp from patient account
 */
exports.unlinkWhatsApp = async (req, res) => {
    try {
        const { patientId } = req.params;

        // Deactivate session
        await WhatsAppSession.updateMany(
            { patientId },
            { isActive: false }
        );

        // Update patient
        await Patient.findByIdAndUpdate(patientId, {
            whatsappLinked: false,
            whatsappNumber: null,
        });

        return res.status(200).json({ message: "WhatsApp unlinked successfully" });
    } catch (error) {
        console.error("❌ Unlink error:", error);
        return res.status(500).json({ error: "Server error" });
    }
};

/**
 * POST /api/whatsapp/send-notification
 * Internal endpoint to manually send a WhatsApp notification
 * Body: { patientId, message }
 */
exports.sendNotification = async (req, res) => {
    try {
        const { patientId, message } = req.body;

        if (!patientId || !message) {
            return res.status(400).json({ error: "patientId and message are required" });
        }

        const session = await WhatsAppSession.findOne({
            patientId,
            isActive: true,
        });

        if (!session) {
            return res.status(404).json({ error: "Patient has no active WhatsApp session" });
        }

        const result = await sendTextMessage(session.whatsappNumber, message);

        return res.status(200).json({
            message: "Notification sent",
            delivered: !!result,
        });
    } catch (error) {
        console.error("❌ Send notification error:", error);
        return res.status(500).json({ error: "Server error" });
    }
};

/**
 * POST /api/whatsapp/update-language
 * Update preferred language
 * Body: { patientId, language }
 */
exports.updateLanguage = async (req, res) => {
    try {
        const { patientId, language } = req.body;
        const validLangs = ["en", "hi", "bn", "ta", "te"];

        if (!validLangs.includes(language)) {
            return res.status(400).json({ error: "Invalid language. Use: en, hi, bn, ta, te" });
        }

        await Patient.findByIdAndUpdate(patientId, { preferredLanguage: language });
        await WhatsAppSession.updateMany(
            { patientId, isActive: true },
            { preferredLanguage: language }
        );

        return res.status(200).json({ message: "Language updated", language });
    } catch (error) {
        console.error("❌ Language update error:", error);
        return res.status(500).json({ error: "Server error" });
    }
};
