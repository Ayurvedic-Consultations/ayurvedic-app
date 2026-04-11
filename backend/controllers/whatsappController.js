require('dotenv').config();
const axios = require('axios');

const sendWhatsAppMessage = async (recipientPhone, templateName, components = []) => {
  try {
    const url = `https://graph.facebook.com/v21.0/${process.env.PHONE_NUMBER_ID}/messages`;
    
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    recipientPhone = process.env.VERIFIED_USER_NUMBER; 
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    const body = {
      messaging_product: "whatsapp",
      to: recipientPhone,
      type: "template",
      template: {
        name: templateName,
        language: { code: "en" },
        components: components 
      }
    };

    const config = {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    };

    const response = await axios.post(url, body, config);
    console.log("Message sent successfully:", response.data);
    return response.data;

  } catch (error) {
    console.error("Error sending WhatsApp message:", error.response ? error.response.data : error.message);
    throw error;
  }
};

module.exports = { sendWhatsAppMessage };