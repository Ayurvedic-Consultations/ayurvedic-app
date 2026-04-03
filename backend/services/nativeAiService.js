/**
 * Groq AI Service for Ayurvedic WhatsApp Bot
 * Uses Groq Cloud API (OpenAI-compatible) with LLaMA models
 * Handles all AI-powered conversation intelligence
 */
const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Model selection — llama-3.3-70b-versatile is best for complex reasoning
const MODEL_FAST = 'llama-3.3-70b-versatile';    // For intent detection (fast + accurate)
const MODEL_CHAT = 'llama-3.3-70b-versatile';     // For conversations & health analysis

/**
 * Helper: Make a Groq API call with error handling
 */
async function groqChat(messages, options = {}) {
    const {
        temperature = 0.7,
        maxTokens = 500,
        jsonMode = false
    } = options;

    const requestBody = {
        model: options.model || MODEL_CHAT,
        messages,
        temperature,
        max_tokens: maxTokens,
    };

    if (jsonMode) {
        requestBody.response_format = { type: 'json_object' };
    }

    const response = await axios.post(GROQ_API_URL, requestBody, {
        headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        }
    });

    return response.data?.choices?.[0]?.message?.content;
}

// ============================================================
// SYSTEM PROMPT - The core personality & behavior rules
// ============================================================
const SYSTEM_PROMPT = `You are "Ayurvedic AI", a deeply knowledgeable and compassionate Ayurvedic health assistant on WhatsApp. You work for an Ayurvedic telemedicine platform that connects patients with certified Ayurvedic doctors.

PERSONALITY & TONE:
- Warm, caring, and genuinely empathetic — like talking to a wise, kind health advisor
- Conversational and natural — never robotic, never clinical
- Keep messages SHORT and WhatsApp-friendly (2-4 lines max per response unless providing health insights)
- Use emojis naturally but sparingly (1-2 per message max: 🌿 💚 🙏 ✨ 🧘)
- Address the user by first name when known
- Be proactive — suggest next steps, don't wait for the user to ask

MULTILINGUAL SUPPORT:
- You natively support English, Hindi, Tamil, Telugu, Marathi, and **Hinglish** (a natural blend of Hindi and English written in the Latin alphabet).
- **CRITICAL**: You MUST respond in the EXACT SAME LANGUAGE that the user is speaking, especially Hinglish.
- Keep the same warm, empathetic tone in all languages.

CORE CAPABILITIES (what you help with):
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

AYURVEDIC KNOWLEDGE:
- The three doshas: Vata, Pitta, Kapha
- Common Ayurvedic herbs: Ashwagandha, Triphala, Tulsi, Turmeric, Brahmi, Shatavari, etc.
- Ayurvedic dietary principles and yoga

RESPONSE FORMAT:
- Keep responses concise, warm, and actionable
- Use line breaks for readability on WhatsApp
- Do NOT use markdown (no **, ##, etc.) — plain text only
- Use bullet points with "•" when listing
- Always end with a clear next step or gentle question`;

// ============================================================
// INTENT DETECTION - Understand what the user wants
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
- "health_concern": Describing ANY health issue, symptom, pain, discomfort, illness, or medical condition (e.g., "my knees hurt", "I have headache", "feeling stressed", "skin problem", "can't sleep", "stomach issues")
- "book_doctor": Wants to book/consult/see a doctor, wants appointment, wants to meet a doctor, asking for available doctors (e.g., "book appointment", "I want a doctor", "show me doctors", "who can help me", "give me doctor")
- "check_booking": Wants to check existing appointment status
- "youtube_request": Asking for videos, tutorials
- "diet_plan": Asking what to eat, daily diet plan, food recommendations, recipes, foods to avoid
- "yoga_plan": Asking for a yoga routine, exercise plan, physical activities, poses
- "want_recommendations": Asking for general health tips, remedies, lifestyle suggestions
- "register_yes": Affirming they want to register or that they are already registered (yes, I'm registered, I have account)
- "register_no": Saying they haven't registered (no, not yet, I'm new)
- "confirmation_yes": Confirming/agreeing to something (yes, sure, ok, confirm, go ahead, please, do it)
- "confirmation_no": Declining/saying no (no, cancel, not now, maybe later, nah)
- "select_option": Selecting a numbered option or making a specific choice (1, 2, 3, first one, etc.)
- "general_question": General question about Ayurveda, health, wellness, platform features
- "farewell": Bye, thank you, goodbye, talk later

IMPORTANT CLASSIFICATION RULES:
1. If the user mentions ANY body part + discomfort OR ANY health symptom → "health_concern"
2. If the user asks for doctor/appointment/booking in ANY way → "book_doctor"
3. If the user says "yes"/"sure"/"ok" in response to a suggestion → "confirmation_yes"
4. If user asks "who can help", "give me doctor", "find specialist" → "book_doctor"
5. If user mentions wanting remedies/tips/advice → "want_recommendations"
6. Context matters: if the bot just offered to find doctors and user says "yes" → "confirmation_yes"

Respond ONLY with valid JSON (no extra text):
{
  "intent": "the_intent",
  "extractedData": "any relevant symptoms, condition, or selection extracted",
  "confidence": 0.0 to 1.0,
  "language": "full language name in English (e.g., English, Hindi, Bengali, Tamil, Telugu, Marathi, Hinglish)"
}`;

    try {
        const text = await groqChat([
            { role: 'user', content: prompt }
        ], {
            model: MODEL_FAST,
            temperature: 0.1,
            maxTokens: 200,
            jsonMode: true
        });

        return JSON.parse(text);
    } catch (error) {
        console.error('Intent Detection Error:', error.response?.data || error.message);
        return fallbackIntentDetection(message, currentFlow);
    }
}

/**
 * Fallback intent detection using keywords when Groq is unavailable
 */
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
    if (/\b(diet|eat|food|meal|recipe|nutrition)\b/.test(msg)) {
        return { intent: 'diet_plan', extractedData: '', confidence: 0.8, language: 'English' };
    }
    if (/\b(yoga|exercise|workout|asana|pranayama|pose)\b/.test(msg)) {
        return { intent: 'yoga_plan', extractedData: '', confidence: 0.8, language: 'English' };
    }
    if (/\b(video|youtube|watch|tutorial)\b/.test(msg)) {
        return { intent: 'youtube_request', extractedData: '', confidence: 0.8, language: 'English' };
    }
    if (/\b(tip|remedy|suggest|recommend|advice|diet|lifestyle|home\s*remedy)\b/.test(msg)) {
        return { intent: 'want_recommendations', extractedData: '', confidence: 0.7, language: 'English' };
    }
    if (/\b(status|check|my\s*appointment|my\s*booking)\b/.test(msg)) {
        return { intent: 'check_booking', extractedData: '', confidence: 0.8, language: 'English' };
    }
    if (/^(yes|yeah|sure|ok|okay|confirm|go\s*ahead|please|do\s*it|yep|yup|haan|ha)\b/.test(msg)) {
        return { intent: 'confirmation_yes', extractedData: '', confidence: 0.8, language: 'English' };
    }
    if (/^(no|nah|nope|cancel|not\s*now|later|na|nahi)\b/.test(msg)) {
        return { intent: 'confirmation_no', extractedData: '', confidence: 0.8, language: 'English' };
    }
    if (/^\d+$/.test(msg)) {
        return { intent: 'select_option', extractedData: msg, confidence: 0.9, language: 'English' };
    }
    if (/\b(bye|goodbye|thank|thanks|talk\s*later)\b/.test(msg)) {
        return { intent: 'farewell', extractedData: '', confidence: 0.8, language: 'English' };
    }

    return { intent: 'general_question', extractedData: '', confidence: 0.5, language: 'English' };
}

// ============================================================
// CONVERSATIONAL RESPONSE - Natural, context-aware replies
// ============================================================
async function generateResponse(userMessage, conversationHistory = [], contextInfo = {}) {
    try {
        const contextParts = [];

        if (contextInfo.userName) {
            contextParts.push(`Patient's name: ${contextInfo.userName}`);
        }
        if (contextInfo.healthData) {
            contextParts.push(`Known health information: ${JSON.stringify(contextInfo.healthData)}`);
        }
        if (contextInfo.currentFlow) {
            contextParts.push(`Current conversation flow: ${contextInfo.currentFlow}`);
        }
        if (contextInfo.lastHealthTopic) {
            contextParts.push(`Patient's recent health concern: ${contextInfo.lastHealthTopic}`);
        }
        if (contextInfo.customInstruction) {
            contextParts.push(`Special instruction: ${contextInfo.customInstruction}`);
        }

        const contextString = contextParts.length > 0
            ? `\n\nCURRENT CONTEXT:\n${contextParts.join('\n')}`
            : '';

        // Build messages array for Groq (OpenAI format)
        const messages = [
            {
                role: 'system',
                content: SYSTEM_PROMPT + contextString + '\n\nRespond to the conversation naturally. Keep it short, warm, and WhatsApp-friendly. Always suggest a helpful next step.'
            }
        ];

        // Add recent conversation history (last 10 messages)
        const recentHistory = conversationHistory.slice(-10);
        for (const msg of recentHistory) {
            messages.push({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            });
        }

        // Add current message
        messages.push({
            role: 'user',
            content: userMessage
        });

        const text = await groqChat(messages, {
            temperature: 0.75,
            maxTokens: 400
        });

        if (!text) {
            throw new Error('No response generated from Groq');
        }

        return cleanForWhatsApp(text.trim());
    } catch (error) {
        console.error('Groq API Error:', error.response?.data || error.message);
        return "I'm having a little trouble right now. Could you try again in a moment? 🙏";
    }
}

// ============================================================
// QUICK HEALTH ASSESSMENT - Immediate helpful response
// ============================================================
async function quickHealthAssessment(symptoms, userName = '') {
    const prompt = `A patient${userName ? ` named ${userName}` : ''} on our Ayurvedic health WhatsApp bot has shared this health concern:

"${symptoms}"

Provide a QUICK, empathetic Ayurvedic health response that includes:
1. Acknowledge their concern with empathy (1 line)
2. A brief Ayurvedic perspective on what might be happening (2-3 lines)  
3. 2-3 immediate things they can try at home (quick Ayurvedic tips — herbs, diet, lifestyle)
4. End by recommending they consult an Ayurvedic specialist for proper guidance

**CRITICAL LANGUAGE RULE: You MUST write the "quickAdvice" in the EXACT SAME LANGUAGE that the user used (e.g., Hindi, Tamil, Telugu, Marathi). Keep it natural.**

Keep it SHORT, warm, and WhatsApp-friendly. NO markdown. Use "•" for bullet points.
DO NOT diagnose. Say "from an Ayurvedic perspective" or "traditionally".

Also determine the health category and suggested doctor specialization.

Respond ONLY with valid JSON:
{
  "quickAdvice": "Your warm, helpful response text here",
  "category": "Health category (e.g., Joint/Musculoskeletal, Digestive, Respiratory, Skin, Stress/Mental, Sleep, Immunity, Women's Health, General Wellness)",
  "suggestedSpecialization": "Most relevant Ayurvedic specialization",
  "doshaImbalance": "Likely dosha imbalance (Vata/Pitta/Kapha)",
  "severity": "low/medium/high"
}`;

    try {
        const text = await groqChat([
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt }
        ], {
            temperature: 0.7,
            maxTokens: 600,
            jsonMode: true
        });

        if (!text) throw new Error('No response from quick assessment');
        return JSON.parse(text);
    } catch (error) {
        console.error('Quick Health Assessment Error:', error.response?.data || error.message);
        return {
            quickAdvice: `I understand you're dealing with "${symptoms}". From an Ayurvedic perspective, your body is signaling that something needs attention.\n\nHere are a few things you can try:\n• Warm water with turmeric and ginger can help reduce inflammation\n• Gentle stretching or yoga can improve circulation\n• Ensure you're getting adequate rest\n\nI'd recommend consulting with one of our Ayurvedic specialists for personalized guidance.`,
            category: 'General Wellness',
            suggestedSpecialization: 'General Ayurveda',
            doshaImbalance: 'To be determined by doctor',
            severity: 'medium'
        };
    }
}

// ============================================================
// DETAILED HEALTH ANALYSIS - Full consultation analysis
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
3. 3-4 specific Ayurvedic wellness suggestions (diet changes, herbs for general wellness, lifestyle adjustments, yoga poses)
4. Which Ayurvedic specialization would be most relevant

**CRITICAL LANGUAGE RULE: You MUST write the "analysis", "dietSuggestions", and "yogaSuggestions" in the EXACT SAME LANGUAGE that the user used to describe their symptoms (e.g., Hindi, Tamil, Telugu, Marathi). Keep it natural.**

Keep the response WhatsApp-friendly (clear, with line breaks). Use "•" for bullet points.
DO NOT diagnose. Frame everything as traditional Ayurvedic wisdom.

Respond ONLY with valid JSON:
{
  "analysis": "Your detailed empathetic explanation with suggestions",
  "category": "Health category",
  "suggestedSpecialization": "The relevant doctor specialization",
  "doshaImbalance": "The likely dosha imbalance",
  "dietSuggestions": "Brief diet recommendations",
  "yogaSuggestions": "Relevant yoga/pranayama practices"
}`;

    try {
        const text = await groqChat([
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt }
        ], {
            temperature: 0.7,
            maxTokens: 800,
            jsonMode: true
        });

        if (!text) throw new Error('No response from Groq health analysis');
        return JSON.parse(text);
    } catch (error) {
        console.error('Groq Health Analysis Error:', error.response?.data || error.message);
        return {
            analysis: "Based on what you've shared, your body seems to be asking for some attention and care. From an Ayurvedic perspective, balancing your daily routine, diet, and incorporating gentle practices can make a real difference.\n\nI'd strongly recommend consulting with one of our Ayurvedic specialists who can provide personalized guidance for your specific situation. 🌿",
            category: 'General Wellness',
            suggestedSpecialization: 'General Ayurveda',
            doshaImbalance: 'To be determined by doctor',
            dietSuggestions: 'Warm, freshly cooked foods. Avoid processed and cold foods.',
            yogaSuggestions: 'Gentle stretching, deep breathing (Pranayama)'
        };
    }
}

// ============================================================
// SMART DOCTOR RANKING - AI-powered doctor matching
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

Rank these doctors by relevance to the patient's condition. Consider:
1. Specialization match to the health category (most important)
2. Experience level
3. Overall suitability

Return ONLY valid JSON:
{
  "rankedIndices": [0, 2, 1],
  "topPickReason": "Brief 1-line reason why the #1 doctor is the best match"
}`;

    try {
        const text = await groqChat([
            { role: 'user', content: prompt }
        ], {
            model: MODEL_FAST,
            temperature: 0.3,
            maxTokens: 200,
            jsonMode: true
        });

        return JSON.parse(text);
    } catch (error) {
        console.error('Doctor Ranking Error:', error.message);
        return { rankedIndices: doctors.map((_, i) => i), topPickReason: '' };
    }
}

// ============================================================
// YOUTUBE RECOMMENDATIONS - Find relevant wellness videos
// ============================================================
async function getYouTubeRecommendations(healthTopic) {
    const prompt = `A patient on our Ayurvedic health platform needs video recommendations for: "${healthTopic}"

Suggest exactly 3 YouTube video recommendations:
1. One educational video about understanding this condition from Ayurvedic perspective
2. One practical home remedy / treatment video 
3. One yoga/exercise video that helps with this condition

Requirements:
- Must be Ayurvedic or holistic wellness content
- Must be from well-known Ayurvedic channels or yoga channels
- Generate realistic, specific search queries that will find real, helpful videos

Respond ONLY with valid JSON:
{
  "videos": [
    {
      "title": "Descriptive video title",
      "description": "Brief 1-line description of what patient will learn",
      "type": "educational",
      "searchQuery": "specific youtube search query"
    },
    {
      "title": "Descriptive video title",
      "description": "Brief 1-line description",
      "type": "remedy",
      "searchQuery": "specific youtube search query"
    },
    {
      "title": "Descriptive video title",
      "description": "Brief 1-line description",
      "type": "yoga",
      "searchQuery": "specific youtube search query"
    }
  ],
  "topicSummary": "One line summary of the health topic for context"
}`;

    try {
        const text = await groqChat([
            { role: 'user', content: prompt }
        ], {
            temperature: 0.7,
            maxTokens: 500,
            jsonMode: true
        });

        const result = JSON.parse(text);

        // Generate YouTube search URLs
        result.videos = result.videos.map(video => ({
            ...video,
            link: `https://www.youtube.com/results?search_query=${encodeURIComponent(video.searchQuery)}`
        }));

        return result;
    } catch (error) {
        console.error('YouTube Recommendation Error:', error.message);
        return {
            videos: [],
            topicSummary: healthTopic
        };
    }
}

// ============================================================
// CUSTOM PLAN GENERATORS
// ============================================================
async function generateDietPlan(message, userName, healthData) {
    const prompt = `Generate a customized 1-day Ayurvedic diet plan (Breakfast, Lunch, Dinner, Snacks) for a patient${userName ? ` named ${userName}` : ''}.
Condition/Symptoms: ${healthData?.identifiedCategory || healthData?.symptoms || message || 'General Wellness'}.

Format it clearly with dot points. Keep it warm, WhatsApp-friendly. Emphasize it's an Ayurvedic perspective. End by asking if they need a doctor consultation.`;
    return await groqChat([{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: prompt }]);
}

async function generateYogaPlan(message, userName, healthData) {
    const prompt = `Generate a customized Ayurvedic Yoga & Pranayama routine (3-4 specific poses/exercises) for a patient${userName ? ` named ${userName}` : ''}.
Condition/Symptoms: ${healthData?.identifiedCategory || healthData?.symptoms || message || 'General Wellness'}.

Explain briefly how each pose helps. Format it clearly with dot points. Keep it warm, WhatsApp-friendly.`;
    return await groqChat([{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: prompt }]);
}

// ============================================================
// HELPER: Clean text for WhatsApp
// ============================================================
function cleanForWhatsApp(text) {
    if (!text) return '';
    return text
        .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold markdown
        .replace(/__(.*?)__/g, '$1')       // Remove underline markdown
        .replace(/#{1,6}\s/g, '')          // Remove heading markers
        .replace(/```[\s\S]*?```/g, '')    // Remove code blocks
        .replace(/`(.*?)`/g, '$1')         // Remove inline code
        .trim();
}

// ============================================================
// MULTILINGUAL TRANSLATION - Translate orchestrator messages
// ============================================================
async function translateMessage(text, targetLanguage) {
    if (!targetLanguage || targetLanguage.toLowerCase() === 'en' || targetLanguage.toLowerCase() === 'english') return text;

    let languageDirective = `language code/name: ${targetLanguage}`;
    if (targetLanguage.toLowerCase() === 'hinglish') {
        languageDirective = `Hinglish (a natural, warm, and friendly blend of Hindi and English written using the English/Latin alphabet. Tone should be like a caring friend or an empathetic Ayurvedic consultant. Example: "Aapko din mein 2 baar warm water peena chahiye.")`;
    }

    const prompt = `Translate the following exact message into ${languageDirective}. 

CRITICAL RULES:
1. ONLY return the translated text. 
2. DO NOT include any conversational filler, explanations, or quotes.
3. If the message is ALREADY in the target language, just return the exact message as is. DO NOT say "This is already in Hindi" or anything similar. Just output the text.
4. Maintain exactly the same formatting, bullet points, numbering, emojis, and line breaks.

Message to translate:
"${text}"`;

    try {
        const translatedText = await groqChat([
            { role: 'user', content: prompt }
        ], {
            model: MODEL_FAST,
            temperature: 0.1,
            maxTokens: 500
        });

        // Strip any trailing filler the LLM might hallucinate
        let cleaned = translatedText.replace(/^"|"$/g, '').trim();
        if (cleaned.toLowerCase().includes("no translation is needed") || cleaned.toLowerCase().includes("already in")) {
            // Failsafe in case it hallucinates despite strict instructions
            return text;
        }
        return cleaned || text;
    } catch (error) {
        console.error('Translation Error:', error.message);
        return text; // Fallback to English
    }
}

module.exports = {
    generateResponse,
    quickHealthAssessment,
    analyzeHealthConcern,
    detectIntent,
    getYouTubeRecommendations,
    rankDoctorsForCondition,
    translateMessage,
    generateDietPlan,
    generateYogaPlan
};
