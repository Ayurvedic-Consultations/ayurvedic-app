/**
 * Post-build script: Creates a physical chatbot-app/index.html
 * so /chatbot-app works on ANY hosting platform without rewrite rules.
 * 
 * How it works:
 * 1. react-scripts build creates build/index.html with correct JS/CSS bundle paths
 * 2. This script copies it to build/chatbot-app/index.html
 * 3. When a user visits /chatbot-app, the server finds this physical file
 * 4. React Router reads window.location.pathname = '/chatbot-app' and renders MobileChatApp
 */
const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');
const chatbotDir = path.join(buildDir, 'chatbot-app');

// Create the chatbot-app directory
fs.mkdirSync(chatbotDir, { recursive: true });

// Copy the main index.html
fs.copyFileSync(
    path.join(buildDir, 'index.html'),
    path.join(chatbotDir, 'index.html')
);

console.log('Created build/chatbot-app/index.html for PWA support');
