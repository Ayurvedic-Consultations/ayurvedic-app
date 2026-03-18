/**
 * Gemini AI Service for Ayurvedic WhatsApp Bot
 * Handles all AI-powered conversation intelligence
 */
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are a warm, empathetic Ayurvedic AI health assistant on WhatsApp named "AyurCare AI".

PERSONALITY & TONE:
- Speak in a warm, caring, and human-like tone
- Keep messages SHORT and WhatsApp-friendly (max 3-4 lines per message unless explaining something)
- Use occasional emojis naturally (🌿, 💚, 🙏, ✨) but don't overdo it
- Never sound robotic or clinical
- Be encouraging and reassuring
- Address the user by name when known

CRITICAL RULES:
- NEVER prescribe specific medicines or dosages
- NEVER diagnose diseases definitively  
- Always recommend consulting a qualified Ayurvedic doctor for serious concerns
- Provide general Ayurvedic wellness advice only (diet, lifestyle, herbs for general wellness)
- Frame everything as "suggestions" or "traditional wisdom", not medical advice
- If someone describes emergency symptoms, urgently recommend they visit a hospital

AYURVEDIC KNOWLEDGE:
- You understand the three doshas: Vata, Pitta, Kapha
- You know common Ayurvedic herbs and their general benefits
- You understand Ayurvedic dietary principles
- You can suggest yoga and pranayama for wellness
- You know about Panchakarma and other Ayurvedic therapies at a general level

RESPONSE FORMAT:
- Keep responses concise and conversational
- Use line breaks for readability
- Don't use markdown formatting (no **, ##, etc.) - this is WhatsApp
- Use simple bullet points with "•" when listing things
- End responses with a gentle question or next step when appropriate`;

/**
 * Generate a conversational response using Gemini
 */
async function generateResponse(userMessage, conversationHistory = [], contextInfo = {}) {
    try {
        // Build conversation context
        const contextParts = [];

        if (contextInfo.userName) {
            contextParts.push(`User's name: ${contextInfo.userName}`);
        }
        if (contextInfo.healthData) {
            contextParts.push(`Known health information: ${JSON.stringify(contextInfo.healthData)}`);
        }
        if (contextInfo.currentFlow) {
            contextParts.push(`Current conversation flow: ${contextInfo.currentFlow}`);
        }
        if (contextInfo.customInstruction) {
            contextParts.push(`Special instruction: ${contextInfo.customInstruction}`);
        }

        const contextString = contextParts.length > 0
            ? `\n\nCURRENT CONTEXT:\n${contextParts.join('\n')}`
            : '';

        // Build message history for Gemini
        const contents = [];

        // Add system context as first user message
        contents.push({
            role: 'user',
            parts: [{ text: SYSTEM_PROMPT + contextString + '\n\nPlease respond to the following conversation naturally.' }]
        });
        contents.push({
            role: 'model',
            parts: [{ text: 'I understand. I\'ll respond as AyurCare AI, a warm and empathetic Ayurvedic health assistant on WhatsApp. I\'ll keep my responses concise, WhatsApp-friendly, and follow all the guidelines provided.' }]
        });

        // Add recent conversation history (last 10 messages for context)
        const recentHistory = conversationHistory.slice(-10);
        for (const msg of recentHistory) {
            contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            });
        }

        // Add the current message
        contents.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        const response = await axios.post(GEMINI_API_URL, {
            contents,
            generationConfig: {
                temperature: 0.8,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 500,
            },
            safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            ]
        });

        const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            throw new Error('No response generated from Gemini');
        }

        return generatedText.trim();
    } catch (error) {
        console.error('Gemini API Error:', error.response?.data || error.message);
        return "I'm having a little trouble right now. Could you try again in a moment? 🙏";
    }
}

/**
 * Analyze health symptoms and provide Ayurvedic insights
 */
async function analyzeHealthConcern(healthData) {
    const prompt = `Based on the following health information shared by a patient, provide:
1. A simple, empathetic Ayurvedic perspective on what might be going on (NOT a diagnosis)
2. The likely dosha imbalance involved
3. 2-3 general Ayurvedic wellness suggestions (diet, lifestyle, herbs for general wellness)
4. Which Ayurvedic specialization would be most relevant for a doctor consultation

Patient Information:
- Symptoms: ${healthData.symptoms || 'Not specified'}
- Duration: ${healthData.duration || 'Not specified'}
- Severity: ${healthData.severity || 'Not specified'}
- Lifestyle: ${healthData.lifestyle || 'Not specified'}
- Medical History: ${healthData.medicalHistory || 'Not specified'}
- Current Medications: ${healthData.currentMedications || 'Not specified'}

IMPORTANT: Keep the response WhatsApp-friendly (short, clear, with line breaks). DO NOT diagnose. Frame everything as traditional Ayurvedic wisdom and suggestions. End by recommending they consult an Ayurvedic doctor.

Respond in this JSON format:
{
  "analysis": "Your empathetic explanation here",
  "category": "The health category (e.g., Digestive, Respiratory, Skin, Joint, Stress/Mental, General Wellness, etc.)",
  "suggestedSpecialization": "The relevant doctor specialization",
  "doshaImbalance": "The likely dosha imbalance"
}`;

    try {
        const response = await axios.post(GEMINI_API_URL, {
            contents: [{
                role: 'user',
                parts: [{ text: SYSTEM_PROMPT + '\n\n' + prompt }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 800,
                responseMimeType: 'application/json'
            }
        });

        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('No response from Gemini health analysis');
        }

        return JSON.parse(text);
    } catch (error) {
        console.error('Gemini Health Analysis Error:', error.response?.data || error.message);
        return {
            analysis: "Based on what you've shared, it sounds like your body might be trying to tell you something. I'd recommend consulting with a qualified Ayurvedic doctor who can provide personalized guidance. 🌿",
            category: "General Wellness",
            suggestedSpecialization: "General Ayurveda",
            doshaImbalance: "To be determined by doctor"
        };
    }
}

/**
 * Detect user intent from message
 */
async function detectIntent(message, currentFlow) {
    const prompt = `Analyze this WhatsApp message and determine the user's intent.

Message: "${message}"
Current conversation flow: ${currentFlow}

Classify the intent into ONE of these categories:
- "greeting": User is saying hello/hi/starting conversation
- "register_yes": User wants to register
- "register_no": User doesn't want to register
- "health_concern": User is describing health issues/symptoms
- "book_doctor": User wants to book/consult a doctor
- "check_booking": User wants to check appointment status
- "select_option": User is selecting an option (a number, a name, yes/no in response to a choice)
- "confirmation_yes": User is confirming something (yes, sure, ok, confirm)
- "confirmation_no": User is declining/saying no
- "youtube_request": User is asking for video recommendations
- "general_question": General health/ayurveda question
- "farewell": User is saying goodbye
- "unknown": Cannot determine intent

Also extract any relevant data values (name, number selection, symptoms, etc.)

Respond in JSON format:
{
  "intent": "the_intent",
  "extractedData": "any relevant data extracted",
  "confidence": 0.0 to 1.0
}`;

    try {
        const response = await axios.post(GEMINI_API_URL, {
            contents: [{
                role: 'user',
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 200,
                responseMimeType: 'application/json'
            }
        });

        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        return JSON.parse(text);
    } catch (error) {
        console.error('Intent Detection Error:', error.message);
        return { intent: 'unknown', extractedData: '', confidence: 0.0 };
    }
}

/**
 * Search for relevant YouTube videos for a health topic
 */
async function getYouTubeRecommendations(healthTopic) {
    const prompt = `Suggest 2 YouTube video recommendations for the Ayurvedic health topic: "${healthTopic}"

Provide exactly 2 recommendations:
1. One long-form educational video (10+ minutes)
2. One short-form quick tip video (under 5 minutes)

Requirements:
- Must be strictly Ayurvedic content
- Must be from credible channels
- Must be relevant to the topic

Respond in JSON format:
{
  "videos": [
    {
      "title": "Video title",
      "description": "Brief 1-line description",
      "type": "long-form",
      "searchQuery": "youtube search query to find this video"
    },
    {
      "title": "Video title", 
      "description": "Brief 1-line description",
      "type": "short-form",
      "searchQuery": "youtube search query to find this video"
    }
  ]
}`;

    try {
        const response = await axios.post(GEMINI_API_URL, {
            contents: [{
                role: 'user',
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 400,
                responseMimeType: 'application/json'
            }
        });

        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        const result = JSON.parse(text);

        // Generate YouTube search URLs
        result.videos = result.videos.map(video => ({
            ...video,
            link: `https://www.youtube.com/results?search_query=${encodeURIComponent(video.searchQuery)}`
        }));

        return result;
    } catch (error) {
        console.error('YouTube Recommendation Error:', error.message);
        return { videos: [] };
    }
}

module.exports = {
    generateResponse,
    analyzeHealthConcern,
    detectIntent,
    getYouTubeRecommendations
};
