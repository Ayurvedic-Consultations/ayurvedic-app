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
        <button
            onClick={() => navigate('/chatbot-app')}
            aria-label="Back to Sanjeevani AI Chat"
            style={{
                position: 'fixed',
                bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 999999,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                color: '#fff',
                border: 'none',
                borderRadius: '28px',
                padding: '14px 24px',
                fontSize: '15px',
                fontWeight: '600',
                fontFamily: "'Inter', sans-serif",
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(27, 94, 32, 0.45)',
                animation: 'slideUpFab 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                WebkitTapHighlightColor: 'transparent',
            }}
        >
            <span style={{ fontSize: '18px' }}>💬</span>
            Back to Chat
            <style>{`
                @keyframes slideUpFab {
                    from { opacity: 0; transform: translateX(-50%) translateY(30px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `}</style>
        </button>
    );
};

export default BackToChatFab;
