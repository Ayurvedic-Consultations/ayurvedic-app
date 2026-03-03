const express = require("express");
const router = express.Router();
const whatsappController = require("../controllers/whatsappController");

// Twilio webhook endpoints
router.post("/webhook", whatsappController.handleInboundWebhook);
router.get("/webhook", whatsappController.verifyWebhook);

// Account linking
router.post("/link", whatsappController.linkWhatsApp);
router.get("/link-status/:patientId", whatsappController.getLinkStatus);
router.delete("/unlink/:patientId", whatsappController.unlinkWhatsApp);

// Notifications
router.post("/send-notification", whatsappController.sendNotification);

// Language preference
router.post("/update-language", whatsappController.updateLanguage);

module.exports = router;
