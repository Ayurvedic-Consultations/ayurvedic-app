import React from "react";
import { useNavigate } from "react-router-dom";
import "./WhatsAppPromo.css";

function WhatsAppPromoSection() {
    const navigate = useNavigate();

    return (
        <section className="wa-promo-section" id="whatsapp-promo">
            <div className="wa-promo-container">
                {/* Left side — text content */}
                <div className="wa-promo-content">
                    <div className="wa-promo-badge">
                        <span className="wa-promo-badge-dot"></span>
                        NEW FEATURE
                    </div>
                    <h2 className="wa-promo-title">
                        Book Consultations on{" "}
                        <span className="wa-promo-highlight">WhatsApp</span>
                    </h2>
                    <p className="wa-promo-desc">
                        Now you can book Ayurvedic doctor appointments, get real-time
                        notifications, and receive consultation links — all directly on
                        WhatsApp in your preferred language.
                    </p>

                    <div className="wa-promo-features">
                        <div className="wa-promo-feature">
                            <span className="wa-promo-feature-icon">📋</span>
                            <div>
                                <strong>Book Appointments</strong>
                                <p>Chat to schedule consultations with Ayurvedic doctors</p>
                            </div>
                        </div>
                        <div className="wa-promo-feature">
                            <span className="wa-promo-feature-icon">🌐</span>
                            <div>
                                <strong>5 Languages Supported</strong>
                                <p>English, Hindi, Bengali, Tamil & Telugu — text & voice</p>
                            </div>
                        </div>
                        <div className="wa-promo-feature">
                            <span className="wa-promo-feature-icon">🔗</span>
                            <div>
                                <strong>Instant Meet Links</strong>
                                <p>Get consultation links delivered right to your WhatsApp</p>
                            </div>
                        </div>
                        <div className="wa-promo-feature">
                            <span className="wa-promo-feature-icon">🎤</span>
                            <div>
                                <strong>Voice Messages</strong>
                                <p>Send voice notes — our AI understands your language</p>
                            </div>
                        </div>
                    </div>

                    <button
                        className="wa-promo-cta"
                        onClick={() => navigate("/signin")}
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Get Started — Connect WhatsApp
                    </button>

                    <div className="wa-promo-langs">
                        <span>🇬🇧 English</span>
                        <span>🇮🇳 हिन्दी</span>
                        <span>🇮🇳 বাংলা</span>
                        <span>🇮🇳 தமிழ்</span>
                        <span>🇮🇳 తెలుగు</span>
                    </div>
                </div>

                {/* Right side — visual */}
                <div className="wa-promo-visual">
                    <div className="wa-promo-phone">
                        <div className="wa-promo-phone-header">
                            <div className="wa-promo-phone-avatar">🌿</div>
                            <div>
                                <div className="wa-phone-name">Ayurvedic Consultations</div>
                                <div className="wa-phone-status">Online</div>
                            </div>
                        </div>
                        <div className="wa-promo-phone-body">
                            <div className="wa-chat-bubble wa-chat-received">
                                <p>👋 Welcome to Ayurvedic Consultations!</p>
                                <p>How can I help you today?</p>
                                <span className="wa-chat-time">10:30 AM</span>
                            </div>
                            <div className="wa-chat-bubble wa-chat-sent">
                                <p>I want to book an appointment</p>
                                <span className="wa-chat-time">10:31 AM ✓✓</span>
                            </div>
                            <div className="wa-chat-bubble wa-chat-received">
                                <p>👨‍⚕️ Here are available doctors:</p>
                                <p>1️⃣ Dr. Sharma — Ayurveda<br />2️⃣ Dr. Patel — Panchakarma</p>
                                <span className="wa-chat-time">10:31 AM</span>
                            </div>
                            <div className="wa-chat-bubble wa-chat-sent">
                                <p>1</p>
                                <span className="wa-chat-time">10:32 AM ✓✓</span>
                            </div>
                            <div className="wa-chat-bubble wa-chat-received">
                                <p>✅ Appointment booked!</p>
                                <p>🔗 Meeting link will be sent once confirmed.</p>
                                <span className="wa-chat-time">10:32 AM</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default WhatsAppPromoSection;
