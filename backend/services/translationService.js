const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const LANGUAGE_NAMES = {
    en: "English",
    hi: "Hindi",
    bn: "Bengali",
    ta: "Tamil",
    te: "Telugu",
    hinglish: "Hinglish",
};

// All supported language codes (internal)
const SUPPORTED_LANGS = ["en", "hi", "bn", "ta", "te", "hinglish"];

/**
 * Detect the language of the input text using Gemini.
 * Also detects Hinglish (Hindi-English mix).
 */
const detectLanguage = async (text) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `Detect the language of the following text and respond with ONLY one of these codes: en, hi, bn, ta, te, hinglish.

Hinglish means it is a mix of Hindi and English, e.g. "mujhe doctor se milna hai", "appointment book karo", "mera pet kharab hai please help".

Text: "${text}"

Language code:`;

        const result = await model.generateContent(prompt);
        const response = result.response.text().trim().toLowerCase();

        return SUPPORTED_LANGS.includes(response) ? response : "en";
    } catch (error) {
        console.error("❌ Language detection error:", error.message);
        return "en";
    }
};

/**
 * Translate text to a target language using Gemini.
 * For "hinglish", generates a natural Hindi-English mix using Romanized Hindi + English.
 */
const translateToLanguage = async (text, targetLang) => {
    if (targetLang === "en") return text;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        let langInstruction;
        if (targetLang === "hinglish") {
            langInstruction =
                "Translate the following text into Hinglish — a casual mix of Hindi and English " +
                "written in Roman/Latin script (not Devanagari). " +
                "Use natural spoken Hinglish like 'aapka appointment confirm ho gaya hai', 'doctor se milne ka time'. " +
                "Keep medical terms, numbers, dates, and names in English.";
        } else {
            const langName = LANGUAGE_NAMES[targetLang] || "English";
            langInstruction = `Translate the following text to ${langName}. Use the native script of the language.`;
        }

        const prompt = `${langInstruction}

Return ONLY the translation, nothing else.

Text: "${text}"

Translation:`;

        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error("❌ Translation error:", error.message);
        return text; // Return original on error
    }
};

/**
 * Single AI call to analyze an incoming message.
 * Extracts: 
 * - The original detected language
 * - The English translation
 * - Whether the user wants to switch the chatbot's language (intent)
 */
const analyzeIncomingMessage = async (text) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `Analyze the following incoming text from a WhatsApp bot user.
1. Detect the language it's written in (choose EXACTLY one of: en, hi, bn, ta, te, hinglish).
   ('hinglish' means it's a mix of Hindi and English written in Latin script).
2. Translate the text to clean English. (Keep names, numbers, and dates as-is).
3. Determine if the user is explicitly requesting to change the bot's conversation language (e.g., "I want to talk in Bengali", "hindi mein baat karni hai", "switch to tamil").
4. If they are, what is the language code they want? (en, hi, bn, ta, te, hinglish, or null if not a language switch request).
5. Classify the user's main intent into exactly ONE of the following:
   - BOOK_APPOINTMENT (wants to consult a doctor, schedule a call, etc)
   - CHECK_STATUS (wants to check an existing booking)
   - CHANGE_LANGUAGE (explicitly wants to change the language)
   - HEALTH_ADVICE (describing a health problem, asking for a cure, remedies, or a video about a health issue)
   - GREETING (hi, hello, menu, help)
   - OTHER

Respond in strict JSON format:
{
  "detectedLanguage": "language_code",
  "translatedText": "english_translation_here",
  "isLanguageSwitchRequest": true/false,
  "requestedLanguageCode": "language_code_or_null",
  "intent": "INTENT_LABEL"
}

Text: "${text}"`;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text().trim();

        if (responseText.startsWith("\`\`\`json")) {
            responseText = responseText.replace(/^\`\`\`json/, "").replace(/\`\`\`$/, "").trim();
        }

        const json = JSON.parse(responseText);

        const detectedLang = SUPPORTED_LANGS.includes(json.detectedLanguage) ? json.detectedLanguage : "en";
        const translatedText = json.translatedText || text;
        const requestedLang = (json.isLanguageSwitchRequest && SUPPORTED_LANGS.includes(json.requestedLanguageCode))
            ? json.requestedLanguageCode
            : null;

        return {
            originalText: text,
            translatedText: translatedText,
            detectedLanguage: detectedLang,
            langSwitchRequest: requestedLang,
            intent: json.intent || "OTHER"
        };
    } catch (error) {
        console.error("❌ Analyze message error:", error.message);
        return {
            originalText: text,
            translatedText: text,
            detectedLanguage: "en",
            langSwitchRequest: null,
            intent: "OTHER"
        };
    }
};

module.exports = {
    detectLanguage,
    translateToLanguage,
    analyzeIncomingMessage,
    LANGUAGE_NAMES,
    SUPPORTED_LANGS,
};
