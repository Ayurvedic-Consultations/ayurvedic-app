/**
 * WhatsApp Cloud API Service
 * Handles sending messages via Meta WhatsApp Business API
 */
const axios = require('axios');

const WHATSAPP_API_VERSION = 'v21.0';
const WHATSAPP_API_BASE = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

/**
 * Send a plain text message
 */
async function sendTextMessage(recipientPhone, message) {
    try {
        const url = `${WHATSAPP_API_BASE}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

        const body = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipientPhone,
            type: 'text',
            text: {
                preview_url: true,
                body: message
            }
        };

        const response = await axios.post(url, body, {
            headers: {
                'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`✅ Message sent to ${recipientPhone}`);
        return response.data;
    } catch (error) {
        console.error('❌ WhatsApp Send Error:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Send an interactive list message (for doctor selection, slot selection, etc.)
 */
async function sendListMessage(recipientPhone, headerText, bodyText, buttonText, sections) {
    try {
        const url = `${WHATSAPP_API_BASE}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

        const body = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipientPhone,
            type: 'interactive',
            interactive: {
                type: 'list',
                header: {
                    type: 'text',
                    text: headerText
                },
                body: {
                    text: bodyText
                },
                action: {
                    button: buttonText,
                    sections: sections
                }
            }
        };

        const response = await axios.post(url, body, {
            headers: {
                'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`✅ List message sent to ${recipientPhone}`);
        return response.data;
    } catch (error) {
        console.error('❌ WhatsApp List Send Error:', error.response?.data || error.message);
        // Fallback to text message
        const fallbackText = `${headerText}\n\n${bodyText}\n\nPlease reply with your choice number.`;
        return sendTextMessage(recipientPhone, fallbackText);
    }
}

/**
 * Send an interactive reply button message (for yes/no, quick selections - max 3 buttons)
 */
async function sendButtonMessage(recipientPhone, bodyText, buttons) {
    try {
        const url = `${WHATSAPP_API_BASE}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

        // WhatsApp allows max 3 buttons
        const formattedButtons = buttons.slice(0, 3).map((btn, idx) => ({
            type: 'reply',
            reply: {
                id: btn.id || `btn_${idx}`,
                title: btn.title.substring(0, 20) // Max 20 chars for button title
            }
        }));

        const body = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipientPhone,
            type: 'interactive',
            interactive: {
                type: 'button',
                body: {
                    text: bodyText
                },
                action: {
                    buttons: formattedButtons
                }
            }
        };

        const response = await axios.post(url, body, {
            headers: {
                'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`✅ Button message sent to ${recipientPhone}`);
        return response.data;
    } catch (error) {
        console.error('❌ WhatsApp Button Send Error:', error.response?.data || error.message);
        // Fallback to text message
        const buttonLabels = buttons.map((b, i) => `${i + 1}. ${b.title}`).join('\n');
        return sendTextMessage(recipientPhone, `${bodyText}\n\n${buttonLabels}\n\nReply with your choice.`);
    }
}

/**
 * Send a template message
 */
async function sendTemplateMessage(recipientPhone, templateName, languageCode = 'en', components = []) {
    try {
        const url = `${WHATSAPP_API_BASE}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

        const body = {
            messaging_product: 'whatsapp',
            to: recipientPhone,
            type: 'template',
            template: {
                name: templateName,
                language: { code: languageCode },
                components: components
            }
        };

        const response = await axios.post(url, body, {
            headers: {
                'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`✅ Template message sent to ${recipientPhone}`);
        return response.data;
    } catch (error) {
        console.error('❌ WhatsApp Template Send Error:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Mark a message as read
 */
async function markMessageAsRead(messageId) {
    try {
        const url = `${WHATSAPP_API_BASE}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

        await axios.post(url, {
            messaging_product: 'whatsapp',
            status: 'read',
            message_id: messageId
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        // Non-critical, just log
        console.log('Could not mark message as read:', error.message);
    }
}

module.exports = {
    sendTextMessage,
    sendListMessage,
    sendButtonMessage,
    sendTemplateMessage,
    markMessageAsRead
};
