const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const LANGUAGE_NAMES = {
    en: "English",
    hi: "Hindi",
    bn: "Bengali",
    ta: "Tamil",
    te: "Telugu",
};

/**
 * Detect the language of the input text using Gemini
 */
const detectLanguage = async (text) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `Detect the language of the following text and respond with ONLY the ISO 639-1 two-letter language code (en, hi, bn, ta, te). If unsure default to "en".

Text: "${text}"

Language code:`;

        const result = await model.generateContent(prompt);
        const response = result.response.text().trim().toLowerCase();

        // Validate it's one of our supported languages
        const supportedLangs = ["en", "hi", "bn", "ta", "te"];
        return supportedLangs.includes(response) ? response : "en";
    } catch (error) {
        console.error("❌ Language detection error:", error.message);
        return "en";
    }
};

/**
 * Translate text to a target language using Gemini
 */
const translateToLanguage = async (text, targetLang) => {
    if (targetLang === "en") return text; // Already English, Gemini generates in English

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const langName = LANGUAGE_NAMES[targetLang] || "English";

        const prompt = `Translate the following text to ${langName}. Return ONLY the translation, nothing else.

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
 * Detect language and translate to English for processing
 */
const detectAndTranslateToEnglish = async (text) => {
    try {
        const detectedLang = await detectLanguage(text);

        if (detectedLang === "en") {
            return { originalText: text, translatedText: text, detectedLanguage: "en" };
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `Translate the following ${LANGUAGE_NAMES[detectedLang]} text to English. Return ONLY the English translation, nothing else.

Text: "${text}"

English translation:`;

        const result = await model.generateContent(prompt);
        const translatedText = result.response.text().trim();

        return {
            originalText: text,
            translatedText,
            detectedLanguage: detectedLang,
        };
    } catch (error) {
        console.error("❌ Detect and translate error:", error.message);
        return {
            originalText: text,
            translatedText: text,
            detectedLanguage: "en",
        };
    }
};

module.exports = {
    detectLanguage,
    translateToLanguage,
    detectAndTranslateToEnglish,
    LANGUAGE_NAMES,
};
