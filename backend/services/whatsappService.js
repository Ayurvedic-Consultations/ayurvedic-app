const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";

let client = null;

const getClient = () => {
    if (!client && accountSid && authToken) {
        client = twilio(accountSid, authToken);
    }
    return client;
};

/**
 * Send a plain text message via WhatsApp
 */
const sendTextMessage = async (to, body) => {
    try {
        const twilioClient = getClient();
        if (!twilioClient) {
            console.warn("⚠️ Twilio not configured. Message not sent:", body);
            return null;
        }

        const formattedTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

        const message = await twilioClient.messages.create({
            from: whatsappNumber,
            to: formattedTo,
            body: body,
        });

        console.log(`✅ WhatsApp message sent to ${formattedTo}: ${message.sid}`);
        return message;
    } catch (error) {
        console.error("❌ Error sending WhatsApp message:", error.message);
        return null;
    }
};

/**
 * Send booking confirmation message
 */
const sendBookingConfirmation = async (to, bookingData) => {
    const body =
        `✅ *Appointment Booked Successfully!*\n\n` +
        `👨‍⚕️ Doctor: Dr. ${bookingData.doctorName}\n` +
        `📅 Date: ${new Date(bookingData.dateOfAppointment).toLocaleDateString("en-IN")}\n` +
        `⏰ Time: ${bookingData.timeSlot}\n` +
        `🆔 Booking ID: ${bookingData._id}\n` +
        `💰 Amount: ₹${bookingData.amountPaid}\n\n` +
        `You will receive a confirmation once the doctor accepts your appointment.`;

    return sendTextMessage(to, body);
};

/**
 * Send meet link when doctor accepts
 */
const sendMeetLink = async (to, bookingData) => {
    const body =
        `🎉 *Appointment Confirmed!*\n\n` +
        `Dr. ${bookingData.doctorName} has accepted your appointment.\n\n` +
        `📅 Date: ${new Date(bookingData.dateOfAppointment).toLocaleDateString("en-IN")}\n` +
        `⏰ Time: ${bookingData.timeSlot}\n` +
        `🔗 Meeting Link: ${bookingData.meetLink}\n\n` +
        `Please join the meeting at the scheduled time. Stay healthy! 🌿`;

    return sendTextMessage(to, body);
};

/**
 * Send booking denied notification
 */
const sendBookingDenied = async (to, bookingData, reason) => {
    const body =
        `❌ *Appointment Update*\n\n` +
        `Unfortunately, Dr. ${bookingData.doctorName} could not accept your appointment for ${bookingData.timeSlot}.\n\n` +
        (reason ? `Reason: ${reason}\n\n` : "") +
        `Please book another slot at your convenience.`;

    return sendTextMessage(to, body);
};

/**
 * Send appointment reminder
 */
const sendReminder = async (to, bookingData) => {
    const body =
        `⏰ *Appointment Reminder*\n\n` +
        `Your consultation with Dr. ${bookingData.doctorName} is coming up!\n\n` +
        `📅 Date: ${new Date(bookingData.dateOfAppointment).toLocaleDateString("en-IN")}\n` +
        `⏰ Time: ${bookingData.timeSlot}\n` +
        (bookingData.meetLink && bookingData.meetLink !== "no"
            ? `🔗 Meeting Link: ${bookingData.meetLink}\n\n`
            : "\n") +
        `Don't forget to join on time! 🌿`;

    return sendTextMessage(to, body);
};

/**
 * Send prescription notification
 */
const sendPrescriptionNotification = async (to, doctorName, medicineName) => {
    const body =
        `💊 *New Prescription*\n\n` +
        `Dr. ${doctorName} has prescribed *${medicineName}* for you.\n\n` +
        `Login to the platform to view the full prescription details and dosage instructions.`;

    return sendTextMessage(to, body);
};

module.exports = {
    sendTextMessage,
    sendBookingConfirmation,
    sendMeetLink,
    sendBookingDenied,
    sendReminder,
    sendPrescriptionNotification,
};
