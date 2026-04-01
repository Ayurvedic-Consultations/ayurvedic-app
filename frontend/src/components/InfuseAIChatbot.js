import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    useContext,
} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AuthContext } from '../context/AuthContext';
import './InfuseAIChatbot.css';

/* ── InfuseAI SDK imports ─────────────────────────────────── */
import {
    InfuseProvider,
    useInfuse,
    useInfuseSession,
    useInfuseThreadInput,
} from 'infuseai-sdk';

/* ── Config ──────────────────────────────────────────────── */
// The SDK uses config.credentials.{ clientId, apiKey } for app-key auth
const INFUSE_CONFIG = {
    baseUrl: process.env.REACT_APP_INFUSEAI_URL || 'https://www.infuseai.in',
    appId: process.env.REACT_APP_INFUSEAI_APP_ID,
    credentials: {
        clientId: process.env.REACT_APP_INFUSEAI_CLIENT_ID,
        apiKey: process.env.REACT_APP_INFUSEAI_API_KEY,
    },
};

const SUGGESTIONS = [
    '🌿 What is Ayurveda?',
    '🩺 Book a consultation',
    '💊 Herbal remedies',
    '🧘 Daily wellness tips',
    '📋 My health report',
];

/* ── Helpers ─────────────────────────────────────────────── */
function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function generateUserId(auth) {
    if (auth?.user?._id) return `user_${auth.user._id}`;
    if (auth?.user?.email) return `email_${auth.user.email}`;
    return `guest_${Math.random().toString(36).slice(2, 10)}`;
}

/* ════════════════════════════════════════════════════════════
   ChatPanel — must be mounted INSIDE InfuseProvider
   Uses SDK hooks: useInfuse, useInfuseSession, useInfuseThreadInput
   ════════════════════════════════════════════════════════════ */
function ChatPanel({ onClose, auth, userId }) {
    const [localMessages, setLocalMessages] = useState([]);
    const [showSugs, setShowSugs] = useState(true);
    const [error, setError] = useState(null);
    const [initialized, setInitialized] = useState(false);

    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    /* SDK hooks */
    const { thread, isWaiting, isStreaming, messages: sdkMessages, startNewThread } = useInfuse();
    const { session, createSession } = useInfuseSession();
    const { value, setValue, submit, isPending } = useInfuseThreadInput();

    const isTyping = isWaiting || isStreaming || isPending;
    const isReady = initialized && !!thread;

    /* ── Init: create session + thread once on mount ── */
    useEffect(() => {
        let cancelled = false;
        async function init() {
            try {
                if (!session) {
                    await createSession(userId);
                }
                if (!thread) {
                    await startNewThread({ title: 'Ayurveda Chat' });
                }
                if (!cancelled) setInitialized(true);
            } catch (err) {
                console.error('[InfuseAI] init error:', err);
                if (!cancelled) setError('Could not connect to AI. Please try again later.');
            }
        }
        init();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ── Sync SDK messages → local display messages ── */
    useEffect(() => {
        if (!sdkMessages?.length) return;
        const mapped = sdkMessages
            .filter(m => m.role === 'user' || m.role === 'assistant')
            .filter(m => m.content)
            .map(m => ({
                id: m._id || m.messageId || Math.random(),
                role: m.role === 'assistant' ? 'bot' : 'user',
                text: m.content,
                time: m.createdAt ? new Date(m.createdAt) : new Date(),
            }));
        setLocalMessages(mapped);
    }, [sdkMessages]);

    /* Scroll to bottom */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [localMessages, isTyping]);

    /* Auto-resize textarea */
    const handleTextareaInput = (e) => {
        setValue(e.target.value);
        const ta = textareaRef.current;
        if (ta) {
            ta.style.height = 'auto';
            ta.style.height = Math.min(ta.scrollHeight, 100) + 'px';
        }
    };

    /* Send message */
    const handleSend = useCallback(async (overrideText) => {
        if (!isReady) return;
        const text = overrideText || value;
        if (!text?.trim()) return;

        setShowSugs(false);
        setError(null);

        // Add optimistic user bubble immediately
        setLocalMessages(prev => [...prev, {
            id: Date.now(),
            role: 'user',
            text: text.trim(),
            time: new Date(),
        }]);

        if (textareaRef.current) textareaRef.current.style.height = 'auto';

        try {
            await submit(text.trim());
        } catch (err) {
            console.error('[InfuseAI] submit error:', err);
            setError('Failed to send message. Please try again.');
            // Remove the optimistic bubble on error
            setLocalMessages(prev => prev.slice(0, -1));
        }
    }, [isReady, value, submit]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const statusText = () => {
        if (error) return 'Error — tap to retry';
        if (!initialized) return 'Connecting to AI…';
        if (!thread) return 'Starting session…';
        if (isTyping) return 'Thinking…';
        return 'Online — Ask me anything';
    };

    return (
        <>
            {/* ── Header ── */}
            <div className="infuse-header">
                <div className="infuse-header-avatar">🌿</div>
                <div className="infuse-header-info">
                    <div className="infuse-header-name">Ayur AI Assistant</div>
                    <div className="infuse-header-status">
                        {!error && <div className="infuse-status-dot" />}
                        <span>{statusText()}</span>
                    </div>
                </div>
                <button className="infuse-header-close" onClick={onClose} title="Close">✕</button>
            </div>

            {/* ── Messages ── */}
            <div className="infuse-messages">
                {/* Welcome banner */}
                <div className="infuse-welcome">
                    <span className="infuse-welcome-emoji">🌺</span>
                    <h3>Namaste{auth?.user?.firstName ? `, ${auth.user.firstName}` : ''}!</h3>
                    <p>
                        I'm your AI wellness companion, powered by ancient Ayurvedic
                        wisdom and modern AI. How can I help you today?
                    </p>
                </div>

                {/* Messages */}
                {localMessages.map(m => (
                    <div key={m.id} className={`infuse-msg-row ${m.role}`}>
                        <div className="infuse-msg-avatar">
                            {m.role === 'bot'
                                ? '🌿'
                                : (auth?.user?.firstName?.[0]?.toUpperCase() || '👤')}
                        </div>
                        <div>
                            <div className="infuse-bubble">
                                {m.role === 'bot' ? (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {m.text}
                                    </ReactMarkdown>
                                ) : (
                                    <p>{m.text}</p>
                                )}
                            </div>
                            <span className="infuse-timestamp">{formatTime(m.time)}</span>
                        </div>
                    </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                    <div className="infuse-typing">
                        <div className="infuse-typing-avatar">🌿</div>
                        <div className="infuse-typing-bubble">
                            <div className="infuse-dot" />
                            <div className="infuse-dot" />
                            <div className="infuse-dot" />
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && <div className="infuse-error-msg">⚠️ {error}</div>}

                <div ref={messagesEndRef} />
            </div>

            {/* ── Suggestion chips (shown until first message) ── */}
            {showSugs && (
                <div className="infuse-suggestions">
                    {SUGGESTIONS.map(s => (
                        <button
                            key={s}
                            className="infuse-suggestion-chip"
                            onClick={() => handleSend(s)}
                            disabled={!isReady}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}

            {/* ── Input bar ── */}
            <div className="infuse-input-bar">
                <textarea
                    ref={textareaRef}
                    className="infuse-textarea"
                    value={value}
                    onChange={handleTextareaInput}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        !isReady
                            ? 'Connecting…'
                            : 'Ask about Ayurveda, health, bookings…'
                    }
                    disabled={!isReady || isTyping}
                    rows={1}
                />
                <button
                    className="infuse-send-btn"
                    onClick={() => handleSend()}
                    disabled={!isReady || isTyping || !value.trim()}
                    title="Send"
                >
                    <svg viewBox="0 0 24 24">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                </button>
            </div>

            {/* ── Branding ── */}
            <div className="infuse-footer-brand">
                Powered by{' '}
                <a href="https://www.infuseai.in" target="_blank" rel="noreferrer">
                    InfuseAI
                </a>
            </div>
        </>
    );
}

/* ════════════════════════════════════════════════════════════
   Root component — FAB toggle + InfuseProvider wrapper
   ════════════════════════════════════════════════════════════ */
export default function InfuseAIChatbot() {
    const { auth } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [closing, setClosing] = useState(false);

    const userId = generateUserId(auth);

    const handleOpen = () => { setClosing(false); setIsOpen(true); };
    const handleClose = () => {
        setClosing(true);
        setTimeout(() => { setIsOpen(false); setClosing(false); }, 240);
    };
    const toggleChat = () => (isOpen ? handleClose() : handleOpen());

    /* SVG icons */
    const ChatBubbleIcon = () => (
        <svg
            className="infuse-fab-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );

    const CloseIcon = () => (
        <svg
            className="infuse-fab-icon open"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
        >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );

    return (
        <>
            {/* Floating action button */}
            <button
                id="infuse-chatbot-fab"
                className="infuse-fab"
                onClick={toggleChat}
                title="Chat with Ayur AI Assistant"
                aria-label="Open AI chat assistant"
            >
                {!isOpen && <div className="infuse-fab-pulse" />}
                {isOpen ? <CloseIcon /> : <ChatBubbleIcon />}
            </button>

            {/* Chat window — only mounted when open */}
            {isOpen && (
                <div
                    id="infuse-chatbot-window"
                    className={`infuse-window${closing ? ' closing' : ''}`}
                    role="dialog"
                    aria-label="AI Ayurveda Assistant"
                >
                    <InfuseProvider config={INFUSE_CONFIG}>
                        <ChatPanel
                            onClose={handleClose}
                            auth={auth}
                            userId={userId}
                        />
                    </InfuseProvider>
                </div>
            )}
        </>
    );
}
