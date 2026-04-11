import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Floating "Back to Chat" button that appears on ALL routes
 * ONLY when the user originally entered via the /chatbot-app PWA.
 * Hidden on /chatbot-app itself since they're already there.
 */
const BackToChatFab = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [show, setShow] = useState(false);

    useEffect(() => {
        // If user is currently ON the chatbot-app, mark the session flag
        if (location.pathname === '/chatbot-app') {
            sessionStorage.setItem('sanjeevani_pwa_session', 'true');
        }

        // Show the FAB only if:
        // 1. User came from /chatbot-app during this browser session
        // 2. User is NOT currently on /chatbot-app
        const fromPwa = sessionStorage.getItem('sanjeevani_pwa_session') === 'true';
        setShow(fromPwa && location.pathname !== '/chatbot-app');
    }, [location.pathname]);

    if (!show) return null;

    return (
        <>
            <style>{`
                .back-to-chat-fab {
                    position: fixed;
                    bottom: 24px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 9999999;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: #1b5e20;
                    color: #fff;
                    border: none;
                    border-radius: 24px;
                    padding: 12px 24px;
                    font-size: 14px;
                    font-weight: 600;
                    font-family: 'Inter', -apple-system, sans-serif;
                    cursor: pointer;
                    box-shadow: 0 4px 14px rgba(0,0,0,0.3);
                    -webkit-tap-highlight-color: transparent;
                    animation: backchat-slide-up 0.35s ease-out;
                }
                .back-to-chat-fab:active {
                    transform: translateX(-50%) scale(0.96);
                }
                .back-to-chat-fab svg {
                    width: 16px;
                    height: 16px;
                    fill: currentColor;
                }
                @keyframes backchat-slide-up {
                    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `}</style>
            <button
                className="back-to-chat-fab"
                onClick={() => navigate('/chatbot-app')}
                aria-label="Back to Chat"
            >
                <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
                Back to Chat
            </button>
        </>
    );
};

export default BackToChatFab;
