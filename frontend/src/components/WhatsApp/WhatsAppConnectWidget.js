import React, { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import "./WhatsAppConnect.css";

const BACKEND_URL = process.env.REACT_APP_AYURVEDA_BACKEND_URL;

const LANGUAGE_OPTIONS = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "hi", name: "हिन्दी (Hindi)", flag: "🇮🇳" },
    { code: "bn", name: "বাংলা (Bengali)", flag: "🇮🇳" },
    { code: "ta", name: "தமிழ் (Tamil)", flag: "🇮🇳" },
    { code: "te", name: "తెలుగు (Telugu)", flag: "🇮🇳" },
];

function WhatsAppConnectWidget() {
    const { auth } = useContext(AuthContext);
    const [userId, setUserId] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    const [deepLink, setDeepLink] = useState(null);
    const [isLinked, setIsLinked] = useState(false);
    const [whatsappNumber, setWhatsappNumber] = useState(null);
    const [preferredLanguage, setPreferredLanguage] = useState("en");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showQR, setShowQR] = useState(false);
    const [unlinkConfirm, setUnlinkConfirm] = useState(false);

    // Decode user ID from token
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserId(decoded.id);
            } catch (err) {
                console.error("Token decode error:", err);
            }
        }
    }, []);

    // Check link status
    const checkLinkStatus = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await fetch(`${BACKEND_URL}/api/whatsapp/link-status/${userId}`);
            const data = await res.json();
            setIsLinked(data.isLinked);
            setWhatsappNumber(data.whatsappNumber);
            setPreferredLanguage(data.preferredLanguage || "en");
            setLoading(false);
        } catch (err) {
            console.error("Link status error:", err);
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        checkLinkStatus();
    }, [checkLinkStatus]);

    // Poll for link status when QR is shown (every 5 seconds)
    useEffect(() => {
        let interval;
        if (showQR && !isLinked && userId) {
            interval = setInterval(checkLinkStatus, 5000);
        }
        return () => clearInterval(interval);
    }, [showQR, isLinked, userId, checkLinkStatus]);

    // Generate QR code
    const generateQR = async () => {
        if (!userId) return;
        setError(null);
        try {
            const res = await fetch(`${BACKEND_URL}/api/whatsapp/link`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ patientId: userId }),
            });
            const data = await res.json();
            setQrCode(data.qrCode);
            setDeepLink(data.deepLink);
            setShowQR(true);
        } catch (err) {
            setError("Failed to generate QR code. Please try again.");
            console.error("QR generation error:", err);
        }
    };

    // Unlink WhatsApp
    const handleUnlink = async () => {
        try {
            await fetch(`${BACKEND_URL}/api/whatsapp/unlink/${userId}`, {
                method: "DELETE",
            });
            setIsLinked(false);
            setWhatsappNumber(null);
            setUnlinkConfirm(false);
            setShowQR(false);
            setQrCode(null);
        } catch (err) {
            console.error("Unlink error:", err);
        }
    };

    // Update language
    const handleLanguageChange = async (lang) => {
        try {
            await fetch(`${BACKEND_URL}/api/whatsapp/update-language`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ patientId: userId, language: lang }),
            });
            setPreferredLanguage(lang);
        } catch (err) {
            console.error("Language update error:", err);
        }
    };

    if (loading) {
        return (
            <div className="wa-widget">
                <div className="wa-widget-loading">
                    <div className="wa-spinner"></div>
                    <p>Loading WhatsApp status...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="wa-widget" id="whatsapp-connect-widget">
            {/* Header */}
            <div className="wa-widget-header">
                <div className="wa-header-icon">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                </div>
                <div className="wa-header-text">
                    <h3>WhatsApp Integration</h3>
                    <p>Book appointments & get notifications on WhatsApp</p>
                </div>
                {isLinked && (
                    <span className="wa-status-badge wa-linked">
                        <span className="wa-status-dot"></span> Connected
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="wa-widget-body">
                {isLinked ? (
                    /* ─── LINKED VIEW ─── */
                    <div className="wa-linked-view">
                        <div className="wa-linked-info">
                            <div className="wa-info-row">
                                <span className="wa-info-label">📱 Number:</span>
                                <span className="wa-info-value">{whatsappNumber?.replace("whatsapp:", "")}</span>
                            </div>
                            <div className="wa-info-row">
                                <span className="wa-info-label">🌐 Language:</span>
                                <select
                                    className="wa-lang-select"
                                    value={preferredLanguage}
                                    onChange={(e) => handleLanguageChange(e.target.value)}
                                >
                                    {LANGUAGE_OPTIONS.map((l) => (
                                        <option key={l.code} value={l.code}>
                                            {l.flag} {l.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="wa-features-list">
                            <h4>What you can do on WhatsApp:</h4>
                            <ul>
                                <li>📋 Book appointments by chatting</li>
                                <li>🔔 Get real-time booking notifications</li>
                                <li>🔗 Receive meet links automatically</li>
                                <li>🎤 Send voice messages in your language</li>
                                <li>📊 Check appointment status</li>
                            </ul>
                        </div>

                        {unlinkConfirm ? (
                            <div className="wa-unlink-confirm">
                                <p>Are you sure you want to disconnect WhatsApp?</p>
                                <div className="wa-unlink-actions">
                                    <button className="wa-btn wa-btn-danger" onClick={handleUnlink}>
                                        Yes, Disconnect
                                    </button>
                                    <button className="wa-btn wa-btn-secondary" onClick={() => setUnlinkConfirm(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button className="wa-btn wa-btn-outline" onClick={() => setUnlinkConfirm(true)}>
                                Disconnect WhatsApp
                            </button>
                        )}
                    </div>
                ) : (
                    /* ─── NOT LINKED VIEW ─── */
                    <div className="wa-unlinked-view">
                        {showQR && qrCode ? (
                            <div className="wa-qr-section">
                                <div className="wa-qr-wrapper">
                                    <img src={qrCode} alt="WhatsApp QR Code" className="wa-qr-image" />
                                </div>
                                <p className="wa-qr-instruction">
                                    Scan this QR code with your phone camera or WhatsApp to connect
                                </p>
                                <a
                                    href={deepLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="wa-btn wa-btn-primary"
                                >
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ marginRight: '8px' }}>
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    Open in WhatsApp
                                </a>
                                <p className="wa-qr-waiting">
                                    <span className="wa-spinner-sm"></span>
                                    Waiting for connection...
                                </p>
                            </div>
                        ) : (
                            <div className="wa-connect-section">
                                <div className="wa-connect-illustration">
                                    <svg viewBox="0 0 24 24" width="64" height="64" fill="#25D366">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                </div>
                                <h4>Connect your WhatsApp</h4>
                                <p className="wa-connect-desc">
                                    Get appointment updates, book consultations, and communicate in your
                                    preferred language — all through WhatsApp!
                                </p>
                                <div className="wa-lang-chips">
                                    {LANGUAGE_OPTIONS.map((l) => (
                                        <span key={l.code} className="wa-lang-chip">
                                            {l.flag} {l.name.split(" ")[0]}
                                        </span>
                                    ))}
                                </div>
                                <button className="wa-btn wa-btn-primary wa-btn-lg" onClick={generateQR}>
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{ marginRight: '8px' }}>
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    Connect WhatsApp
                                </button>
                                {error && <p className="wa-error">{error}</p>}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default WhatsAppConnectWidget;
