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
    useInfuseSession,
    useInfuseThread,
    useInfuseThreadInput,
} from 'infuseai-sdk';

/* ── Config ──────────────────────────────────────────────── */
const INFUSE_CONFIG = {
    baseUrl: process.env.REACT_APP_INFUSEAI_URL || 'https://www.infuseai.in',
    clientId: process.env.REACT_APP_INFUSEAI_CLIENT_ID,
    appId: process.env.REACT_APP_INFUSEAI_APP_ID,
    apiKey: process.env.REACT_APP_INFUSEAI_API_KEY,
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
   Inner chat panel — uses InfuseAI hooks after Provider mounts
   ════════════════════════════════════════════════════════════ */
function ChatPanel({ onClose, auth }) {
    const [inputVal, setInputVal] = useState('');
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState(null);
    const [showSugs, setShowSugs] = useState(true);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    /* SDK hooks */
    const { session, loading: sessionLoading } = useInfuseSession();
    const { thread, loading: threadLoading } = useInfuseThread();
    const { sendMessage } = useInfuseThreadInput();

    const isReady = !sessionLoading && !threadLoading && !!session && !!thread;

    /* Scroll to bottom on new messages */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    /* Auto-resize textarea */
    const handleInput = (e) => {
        setInputVal(e.target.value);
        const ta = textareaRef.current;
        if (ta) {
            ta.style.height = 'auto';
            ta.style.height = Math.min(ta.scrollHeight, 100) + 'px';
        }
    };

    /* Send a message */
    const handleSend = useCallback(async (text) => {
        const msg = (text || inputVal).trim();
        if (!msg || !isReady) return;

        setShowSugs(false);
        setInputVal('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        setError(null);

        /* Optimistic user bubble */
        setMessages(prev => [...prev, {
            id: Date.now(),
            role: 'user',
            text: msg,
            time: new Date(),
        }]);

        setIsTyping(true);

        try {
            const response = await sendMessage(msg);

            /* Extract text from InfuseAI OpenAI-compatible response */
            let botText = '';
            if (response?.choices?.[0]?.message?.content) {
                botText = response.choices[0].message.content;
            } else if (typeof response === 'string') {
                botText = response;
            } else {
                botText = "I'm here to help with your Ayurvedic wellness journey! 🌿";
            }

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'bot',
                text: botText,
                time: new Date(),
            }]);
        } catch (err) {
            console.error('[InfuseAI] sendMessage error:', err);
            setError('Connection issue. Please try again.');
        } finally {
            setIsTyping(false);
        }
    }, [inputVal, isReady, sendMessage]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* ── Header ── */}
            <div className="infuse-header">
                <div className="infuse-header-avatar">🌿</div>
                <div className="infuse-header-info">
                    <div className="infuse-header-name">Ayur AI Assistant</div>
                    <div className="infuse-header-status">
                        <div className="infuse-status-dot" />
                        <span>
                            {sessionLoading || threadLoading
                                ? 'Connecting…'
                                : isReady
                                    ? 'Online — Ask me anything'
                                    : 'Starting up…'}
                        </span>
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
                        I'm your AI wellness companion, powered by ancient Ayurvedic wisdom
                        and modern intelligence. How can I help you today?
                    </p>
                </div>

                {/* Chat messages */}
                {messages.map(m => (
                    <div key={m.id} className={`infuse-msg-row ${m.role}`}>
                        <div className="infuse-msg-avatar">
                            {m.role === 'bot' ? '🌿' : (auth?.user?.firstName?.[0]?.toUpperCase() || '👤')}
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

            {/* ── Suggestion chips ── */}
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
                    value={inputVal}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder={isReady ? 'Ask about Ayurveda, health, bookings…' : 'Connecting…'}
                    disabled={!isReady}
                    rows={1}
                />
                <button
                    className="infuse-send-btn"
                    onClick={() => handleSend()}
                    disabled={!isReady || !inputVal.trim()}
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
                Powered by <a href="https://www.infuseai.in" target="_blank" rel="noreferrer">InfuseAI</a>
            </div>
        </>
    );
}

/* ════════════════════════════════════════════════════════════
   Top-level wrapper — mounts InfuseProvider + FAB toggle
   ════════════════════════════════════════════════════════════ */
export default function InfuseAIChatbot() {
    const { auth } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [closing, setClosing] = useState(false);
    const [Provider, setProvider] = useState(null);
    const [providerError, setProviderError] = useState(false);

    /* Lazy-load InfuseProvider so we can handle import errors gracefully */
    useEffect(() => {
        import('infuseai-sdk')
            .then(mod => {
                setProvider(() => mod.InfuseProvider);
            })
            .catch(err => {
                console.error('[InfuseAI] SDK load error:', err);
                setProviderError(true);
            });
    }, []);

    const userId = generateUserId(auth);

    const handleOpen = () => { setClosing(false); setIsOpen(true); };
    const handleClose = () => {
        setClosing(true);
        setTimeout(() => { setIsOpen(false); setClosing(false); }, 240);
    };
    const toggleChat = () => (isOpen ? handleClose() : handleOpen());

    /* Fallback: if SDK fails, show a simple error bubble */
    if (providerError) {
        return (
            <div className="infuse-fab" style={{ cursor: 'default', opacity: 0.6 }} title="AI Chatbot unavailable">
                <img
                    className="infuse-fab-icon"
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpath d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'/%3E%3C/svg%3E"
                    alt="chat"
                />
            </div>
        );
    }

    /* Chat SVG icon */
    const ChatIcon = ({ open }) => (
        <svg
            className={`infuse-fab-icon${open ? ' open' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {open ? (
                /* X icon when open */
                <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </>
            ) : (
                /* Chat bubble icon when closed */
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            )}
        </svg>
    );

    return (
        <>
            {/* Floating action button */}
            <button className="infuse-fab" onClick={toggleChat} title="AI Ayurveda Assistant">
                {!isOpen && <div className="infuse-fab-pulse" />}
                <ChatIcon open={isOpen} />
            </button>

            {/* Chat window */}
            {isOpen && Provider && (
                <div className={`infuse-window${closing ? ' closing' : ''}`}>
                    <Provider
                        config={{
                            baseUrl: INFUSE_CONFIG.baseUrl,
                            clientId: INFUSE_CONFIG.clientId,
                            appId: INFUSE_CONFIG.appId,
                            apiKey: INFUSE_CONFIG.apiKey,
                        }}
                        userId={userId}
                    >
                        <ChatPanel onClose={handleClose} auth={auth} />
                    </Provider>
                </div>
            )}
        </>
    );
}
