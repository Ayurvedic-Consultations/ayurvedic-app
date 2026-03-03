const speech = require("@google-cloud/speech");
const axios = require("axios");

// Language code mapping for Google Speech-to-Text
const LANGUAGE_CODES = {
    en: "en-IN",
    hi: "hi-IN",
    bn: "bn-IN",
    ta: "ta-IN",
    te: "te-IN",
};

/**
 * Transcribe an audio file from a URL using Google Cloud Speech-to-Text
 * WhatsApp voice notes come as .ogg/opus files which are natively supported
 */
const transcribeAudio = async (audioUrl, languageCode = "en") => {
    try {
        // Download the audio file from Twilio's URL
        const response = await axios.get(audioUrl, {
            responseType: "arraybuffer",
            auth: {
                username: process.env.TWILIO_ACCOUNT_SID,
                password: process.env.TWILIO_AUTH_TOKEN,
            },
        });

        const audioBytes = Buffer.from(response.data).toString("base64");

        // Initialize the Speech client
        const client = new speech.SpeechClient();

        const googleLangCode = LANGUAGE_CODES[languageCode] || "en-IN";

        const request = {
            audio: {
                content: audioBytes,
            },
            config: {
                encoding: "OGG_OPUS",
                sampleRateHertz: 16000,
                languageCode: googleLangCode,
                // Enable automatic language detection as fallback
                alternativeLanguageCodes: Object.values(LANGUAGE_CODES).filter(
                    (code) => code !== googleLangCode
                ),
                enableAutomaticPunctuation: true,
            },
        };

        const [speechResponse] = await client.recognize(request);

        if (
            speechResponse.results &&
            speechResponse.results.length > 0
        ) {
            const transcription = speechResponse.results
                .map((result) => result.alternatives[0].transcript)
                .join(" ");

            // Detect which language was actually spoken
            const detectedLang =
                speechResponse.results[0]?.languageCode || googleLangCode;

            console.log(`🎤 Transcribed audio (${detectedLang}): ${transcription}`);

            return {
                text: transcription,
                detectedLanguage: detectedLang,
                confidence:
                    speechResponse.results[0]?.alternatives[0]?.confidence || 0,
            };
        }

        return {
            text: "",
            detectedLanguage: googleLangCode,
            confidence: 0,
        };
    } catch (error) {
        console.error("❌ Speech-to-Text error:", error.message);

        // Fallback: return a message indicating transcription failed
        return {
            text: "",
            detectedLanguage: languageCode,
            confidence: 0,
            error: error.message,
        };
    }
};

/**
 * Detect language from a short language code string (from Google STT response)
 */
const mapDetectedLanguage = (googleLangCode) => {
    const mapping = {
        "en-in": "en",
        "en-us": "en",
        "hi-in": "hi",
        "bn-in": "bn",
        "ta-in": "ta",
        "te-in": "te",
    };
    return mapping[googleLangCode?.toLowerCase()] || "en";
};

module.exports = {
    transcribeAudio,
    mapDetectedLanguage,
    LANGUAGE_CODES,
};
