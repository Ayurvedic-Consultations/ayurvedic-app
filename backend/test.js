const { sendWhatsAppMessage } = require('./controllers/whatsappController');

// Use your verified number from the .env file
const myNumber = process.env.VERIFIED_USER_NUMBER; 

// The 'hello_world' template takes no components/variables
sendWhatsAppMessage(myNumber, "hello_world");