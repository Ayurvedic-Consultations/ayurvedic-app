/**
 * WhatsApp Bot Local Test Script
 * Tests the bot conversation flow without needing actual WhatsApp
 * 
 * Usage: node testWhatsAppBot.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');

// Override WhatsApp API to just print messages instead of sending
const mockWhatsApp = {
    sendTextMessage: async (phone, message) => {
        console.log('\n' + '='.repeat(60));
        console.log('🤖 Ayurvedic AI:');
        console.log('-'.repeat(60));
        console.log(message);
        console.log('='.repeat(60) + '\n');
        return { success: true };
    },
    markMessageAsRead: async () => { },
    sendListMessage: async (phone, header, body, btn, sections) => {
        console.log('\n' + '='.repeat(60));
        console.log(`🤖 Ayurvedic AI [LIST: ${header}]:`);
        console.log('-'.repeat(60));
        console.log(body);
        console.log('='.repeat(60) + '\n');
        return { success: true };
    },
    sendButtonMessage: async (phone, body, buttons) => {
        console.log('\n' + '='.repeat(60));
        console.log('🤖 Ayurvedic AI [BUTTONS]:');
        console.log('-'.repeat(60));
        console.log(body);
        console.log('Buttons:', buttons.map(b => b.title).join(' | '));
        console.log('='.repeat(60) + '\n');
        return { success: true };
    }
};

// Monkey-patch the whatsapp service
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function (id) {
    if (id === '../services/whatsappApiService' || id === './whatsappApiService') {
        return mockWhatsApp;
    }
    return originalRequire.apply(this, arguments);
};

const botService = require('./services/whatsappBotService');

const TEST_PHONE = '919999999999'; // Fake test phone number

async function main() {
    console.log('🔌 Connecting to MongoDB...');

    try {
        await mongoose.connect(process.env.MDB);
        console.log('✅ Connected to MongoDB\n');
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        console.log('\n⚠️  Make sure your MDB connection string in .env is correct!');
        process.exit(1);
    }

    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║     🌿 Ayurvedic AI - WhatsApp Bot Test Console         ║');
    console.log('║                                                        ║');
    console.log('║  Type messages as if you were on WhatsApp               ║');
    console.log('║  Type "quit" to exit                                    ║');
    console.log('║  Type "reset" to clear your session                     ║');
    console.log('║  Type "status" to see your session state                ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '📱 You: '
    });

    rl.prompt();

    rl.on('line', async (line) => {
        const input = line.trim();

        if (!input) {
            rl.prompt();
            return;
        }

        if (input.toLowerCase() === 'quit') {
            console.log('\n👋 Goodbye! Stay healthy! 🌿');
            await mongoose.disconnect();
            process.exit(0);
        }

        if (input.toLowerCase() === 'reset') {
            const WhatsAppSession = require('./models/WhatsAppSession');
            await WhatsAppSession.findOneAndDelete({ phoneNumber: TEST_PHONE });
            console.log('\n🔄 Session reset! You can start fresh.\n');
            rl.prompt();
            return;
        }

        if (input.toLowerCase() === 'status') {
            const WhatsAppSession = require('./models/WhatsAppSession');
            const session = await WhatsAppSession.findOne({ phoneNumber: TEST_PHONE });
            if (session) {
                console.log('\n📊 Session Status:');
                console.log(`   Phone: ${session.phoneNumber}`);
                console.log(`   Registered: ${session.isRegistered}`);
                console.log(`   Name: ${session.profile?.fullName || 'N/A'}`);
                console.log(`   Current Flow: ${session.currentFlow}`);
                console.log(`   Registration Step: ${session.registrationStep}`);
                console.log(`   Health Step: ${session.healthData?.consultationStep || 'N/A'}`);
                console.log(`   Total Messages: ${session.totalMessages}`);
                console.log('');
            } else {
                console.log('\n📊 No session found (send a message to start)\n');
            }
            rl.prompt();
            return;
        }

        try {
            await botService.handleIncomingMessage(TEST_PHONE, input, 'test_msg_id');
        } catch (err) {
            console.error('\n❌ Error:', err.message, '\n');
        }

        rl.prompt();
    });

    rl.on('close', async () => {
        await mongoose.disconnect();
        process.exit(0);
    });
}

main().catch(console.error);
