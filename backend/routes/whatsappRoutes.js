const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappWebhookController');

// ===== META WEBHOOK ENDPOINTS =====
// Webhook verification (GET) - Required by Meta for webhook setup
router.get('/webhook', whatsappController.verifyWebhook);

// Webhook handler (POST) - Receives incoming messages
router.post('/webhook', whatsappController.handleWebhook);

// ===== ADMIN ENDPOINTS =====
// Get all WhatsApp sessions (with pagination & search)
router.get('/sessions', whatsappController.getAllSessions);

// Get session details by phone number
router.get('/sessions/:phoneNumber', whatsappController.getSessionByPhone);

// Delete a session
router.delete('/sessions/:phoneNumber', whatsappController.deleteSession);

// Get WhatsApp bot statistics
router.get('/stats', whatsappController.getStats);

// Send a manual message to a user
router.post('/send-manual', whatsappController.sendManualMessage);

module.exports = router;
