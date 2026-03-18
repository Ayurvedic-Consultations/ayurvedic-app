const OpenAI = require("openai");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Map internal language codes to Whisper-compatible ISO 639-1 codes
const WHISPER_LANG_MAP = {
    en: "en",
    hi: "hi",
    bn: "bn",
    ta: "ta",
    te: "te",
};

/**
 * Transcribe an audio file from a Twilio media URL using OpenAI Whisper API.
 * Supports multi-language audio (Hindi, Bengali, Tamil, Telugu, English, Hinglish).
 *
 * @param {string} audioUrl - The media URL from Twilio
 * @param {string} languageCode - The user's preferred language (en/hi/bn/ta/te)
 * @returns {{ text: string, detectedLanguage: string, confidence: number }}
 */
const transcribeAudio = async (audioUrl, languageCode = "en") => {
    let tempFilePath = null;
    try {
        // 1. Download the audio from Twilio (requires basic auth)
        const response = await axios.get(audioUrl, {
            responseType: "arraybuffer",
            auth: {
                username: process.env.TWILIO_ACCOUNT_SID,
                password: process.env.TWILIO_AUTH_TOKEN,
            },
        });

        // 2. Save to a temp file (Whisper API requires a file upload)
        tempFilePath = path.join(os.tmpdir(), `whatsapp_audio_${Date.now()}.ogg`);
        fs.writeFileSync(tempFilePath, Buffer.from(response.data));

        console.log(`🎤 Audio downloaded to ${tempFilePath} (${Buffer.from(response.data).length} bytes)`);

        // 3. Call OpenAI Whisper API for transcription
        const whisperLang = WHISPER_LANG_MAP[languageCode] || undefined;

        const transcription = await openai.audio.transcriptions.create({
            model: "whisper-1",
            file: fs.createReadStream(tempFilePath),
            response_format: "verbose_json",
            // If user set a preferred language, hint Whisper about it
            // Otherwise let Whisper auto-detect for mixed/Hinglish inputs
            ...(whisperLang && whisperLang !== "en"
                ? { language: whisperLang }
                : {}),
            prompt: "This audio may contain Hinglish (Hindi-English mixed), Hindi, Bengali, Tamil, Telugu, or English. Transcribe everything faithfully.",
        });

        const text = transcription.text || "";
        const detectedLang = transcription.language || languageCode;

        console.log(`🎤 Whisper transcribed (lang: ${detectedLang}): ${text}`);

        return {
            text,
            detectedLanguage: mapWhisperLang(detectedLang),
            confidence: 1, // Whisper doesn't return confidence per-segment in this mode
        };
    } catch (error) {
        console.error("❌ OpenAI Whisper Speech-to-Text error:", error.message);
        return {
            text: "",
            detectedLanguage: languageCode,
            confidence: 0,
            error: error.message,
        };
    } finally {
        // 4. Clean up temp file
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            try {
                fs.unlinkSync(tempFilePath);
            } catch (_) {}
        }
    }
};

/**
 * Map Whisper's detected language string back to our internal 2-letter codes
 */
const mapWhisperLang = (whisperLang) => {
    if (!whisperLang) return "en";
    const lowered = whisperLang.toLowerCase();
    const mapping = {
        english: "en",
        hindi: "hi",
        bengali: "bn",
        tamil: "ta",
        telugu: "te",
        en: "en",
        hi: "hi",
        bn: "bn",
        ta: "ta",
        te: "te",
    };
    return mapping[lowered] || "en";
};

module.exports = {
    transcribeAudio,
    mapWhisperLang,
};
