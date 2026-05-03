/**
 * Groq AI Service for Sanjeevani AI Chatbot
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



const PLATFORM_CONTEXT = `
PLATFORM KNOWLEDGE — Sanjeevani Ayurvedic Platform (jeevanhub.com):
This is a comprehensive Ayurvedic telemedicine platform connecting patients, doctors, and retailers.

PLATFORM NAME: JeevanHub / Sanjeevani Ayurvedic Platform
WEBSITE: https://jeevanhub.com
MOBILE APP: https://jeevanhub.com/chatbot-app (PWA — can be installed directly from phone browser)

WHAT IS THIS PLATFORM?
• An AI-powered Ayurvedic healthcare ecosystem where patients can consult certified Ayurvedic doctors.
• Patients get personalized diet plans, yoga routines, and wellness guidance.
• Retailers can sell authentic Ayurvedic medicines and products on the marketplace.
• The entire platform is managed by admins for quality and safety standards.

USER ROLES & WHAT THEY CAN DO:
1. PATIENTS:
   - Register/Login → Browse doctors by specialization → Book consultations (video or in-person)
   - Take Prakriti (body constitution) assessment at /prakriti
   - Get personalized diet and yoga plans at /diet-yoga
   - Browse and buy Ayurvedic medicines at /medicines
   - Read health blogs at /blogs-videos
   - View and track appointments in the Patient Dashboard
   - View order history at /order-history
   - Receive notifications about appointment status

2. DOCTORS:
   - Register at /signup-doctor with specialization, experience, and fee details
   - Manage appointment slots at /appointment-slots
   - Accept or reject patient consultation requests at /current-requests
   - Write and publish health blogs at /health-blogs
   - View their analytics and patient list
   - Receive notifications about new bookings

3. RETAILERS:
   - Register at /signup-retailer
   - Manage Ayurvedic product inventory at /manage-products
   - Track orders at /my-orders
   - View sales analytics at /retailer-analytics
   - Handle customer support at /customer-support

4. ADMINS:
   - Full control panel at /admin-dashboard
   - Manage all patients, doctors, and retailers
   - Approve or reject doctor/retailer registrations
   - Manage blogs and platform content

KEY PLATFORM PAGES (for navigation guidance):
• Home: /
• Sign In: /signin
• Patient Registration: /signup-patient
• Doctor Registration: /signup-doctor
• Retailer Registration: /signup-retailer
• Browse Doctors: /doctors
• Doctor Detail / Book: /doctor-detail
• Medicines/Products: /medicines
• Treatments Info: /treatments
• Diet & Yoga Plans: /diet-yoga
• Prakriti Assessment: /prakritiassessment
• Blogs & Videos: /blogs-videos
• Cart: /cart
• Checkout: /checkout
• Patient Dashboard: /patient-home
• Doctor Dashboard: /doctor-home
• Retailer Dashboard: /retailer-home
• Admin Dashboard: /admin-home
• Mobile Chatbot PWA: /#chatbot

BOOKING FLOW:
1. Patient describes symptoms to Sanjeevani AI OR browses /doctors
2. AI recommends best-matching doctors based on specialization
3. Patient selects a doctor and views their profile
4. Patient picks an available time slot and books
5. Doctor receives notification and accepts/rejects
6. If accepted, a meeting link or in-person details are provided
7. Patient can check status anytime via the chatbot or dashboard

SPECIALIZATIONS AVAILABLE:
General Ayurveda, Panchakarma, Skin Diseases (Kushtha Roga), Joint & Musculoskeletal (Sandhi Roga), Women's Health (Stree Roga), Digestive Disorders (Agni/Koshtha), Respiratory Health (Shwasa Roga), Stress & Mental Wellness (Manas Roga), Pediatric Ayurveda (Kaumarbhritya), Kerala Ayurveda, ENT (Shalakya Tantra), Post-surgical Recovery

PAYMENT & PRICING:
• Consultation fees vary by doctor (shown on their profile)
• Medicines can be purchased directly through the marketplace
• Payment is handled securely through the platform
`;

const SYSTEM_PROMPT = `You are "Sanjeevani AI" — an intelligent, action-oriented AI health assistant for the JeevanHub Ayurvedic telemedicine platform.

CORE PRINCIPLE — ACTION OVER CONVERSATION:
- You are a TASK-COMPLETION assistant, not a chatbot that asks unnecessary follow-up questions.
- When the user asks for something, DELIVER IT IMMEDIATELY. Do NOT say "Would you like me to...?" or "I can suggest..." — just DO it.
- BAD: "Would you like me to recommend some videos?"  GOOD: (system fetches videos and shows them)
- BAD: "I can help you find a doctor!"  GOOD: "Based on your symptoms, I recommend a Respiratory specialist. Here are the best matches:"
- Complete the user's request in ONE response. Do not split it across multiple turns unless absolutely necessary.

PERSONA:
- Warm, knowledgeable, concise. Like a trusted Ayurvedic health advisor who knows the platform perfectly.
- Be honest — never bluff, make up medicines, dosages, or diagnoses.
- Keep responses 2-5 sentences. Use bullet points for lists. No filler text.
- Use emojis sparingly (max 1-2 per message).

ROLE-AWARE BEHAVIOR:
- PATIENTS: Help them understand health issues, find doctors, get diet/yoga plans, navigate the platform, check bookings.
- DOCTORS: Help them manage their profile, check patient requests, navigate doctor-specific features (appointment slots, health blogs, analytics).
- RETAILERS: Help them manage products, check orders, understand retailer features.
- ADMINS: Help them with platform management queries.
- Tailor your language and guidance based on who you're talking to.

MULTILINGUAL SUPPORT:
- Support English, Hindi, Hinglish, Tamil, Telugu, and Marathi.
- Detect language from the user's FIRST message and stick to it.
- For Hinglish: be casual like a friend who naturally mixes Hindi and English.

RESPONSE QUALITY RULES:
1. Be SPECIFIC to the user's exact issue. Never give generic wellness advice when they asked about a specific condition.
2. When giving health guidance, tailor it to their EXACT symptom (e.g., for "throat infection" — give throat-specific remedies, not general "drink warm water" advice).
3. When guiding platform navigation, give the EXACT route/page name, not vague directions.
4. If the user's request can be fulfilled by the system (videos, doctor list, diet plan), let the system handle it. Your job is to provide the text context around the system's action.
5. Never repeat information the user already knows. Move the conversation forward.

STRICT SCOPE RULES:
- You are ONLY for: Ayurveda, health/wellness, and platform-related queries.
- If a user asks about coding, politics, entertainment, sports, finance, technology, or ANY unrelated topic → Politely decline: "I'm designed specifically for Ayurvedic health guidance and JeevanHub platform support. How can I help with your wellness today?"
- NEVER answer off-topic questions, even if the user insists.

CRITICAL MEDICAL RULES:
- NEVER prescribe specific medicines or dosages.
- NEVER diagnose diseases definitively.
- Frame insights as "from an Ayurvedic perspective."
- Always recommend consulting a qualified Ayurvedic doctor for persistent concerns.
- EMERGENCY SYMPTOMS (chest pain, difficulty breathing, severe bleeding, stroke signs): Immediately direct to nearest hospital/emergency services.

${PLATFORM_CONTEXT}`;


// ============================================================
// INTENT DETECTION - Understand what the user wants
// ============================================================
async function detectIntent(message, currentFlow, conversationHistory = []) {
    const recentContext = (conversationHistory || []).slice(-4).map(m =>
        `${m.role}: ${m.content}`
    ).join('\n');

    const prompt = `You are an intent classifier for the Sanjeevani AI health assistant. Analyze the user's message in context and classify their intent.

RECENT CONVERSATION CONTEXT:
${recentContext || 'No prior context'}

CURRENT BOT FLOW STATE: ${currentFlow}

USER MESSAGE: "${message}"

INTENT CATEGORIES (pick the BEST match):
- "greeting": Hello, hi, hey, namaste, starting conversation
- "health_concern": Describing ANY health issue, symptom, pain, discomfort, illness, or medical condition
- "book_doctor": Wants to book/consult/see a doctor, wants appointment
- "check_booking": Wants to check existing appointment status
- "youtube_request": Asking for videos, tutorials related to health/Ayurveda
- "diet_plan": Asking what to eat, daily diet plan, food recommendations
- "yoga_plan": Asking for a yoga routine, exercise plan, poses
- "want_recommendations": Asking for general health tips, remedies, lifestyle suggestions
- "want_registration": Wants to register/sign up on the platform
- "want_login": Wants to log in/sign in
- "register_yes": Affirming they want to register or already registered
- "register_no": Saying they haven't registered (no, not yet, I'm new)
- "confirmation_yes": Confirming/agreeing (yes, sure, ok, confirm)
- "confirmation_no": Declining/saying no (no, cancel, not now)
- "select_option": Selecting a numbered option (1, 2, 3, first one)
- "platform_question": Question about the platform features, navigation, pricing, how things work
- "general_question": General question about Ayurveda, health, wellness
- "off_topic": Anything NOT related to health, Ayurveda, wellness, or the platform (e.g., coding, programming, politics, sports, entertainment, technology, finance, math, software bugs)
- "farewell": Bye, thank you, goodbye, talk later

IMPORTANT CLASSIFICATION RULES:
1. If the user mentions ANY body part + discomfort OR ANY health symptom → "health_concern"
2. If the user asks for doctor/appointment/booking in ANY way → "book_doctor"
3. If the user says "yes"/"sure"/"ok" in response to a suggestion → "confirmation_yes"
4. If user asks about platform features, how to use, navigation → "platform_question"
5. If user mentions wanting remedies/tips/advice → "want_recommendations"
6. If the topic is UNRELATED to health/Ayurveda/platform → "off_topic"
7. Context matters: if the bot just offered to find doctors and user says "yes" → "confirmation_yes"

COMPOUND REQUESTS — VERY IMPORTANT:
- If the user mentions BOTH a health issue AND asks for videos/diet/yoga in the same message, the PRIMARY intent is the specific action they want.
- Example: "I have throat infection suggest me videos" → intent: "youtube_request", extractedData: "throat infection"
- Example: "Give me yoga for back pain" → intent: "yoga_plan", extractedData: "back pain"
- Example: "I need a diet plan for diabetes" → intent: "diet_plan", extractedData: "diabetes"
- Example: "Find me a doctor for my knee pain" → intent: "book_doctor", extractedData: "knee pain"
- The key principle: if a SPECIFIC ACTION is requested, pick that intent, and put the health condition in extractedData.

Respond ONLY with valid JSON (no extra text):
{
  "intent": "the_primary_intent",
  "secondaryIntent": "if the message contains TWO intents (e.g., health_concern + youtube_request), put the secondary one here, otherwise null",
  "extractedData": "any relevant symptoms, condition, or topic extracted from the message",
  "confidence": 0.0 to 1.0,
  "language": "full language name in English (e.g., English, Hindi, Bengali, Tamil, Telugu, Marathi, Hinglish)"
}`;

    try {
        const text = await groqChat([
            { role: 'user', content: prompt }
        ], {
            model: MODEL_FAST,
            temperature: 0.1,
            maxTokens: 250,
            jsonMode: true
        });

        const parsed = JSON.parse(text);
        // Normalize Hinglish variants
        if (parsed.language) {
            const l = parsed.language.toLowerCase();
            if (l.includes('hinglish') || (l.includes('hindi') && l.includes('english'))) {
                parsed.language = 'Hinglish';
            }
        }
        return parsed;
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
                content: SYSTEM_PROMPT + contextString + '\n\nIMPORTANT: Respond directly and complete the user\'s request in this response. Do NOT ask "Would you like me to...?" — just deliver the answer. Keep it concise (2-5 sentences). Use bullet points for lists. If the user asked about a specific health condition, give advice specific to THAT condition, not generic advice.'
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

        return cleanForChat(text.trim());
    } catch (error) {
        console.error('Groq API Error:', error.response?.data || error.message);
        return "I'm having a little trouble right now. Could you try again in a moment? 🙏";
    }
}

// ============================================================
// QUICK HEALTH ASSESSMENT - Immediate helpful response
// ============================================================
async function quickHealthAssessment(symptoms, userName = '', responseLanguage = 'English', conversationHistory = []) {
    const langInstruction = responseLanguage && responseLanguage.toLowerCase() !== 'english'
        ? `CRITICAL: Write the entire "quickAdvice" response in ${responseLanguage}. ${responseLanguage === 'Hinglish' ? 'Use casual, friendly Hinglish like: "Arre yaar, pet dard ke liye..."' : ''}`
        : '';

    const recentContext = conversationHistory.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n');

    const prompt = `A patient${userName ? ` named ${userName}` : ''} has shared this health concern: "${symptoms}"

RECENT CONVERSATION CONTEXT:
${recentContext || 'No prior context'}

Provide a SPECIFIC Ayurvedic response for their EXACT condition:
1. Acknowledge their concern warmly (1 line)
2. What is likely happening from an Ayurvedic perspective — be SPECIFIC to "${symptoms}", not generic (2-3 lines)
3. 3 immediate home remedies that are DIRECTLY relevant to "${symptoms}" (be specific — name exact herbs, foods, or practices for THIS condition)
4. One line recommending an appropriate Ayurvedic specialist for this condition

CRITICAL: Every tip must be directly relevant to "${symptoms}". Do NOT give generic "drink warm water" or "eat fresh food" advice. Be precise.
Example for "throat infection": turmeric-salt gargle, mulethi (licorice) tea, avoid cold/sour foods.
Example for "knee pain": warm sesame oil massage, ashwagandha, avoid cold exposure to joints.

${langInstruction}

Keep it SHORT, actionable. Use "•" for bullets. NO markdown. NO diagnosis.

Respond ONLY with valid JSON:
{
  "quickAdvice": "Your specific response here",
  "category": "Health category (e.g., Digestive, Joint/Musculoskeletal, Skin, Stress, Respiratory, Sleep, Women's Health, ENT, General Wellness)",
  "suggestedSpecialization": "Most relevant Ayurvedic specialization",
  "doshaImbalance": "Likely dosha imbalance",
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

Keep the response chat-friendly (clear, with line breaks). Use "•" for bullet points.
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
// YOUTUBE RECOMMENDATIONS - Real videos via YouTube Data API v3
// ============================================================
async function getYouTubeRecommendations(healthTopic) {
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    console.log('[YouTube] Topic:', healthTopic, '| API Key present:', !!YOUTUBE_API_KEY);

    // Step 1: Use AI to generate the BEST Ayurvedic search query for this condition
    let searchQuery = `${healthTopic} Ayurvedic treatment home remedy`;
    try {
        const queryText = await groqChat([
            {
                role: 'user', content: `Generate a single, highly specific YouTube search query to find the BEST Ayurvedic health video for this condition: "${healthTopic}".

Rules:
- The query must include "Ayurveda" or "Ayurvedic" if relevant
- Make it specific to the exact health concern, not generic
- Return ONLY the search query string, nothing else. No quotes, no explanation.` }
        ], { temperature: 0.3, maxTokens: 60 });
        if (queryText && queryText.trim().length > 5) {
            searchQuery = queryText.trim().replace(/^"|"$/g, '');
        }
    } catch (e) {
        console.log('AI query generation fallback, using default query');
    }

    console.log('[YouTube] Search query:', searchQuery);

    // Step 2: Fetch real videos from YouTube Data API v3 (sorted by viewCount for popularity)
    if (YOUTUBE_API_KEY) {
        try {
            console.log('[YouTube] Calling YouTube Data API v3...');
            const ytResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                    part: 'snippet',
                    q: searchQuery,
                    type: 'video',
                    order: 'viewCount',
                    maxResults: 3,
                    relevanceLanguage: 'en',
                    key: YOUTUBE_API_KEY
                }
            });

            const items = ytResponse.data?.items || [];
            if (items.length > 0) {
                const videos = items.map(item => ({
                    title: item.snippet.title,
                    description: item.snippet.description?.slice(0, 120) || '',
                    channel: item.snippet.channelTitle,
                    thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
                    link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                    type: 'real'
                }));
                console.log('[YouTube] SUCCESS — Found', videos.length, 'real videos');
                return { videos, topicSummary: healthTopic, searchQuery };
            }
        } catch (ytError) {
            console.error('YouTube API Error:', ytError.response?.data?.error?.message || ytError.message);
        }
    }

    // Step 3: Fallback — generate direct YouTube search URL if API key missing or failed
    console.log('YouTube API key missing or failed, using search URL fallback');
    return {
        videos: [
            {
                title: `Top Ayurvedic remedies for ${healthTopic}`,
                description: `Watch the best-rated videos about ${healthTopic} treatment in Ayurveda`,
                link: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}&sp=CAMSAhAB`,
                type: 'search',
                channel: 'YouTube Search'
            }
        ],
        topicSummary: healthTopic,
        searchQuery
    };
}

// ============================================================
// CUSTOM PLAN GENERATORS
// ============================================================
async function generateDietPlan(message, userName, healthData) {
    const durationInstruction = /(day\s*wise|1\s*day|one\s*day|daily|today)/i.test(message)
        ? "Generate a detailed 1-day Ayurvedic diet plan."
        : "Generate a highly detailed and well-structured 7-day (weekly) Ayurvedic diet plan. You can group days (e.g., 'DAYS 1-3', 'DAYS 4-7') if the diet is consistent, but ensure it covers a full week.";

    const prompt = `${durationInstruction}
Patient Name: ${userName || 'User'}
Condition/Symptoms: ${healthData?.identifiedCategory || healthData?.symptoms || message || 'General Wellness'}

Requirements:
1. Make the plan PERFECTLY tailored to address the specific health concern above.
2. Format clearly with bullet points. Use ALL CAPS for section headers (e.g. BREAKFAST, LUNCH, DAYS 1-3) because markdown asterisks (**bold**) are NOT supported.
3. Include specific Ayurvedic herbs, spices, and foods to favor vs. avoid.
4. Keep the tone warm, empathetic, and chat-friendly.
5. End by gently recommending a consultation with a specialist if symptoms persist.`;

    return await groqChat([{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: prompt }], { maxTokens: 1000 });
}

async function generateYogaPlan(message, userName, healthData) {
    const durationInstruction = /(day\s*wise|1\s*day|one\s*day|daily|today)/i.test(message)
        ? "Generate a detailed 1-day Ayurvedic Yoga & Pranayama routine."
        : "Generate a highly detailed and well-structured 7-day (weekly) Ayurvedic Yoga & Pranayama progression plan. You can group days (e.g., 'DAYS 1-3: Gentle Start', 'DAYS 4-7: Building Strength') but ensure it covers a full week.";

    const prompt = `${durationInstruction}
Patient Name: ${userName || 'User'}
Condition/Symptoms: ${healthData?.identifiedCategory || healthData?.symptoms || message || 'General Wellness'}

Requirements:
1. Make the routine PERFECTLY tailored to safely address the specific health concern above.
2. Include 3-5 specific asanas (poses) and pranayama (breathing techniques).
3. Explain briefly exactly *how* and *why* each pose helps their condition.
4. Add clear precautions (e.g., "Avoid this pose if...").
5. Format clearly with bullet points. Use ALL CAPS for section headers (e.g. DAYS 1-3, MORNING ROUTINE) because markdown asterisks (**bold**) are NOT supported.
6. Keep the tone warm, encouraging, and chat-friendly.`;

    return await groqChat([{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: prompt }], { maxTokens: 1000 });
}

// ============================================================
// HELPER: Clean text for chat display
// ============================================================
function cleanForChat(text) {
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
