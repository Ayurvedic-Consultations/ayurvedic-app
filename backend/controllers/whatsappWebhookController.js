/**
 * WhatsApp Webhook Controller
 * Handles Meta WhatsApp Business API webhooks
 */
const botService = require('../services/whatsappBotService');
const WhatsAppSession = require('../models/WhatsAppSession');

/**
 * GET /api/whatsapp/webhook  
 * Webhook verification endpoint (required by Meta)
 */
exports.verifyWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'ayurvedic_ai_verify_token';

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('✅ WhatsApp Webhook verified successfully');
        return res.status(200).send(challenge);
    }

    console.log('❌ WhatsApp Webhook verification failed');
    return res.status(403).send('Forbidden');
};

/**
 * POST /api/whatsapp/webhook
 * Receives incoming messages from WhatsApp
 */
exports.handleWebhook = async (req, res) => {
    try {
        // Always respond 200 quickly to avoid Meta retries
        res.status(200).send('EVENT_RECEIVED');

        const body = req.body;

        if (!body.object || body.object !== 'whatsapp_business_account') {
            return;
        }

        const entries = body.entry;
        if (!entries || entries.length === 0) return;

        for (const entry of entries) {
            const changes = entry.changes;
            if (!changes || changes.length === 0) continue;

            for (const change of changes) {
                const value = change.value;
                if (!value || !value.messages) continue;

                const messages = value.messages;
                const contacts = value.contacts || [];

                for (const message of messages) {
                    const phoneNumber = message.from;
                    const messageId = message.id;
                    const timestamp = message.timestamp;

                    // Get contact name if available
                    const contact = contacts.find(c => c.wa_id === phoneNumber);
                    const contactName = contact?.profile?.name || '';

                    console.log(`\n📩 Incoming message from ${phoneNumber} (${contactName})`);
                    console.log(`   Type: ${message.type}`);

                    // Handle different message types
                    if (message.type === 'text') {
                        const messageText = message.text.body;
                        console.log(`   Text: ${messageText}`);

                        await botService.handleIncomingMessage(phoneNumber, messageText, messageId);
                    }
                    else if (message.type === 'interactive') {
                        console.log(`   Interactive: ${JSON.stringify(message.interactive)}`);
                        await botService.handleInteractiveResponse(phoneNumber, message.interactive, messageId);
                    }
                    else if (message.type === 'button') {
                        // Template button responses
                        const buttonText = message.button?.text || message.button?.payload || '';
                        console.log(`   Button: ${buttonText}`);
                        await botService.handleIncomingMessage(phoneNumber, buttonText, messageId);
                    }
                    else {
                        // For unsupported types (image, audio, video, etc.)
                        console.log(`   Unsupported type: ${message.type}`);
                        const { sendTextMessage } = require('../services/whatsappApiService');
                        await sendTextMessage(
                            phoneNumber,
                            "I currently support text messages only. Could you please type your message? 🙏"
                        );
                    }
                }
            }
        }
    } catch (error) {
        console.error('❌ Webhook processing error:', error);
    }
};

/**
 * GET /api/whatsapp/sessions
 * Admin endpoint - Get all WhatsApp sessions
 */
exports.getAllSessions = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '' } = req.query;

        const query = {};
        if (search) {
            query.$or = [
                { phoneNumber: { $regex: search, $options: 'i' } },
                { 'profile.fullName': { $regex: search, $options: 'i' } }
            ];
        }

        const sessions = await WhatsAppSession.find(query)
            .sort({ lastActive: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .select('-conversationHistory'); // Exclude full history for list view

        const total = await WhatsAppSession.countDocuments(query);

        res.status(200).json({
            success: true,
            sessions,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get Sessions Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * GET /api/whatsapp/sessions/:phoneNumber
 * Admin endpoint - Get session details with conversation history
 */
exports.getSessionByPhone = async (req, res) => {
    try {
        const { phoneNumber } = req.params;
        const session = await WhatsAppSession.findOne({ phoneNumber });

        if (!session) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }

        res.status(200).json({ success: true, session });
    } catch (error) {
        console.error('Get Session Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * GET /api/whatsapp/stats
 * Admin endpoint - Get WhatsApp bot statistics
 */
exports.getStats = async (req, res) => {
    try {
        const totalSessions = await WhatsAppSession.countDocuments();
        const registeredUsers = await WhatsAppSession.countDocuments({ isRegistered: true });
        const activeToday = await WhatsAppSession.countDocuments({
            lastActive: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        });
        const totalMessages = await WhatsAppSession.aggregate([
            { $group: { _id: null, total: { $sum: '$totalMessages' } } }
        ]);

        // Get flow distribution
        const flowDistribution = await WhatsAppSession.aggregate([
            { $group: { _id: '$currentFlow', count: { $sum: 1 } } }
        ]);

        // Recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentActivity = await WhatsAppSession.aggregate([
            { $match: { lastActive: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$lastActive' } },
                    count: { $sum: 1 },
                    messages: { $sum: '$totalMessages' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            success: true,
            stats: {
                totalSessions,
                registeredUsers,
                activeToday,
                totalMessages: totalMessages[0]?.total || 0,
                flowDistribution,
                recentActivity
            }
        });
    } catch (error) {
        console.error('Stats Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * DELETE /api/whatsapp/sessions/:phoneNumber
 * Admin endpoint - Delete a session
 */
exports.deleteSession = async (req, res) => {
    try {
        const { phoneNumber } = req.params;
        await WhatsAppSession.findOneAndDelete({ phoneNumber });
        res.status(200).json({ success: true, message: 'Session deleted' });
    } catch (error) {
        console.error('Delete Session Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * POST /api/whatsapp/send-manual
 * Admin endpoint - Send a manual message to a user
 */
exports.sendManualMessage = async (req, res) => {
    try {
        const { phoneNumber, message } = req.body;

        if (!phoneNumber || !message) {
            return res.status(400).json({ success: false, error: 'Phone number and message are required' });
        }

        const { sendTextMessage } = require('../services/whatsappApiService');
        await sendTextMessage(phoneNumber, message);

        // Update session history
        const session = await WhatsAppSession.findOne({ phoneNumber });
        if (session) {
            session.conversationHistory.push({
                role: 'assistant',
                content: `[ADMIN] ${message}`,
                timestamp: new Date()
            });
            await session.save();
        }

        res.status(200).json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Manual Send Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
