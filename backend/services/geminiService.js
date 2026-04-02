/**
 * AI Service for Ayurvedic WhatsApp Bot
 * Powered by InfuseAI SDK
 * Handles all AI-powered conversation intelligence
 */
const { InfuseRestClient } = require('infuseai-sdk');

// Configuration from env
const INFUSE_CONFIG = {
    baseUrl: process.env.REACT_APP_INFUSEAI_URL || 'https://www.infuseai.in',
    appId: process.env.REACT_APP_INFUSEAI_APP_ID || process.env.INFUSEAI_APP_ID,
    credentials: {
        clientId: process.env.REACT_APP_INFUSEAI_CLIENT_ID || process.env.INFUSEAI_CLIENT_ID,
        apiKey: process.env.REACT_APP_INFUSEAI_API_KEY || process.env.INFUSEAI_API_KEY,
    },
};

// Create a singleton client for server-to-server calls
const infuseClient = new InfuseRestClient(INFUSE_CONFIG);

// System prompt injected into the stateless stateless calls when necessary
const SYSTEM_PROMPT = `You are "Ayurvedic AI", a deeply knowledgeable and compassionate Ayurvedic health assistant on WhatsApp. You work for an Ayurvedic telemedicine platform that connects patients with certified Ayurvedic doctors.

PERSONALITY & TONE:
- Warm, caring, and genuinely empathetic — like talking to a wise, kind health advisor
- Conversational and natural — never robotic, never clinical
- Keep messages SHORT and WhatsApp-friendly (2-4 lines max per response unless providing health insights)
- Use emojis naturally but sparingly (1-2 per message max: 🌿 💚 🙏 ✨ 🧘)
- Address the user by first name when known
- Be proactive — suggest next steps, don't wait for the user to ask

MULTILINGUAL SUPPORT:
- You support English, Hindi, Tamil, Telugu, and Marathi.
- **CRITICAL**: You MUST respond in the EXACT SAME LANGUAGE that the user is speaking.
- If the user messages in Hindi, reply entirely in Hindi. If Tamil, reply in Tamil, etc.
- Keep the same warm, empathetic tone in all languages.

CORE CAPABILITIES:
1. Health Assessment — Listen to symptoms, understand the concern, give preliminary Ayurvedic perspective
2. Doctor Recommendations — Help find the right specialist based on their condition
3. Appointment Booking — Guide through selecting doctor & time slot
4. Wellness Tips — Share Ayurvedic diet, lifestyle, yoga, and herbal suggestions
5. Video Resources — Recommend relevant Ayurvedic wellness videos from YouTube
6. Appointment Status — Check and update on existing bookings

CRITICAL MEDICAL RULES:
- NEVER prescribe specific medicines or dosages
- NEVER diagnose diseases definitively
- Always frame insights as "from an Ayurvedic perspective" or "traditional Ayurvedic wisdom suggests"
- Always recommend consulting a qualified doctor for serious or persistent concerns
- If someone describes EMERGENCY symptoms (chest pain, difficulty breathing, severe bleeding, stroke signs), IMMEDIATELY tell them to go to a hospital

RESPONSE FORMAT:
- Keep responses concise, warm, and actionable
- Use line breaks for readability on WhatsApp
- Do NOT use markdown (no **, ##, etc.) — plain text only
- Use bullet points with "•" when listing`;

/**
 * Helper to make stateless completion calls to InfuseAI
 */
async function statelessCompletion(messages, options = {}) {
    const result = await infuseClient.chatCompletions({
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 500
    });

    const content = result.choices?.[0]?.message?.content;
    if (!content) return "";

    // Handle JSON mode manually since groq supported it natively but Infuse might just return JSON string
    if (options.jsonMode) {
        try {
            // Find json boundaries if the model wraps it in markdown (e.g. \`\`\`json { ... } \`\`\`)
            const match = content.match(/{(?:[^{}])*}/) || content;
            const cleanContent = match[0] || content;
            return JSON.parse(cleanContent.replace(/```json|```/g, "").trim());
        } catch (e) {
            // If parsing fails, just return raw string, let caller handle
            return content;
        }
    }

    return content;
}

// ============================================================
// INTENT DETECTION
// ============================================================
async function detectIntent(message, currentFlow, conversationHistory = []) {
    const recentContext = (conversationHistory || []).slice(-4).map(m =>
        `${m.role}: ${m.content}`
    ).join('\n');

    const prompt = `You are an intent classifier for an Ayurvedic health WhatsApp bot. Analyze the user's message in context and classify their intent.

RECENT CONVERSATION CONTEXT:
${recentContext || 'No prior context'}

CURRENT BOT FLOW STATE: ${currentFlow}

USER MESSAGE: "${message}"

INTENT CATEGORIES (pick the BEST match):
- "greeting": Hello, hi, hey, namaste, starting conversation
- "health_concern": Describing ANY health issue, symptom, pain, discomfort, illness, or medical condition
- "book_doctor": Wants to book/consult/see a doctor, wants appointment
- "check_booking": Wants to check existing appointment status
- "youtube_request": Asking for videos, tips, or visual content
- "want_recommendations": Asking for health tips, remedies, diet advice
- "register_yes": Affirming they want to register or already registered
- "register_no": Saying they haven't registered
- "confirmation_yes": Confirming/agreeing to something
- "confirmation_no": Declining/saying no
- "select_option": Selecting a numbered option
- "general_question": General question
- "farewell": Bye, thank you, goodbye

IMPORTANT CLASSIFICATION RULES:
1. If the user mentions ANY body part + discomfort OR ANY health symptom → "health_concern"
2. If the user asks for doctor/appointment/booking in ANY way → "book_doctor"
3. If the user says "yes"/"sure"/"ok" in response to a suggestion → "confirmation_yes"

Respond ONLY with valid JSON (no extra text):
{
  "intent": "the_intent",
  "extractedData": "relevant extracted text",
  "confidence": 0.9,
  "language": "English"
}`;

    try {
        const result = await statelessCompletion([
            { role: 'user', content: prompt }
        ], {
            temperature: 0.1,
            maxTokens: 200,
            jsonMode: true
        });

        // if parsing didn't happen in helper
        if (typeof result === 'string') {
            return JSON.parse(result.replace(/```json|```/g, "").trim());
        }
        return result;
    } catch (error) {
        console.error('Intent Detection Error:', error);
        return fallbackIntentDetection(message, currentFlow);
    }
}

function fallbackIntentDetection(message, currentFlow) {
    const msg = message.toLowerCase().trim();
    if (/^(hi|hello|hey|namaste|good\s*(morning|evening|afternoon))/.test(msg)) {
        return { intent: 'greeting', extractedData: '', confidence: 0.8, language: 'English' };
    }
    if (/\b(book|appointment|consult|doctor|available|specialist|find.*doctor|give.*doctor|show.*doctor|who\s*can\s*help)\b/.test(msg)) {
        return { intent: 'book_doctor', extractedData: '', confidence: 0.8, language: 'English' };
    }
    if (/\b(pain|hurt|ache|problem|issue|symptom|sick|fever|cough|cold|headache|stomach|skin|sleep|stress|anxiety|tired|weak|joint|knee|back|digest|breath|allerg)\b/.test(msg)) {
        return { intent: 'health_concern', extractedData: msg, confidence: 0.7, language: 'English' };
    }
    if (/\b(video|youtube|watch|tutorial|yoga\s*video)\b/.test(msg)) {
        return { intent: 'youtube_request', extractedData: '', confidence: 0.8, language: 'English' };
    }
    return { intent: 'general_question', extractedData: '', confidence: 0.5, language: 'English' };
}

// ============================================================
// CONVERSATIONAL RESPONSE
// ============================================================
async function generateResponse(userMessage, conversationHistory = [], contextInfo = {}) {
    try {
        const contextParts = [];

        if (contextInfo.userName) contextParts.push(`Patient: ${contextInfo.userName}`);
        if (contextInfo.healthData) contextParts.push(`Health Info: ${JSON.stringify(contextInfo.healthData)}`);
        if (contextInfo.currentFlow) contextParts.push(`Flow: ${contextInfo.currentFlow}`);
        if (contextInfo.lastHealthTopic) contextParts.push(`Last Topic: ${contextInfo.lastHealthTopic}`);
        if (contextInfo.customInstruction) contextParts.push(`Instruction: ${contextInfo.customInstruction}`);

        const contextString = contextParts.length > 0
            ? `\n\nCURRENT CONTEXT:\n${contextParts.join('\n')}`
            : '';

        const messages = [
            {
                role: 'system',
                content: SYSTEM_PROMPT + contextString + '\n\nRespond to the conversation naturally. Keep it short, warm, and WhatsApp-friendly. Always suggest a helpful next step.'
            }
        ];

        // Add recent conversation history
        const recentHistory = conversationHistory.slice(-10);
        for (const msg of recentHistory) {
            messages.push({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            });
        }

        messages.push({ role: 'user', content: userMessage });

        const text = await statelessCompletion(messages, {
            temperature: 0.75,
            maxTokens: 400
        });

        return cleanForWhatsApp(text.trim());
    } catch (error) {
        console.error('API Error:', error);
        return "I'm having a little trouble right now. Could you try again in a moment? 🙏";
    }
}

// ============================================================
// QUICK HEALTH ASSESSMENT
// ============================================================
async function quickHealthAssessment(symptoms, userName = '') {
    const prompt = `A patient${userName ? ` named ${userName}` : ''} on our Ayurvedic health WhatsApp bot has shared this health concern:

"${symptoms}"

Provide a QUICK, empathetic Ayurvedic health response that includes:
1. Acknowledge their concern with empathy (1 line)
2. A brief Ayurvedic perspective on what might be happening (2-3 lines)  
3. 2-3 immediate things they can try at home (quick tips)
4. End by recommending they consult a specialist

Keep it SHORT, warm, and WhatsApp-friendly. NO markdown. Use "•" for bullet points.
DO NOT diagnose. Say "from an Ayurvedic perspective" or "traditionally".

Respond ONLY with valid JSON:
{
  "quickAdvice": "Your warm, helpful response text here",
  "category": "Health category (e.g., Joint/Musculoskeletal, Digestive, Respiratory, Skin...)",
  "suggestedSpecialization": "Most relevant Ayurvedic specialization",
  "doshaImbalance": "Likely dosha imbalance",
  "severity": "low/medium/high"
}`;

    try {
        const result = await statelessCompletion([
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt }
        ], {
            temperature: 0.7,
            maxTokens: 600,
            jsonMode: true
        });

        if (typeof result === "string") return JSON.parse(result.replace(/```json|```/g, "").trim());
        return result;
    } catch (error) {
        console.error('Quick Health Assessment Error:', error);
        return {
            quickAdvice: `I understand you're dealing with "${symptoms}". From an Ayurvedic perspective, your body is signaling that something needs attention.\n\nHere are a few things you can try:\n• Warm water with turmeric and ginger\n• Gentle stretching or yoga\n• Ensure adequate rest\n\nI'd recommend consulting with a specialist.`,
            category: 'General Wellness',
            suggestedSpecialization: 'General Ayurveda',
            doshaImbalance: 'To be determined by doctor',
            severity: 'medium'
        };
    }
}

// ============================================================
// DETAILED HEALTH ANALYSIS
// ============================================================
async function analyzeHealthConcern(healthData) {
    const prompt = `Based on the following comprehensive health information shared by a patient, provide a detailed Ayurvedic health assessment:

Patient Information:
- Symptoms: ${healthData.symptoms || 'Not specified'}
- Duration: ${healthData.duration || 'Not specified'}
- Severity: ${healthData.severity || 'Not specified'}
- Lifestyle: ${healthData.lifestyle || 'Not specified'}
- Medical History: ${healthData.medicalHistory || 'Not specified'}
- Current Medications: ${healthData.currentMedications || 'Not specified'}

Provide:
1. An empathetic Ayurvedic perspective on their condition (NOT a diagnosis)
2. The likely dosha imbalance
3. 3-4 specific Ayurvedic wellness suggestions
4. Which Ayurvedic specialization would be most relevant

Respond ONLY with valid JSON:
{
  "analysis": "Your detailed empathetic explanation with suggestions",
  "category": "Health category",
  "suggestedSpecialization": "Specialization",
  "doshaImbalance": "Dosha imbalance",
  "dietSuggestions": "Diet recommendations",
  "yogaSuggestions": "Yoga practices"
}`;

    try {
        const result = await statelessCompletion([
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt }
        ], {
            temperature: 0.7,
            maxTokens: 800,
            jsonMode: true
        });

        if (typeof result === "string") return JSON.parse(result.replace(/```json|```/g, "").trim());
        return result;
    } catch (error) {
        console.error('Health Analysis Error:', error);
        return {
            analysis: "Based on what you've shared, your body seems to be asking for care. I'd strongly recommend consulting with one of our specialists. 🌿",
            category: 'General Wellness',
            suggestedSpecialization: 'General Ayurveda',
            doshaImbalance: 'Unknown',
            dietSuggestions: 'Warm, cooked foods',
            yogaSuggestions: 'Gentle stretching'
        };
    }
}

// ============================================================
// SMART DOCTOR RANKING
// ============================================================
async function rankDoctorsForCondition(doctors, healthCategory, symptoms) {
    if (!doctors || doctors.length === 0) return [];

    const doctorList = doctors.map((d, i) =>
        `${i + 1}. ${d.name} | Specialization: ${d.specialization} | Experience: ${d.experience} | Fee: ₹${d.price}`
    ).join('\n');

    const prompt = `A patient has the following health concern:
- Symptoms: "${symptoms}"
- Health Category: "${healthCategory}"

Here are available Ayurvedic doctors:
${doctorList}

Rank these doctors by relevance. Return ONLY valid JSON:
{
  "rankedIndices": [0, 2, 1],
  "topPickReason": "Brief reason"
}`;

    try {
        const result = await statelessCompletion([
            { role: 'user', content: prompt }
        ], {
            temperature: 0.3,
            maxTokens: 200,
            jsonMode: true
        });

        if (typeof result === "string") return JSON.parse(result.replace(/```json|```/g, "").trim());
        return result;
    } catch (error) {
        return { rankedIndices: doctors.map((_, i) => i), topPickReason: '' };
    }
}

// ============================================================
// YOUTUBE RECOMMENDATIONS
// ============================================================
async function getYouTubeRecommendations(healthTopic) {
    const prompt = `A patient needs video recommendations for: "${healthTopic}"

Suggest exactly 3 YouTube video recommendations:
1. One educational video (Ayurvedic perspective)
2. One practical home remedy
3. One yoga/exercise video

Respond ONLY with valid JSON:
{
  "videos": [
    {
      "title": "Title",
      "description": "Description",
      "type": "educational",
      "searchQuery": "youtube search query"
    }
  ],
  "topicSummary": "Summary"
}`;

    try {
        const result = await statelessCompletion([
            { role: 'user', content: prompt }
        ], {
            temperature: 0.7,
            maxTokens: 500,
            jsonMode: true
        });

        const parsedResult = typeof result === "string" ? JSON.parse(result.replace(/```json|```/g, "").trim()) : result;

        parsedResult.videos = parsedResult.videos.filter(Boolean).map(video => ({
            ...video,
            link: `https://www.youtube.com/results?search_query=${encodeURIComponent(video.searchQuery)}`
        }));
        return parsedResult;
    } catch (error) {
        return { videos: [], topicSummary: healthTopic };
    }
}

// ============================================================
// HELPER: Clean text for WhatsApp
// ============================================================
function cleanForWhatsApp(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold markdown
        .replace(/__(.*?)__/g, '$1')       // Remove underline markdown
        .replace(/#{1,6}\s/g, '')          // Remove heading markers
        .replace(/```[\s\S]*?```/g, '')    // Remove code blocks
        .replace(/`(.*?)`/g, '$1')         // Remove inline code
        .trim();
}

async function translateMessage(text, targetLanguage) {
    if (!targetLanguage || targetLanguage.toLowerCase() === 'en') return text;
    const prompt = `Translate to ${targetLanguage}. Keep exactly same formatting. Message:\n"${text}"`;
    try {
        const result = await statelessCompletion([
            { role: 'user', content: prompt }
        ], { temperature: 0.1, maxTokens: 500 });
        return typeof result === "string" ? result.replace(/^"|"$/g, '').trim() : text;
    } catch (error) {
        return text;
    }
}

module.exports = {
    generateResponse,
    quickHealthAssessment,
    analyzeHealthConcern,
    detectIntent,
    getYouTubeRecommendations,
    rankDoctorsForCondition,
    translateMessage
};
