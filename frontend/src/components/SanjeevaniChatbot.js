import React, { useState, useEffect, useRef, useContext } from 'react';
import './SanjeevaniChatbot.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const SanjeevaniChatbot = ({ isFullScreen = false }) => {
    const [isOpen, setIsOpen] = useState(isFullScreen);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState('');
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const { auth } = useContext(AuthContext);

    // Dynamically associate chat session to the permanent logged in ID
    useEffect(() => {
        let id;
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        // Cleanup any old hardcoded guest caches
        localStorage.removeItem('sanjeevani_chat_id');

        // If officially logged into the platform, sync the Chatbot memory to their DB Profile
        if (token && auth && auth.user && auth.user._id) {
            id = auth.user._id;
        } else {
            // Fresh ID every time the component loads (refresh causes complete wipe for guests!)
            id = 'guest_' + Math.random().toString(36).substr(2, 9);
        }

        setUserId(id);

        // Initial check with backend to get dynamic greeting and fetch HISTORY
        const initChat = async () => {
            try {
                const response = await axios.post(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/chat/message`, {
                    userId: id,
                    message: 'INIT_CHAT_EVENT',
                    isRegistered: !!token,
                    userRole: role,
                    fetchHistory: true
                });

                const { response: aiText, metadata, history } = response.data;
                const pastMessages = (history || []).map(h => ({
                    role: h.role,
                    content: h.content,
                    metadata: h.metadata
                }));

                if (aiText) {
                    setMessages([...pastMessages, { role: 'assistant', content: aiText, metadata }]);
                }
            } catch (e) {
                setMessages([{ role: 'assistant', content: "Namaste 🙏 I am Sanjeevani AI. How can I assist you today?" }]);
            }
        };

        if (id && (isOpen || isFullScreen)) {
            initChat();
        }
    }, [auth, isOpen, isFullScreen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (textOverride) => {
        const textToSend = textOverride || inputText;
        if (!textToSend.trim() || !userId) return;

        // Add user message
        const userMsg = { role: 'user', content: textToSend };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        try {
            const response = await axios.post(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/chat/message`, {
                userId,
                message: textToSend,
                isRegistered: !!localStorage.getItem('token')
            });

            const { response: aiText, metadata } = response.data;

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: aiText,
                metadata
            }]);

        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I'm experiencing a disturbance in my network. Please try again in a moment. 🪷"
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Render rich custom UI based on metadata
    const renderMessageContent = (msg, idx) => {
        if (msg.role === 'user') {
            return <div className="sanjeevani-msg sanjeevani-user">{msg.content}</div>;
        }

        return (
            <div className="sanjeevani-msg sanjeevani-bot">
                <div className="sanjeevani-avatar">🌿</div>
                <div className="sanjeevani-content">
                    <div className="sanjeevani-text" style={{ whiteSpace: 'pre-wrap' }}>
                        {msg.content}
                    </div>

                    {msg.metadata && msg.metadata.type === 'options' && (
                        <div className="sanjeevani-options">
                            {msg.metadata.options.map((opt, i) => (
                                <button key={i} onClick={() => {
                                    const label = typeof opt === 'string' ? opt : opt.label;
                                    if (opt.action) {
                                        setIsOpen(false);
                                        navigate(opt.action);
                                    } else {
                                        handleSend(label);
                                    }
                                }} className="sanjeevani-opt-btn">
                                    {typeof opt === 'string' ? opt : opt.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {msg.metadata && msg.metadata.type === 'action_fetch_doctors' && (
                        <div className="sanjeevani-action-card">
                            <p>Looking for a {msg.metadata.category} specialist?</p>
                            <button
                                className="sanjeevani-primary-btn"
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate('/book-consultation');
                                }}>
                                Browse Doctors Now
                            </button>
                        </div>
                    )}

                    {msg.metadata && msg.metadata.type === 'doctors_list' && (
                        <div className="sanjeevani-doctors-list">
                            {msg.metadata.reason && (
                                <p className="sanjeevani-doc-reason">💡 {msg.metadata.reason}</p>
                            )}
                            {msg.metadata.doctors?.map((doc, i) => (
                                <div key={i} className="sanjeevani-doc-card">
                                    <div className="sanjeevani-doc-header">
                                        <strong>{doc.name}</strong>
                                        <div className="sanjeevani-doc-badges">
                                            {doc.experience > 0 && (
                                                <span className="sanjeevani-doc-exp">{doc.experience} Yrs</span>
                                            )}
                                            {doc.rating && (
                                                <span className="sanjeevani-doc-rating">⭐ {Number(doc.rating).toFixed(1)}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="sanjeevani-doc-spec">🌿 {doc.specialization}</div>
                                    {doc.location && (
                                        <div className="sanjeevani-doc-location">📍 {typeof doc.location === 'object' ? (doc.location.specific || doc.location.pincode || '') : doc.location}</div>
                                    )}
                                    {doc.languages && (
                                        <div className="sanjeevani-doc-langs">🗣️ {doc.languages}</div>
                                    )}
                                    {doc.about && (
                                        <div className="sanjeevani-doc-about">
                                            {doc.about.slice(0, 90)}{doc.about.length > 90 ? '…' : ''}
                                        </div>
                                    )}
                                    <div className="sanjeevani-doc-footer">
                                        <span className="sanjeevani-doc-price">₹{doc.price} / consult</span>
                                        <button
                                            className="sanjeevani-book-btn"
                                            onClick={() => {
                                                setIsOpen(false);
                                                navigate('/profile/doctor/' + doc.id);
                                            }}>
                                            View &amp; Book →
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {msg.metadata && msg.metadata.type === 'videos' && (
                        <div className="sanjeevani-videos">
                            {msg.metadata.videos.map((vid, i) => (
                                <a key={i} href={vid.link} target="_blank" rel="noreferrer" className="sanjeevani-video-link">
                                    ▶️ {vid.title}
                                    <span className="sanjeevani-vid-desc">{vid.description}</span>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={`sanjeevani-container ${isFullScreen ? 'sanjeevani-full-screen-app' : ''}`}>
            {(isOpen || isFullScreen) ? (
                <div className={`sanjeevani-window ${isFullScreen ? 'sanjeevani-window-full' : ''}`}>
                    <div className="sanjeevani-header">
                        <div className="sanjeevani-header-info">
                            <h3>Sanjeevani AI ✨</h3>
                            <span className="sanjeevani-status">Online and Ready</span>
                        </div>
                        {!isFullScreen && (
                            <button className="sanjeevani-close-btn" onClick={() => setIsOpen(false)}>×</button>
                        )}
                    </div>

                    <div className="sanjeevani-messages">
                        {messages.map((msg, i) => (
                            <React.Fragment key={i}>
                                {renderMessageContent(msg, i)}
                            </React.Fragment>
                        ))}
                        {isLoading && (
                            <div className="sanjeevani-msg sanjeevani-bot">
                                <div className="sanjeevani-avatar">🌿</div>
                                <div className="sanjeevani-loading">
                                    <div className="dot"></div><div className="dot"></div><div className="dot"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="sanjeevani-input-area">
                        <input
                            type="text"
                            placeholder="Ask Sanjeevani AI..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={() => handleSend()} disabled={!inputText.trim() || isLoading}>
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            ) : null}

            {(!isOpen && !isFullScreen) && (
                <button className="sanjeevani-fab" onClick={() => setIsOpen(true)}>
                    <span className="sanjeevani-fab-icon">🌿</span>
                    <div className="sanjeevani-fab-tooltip">Chat with Sanjeevani AI</div>
                </button>
            )}
        </div>
    );
};

export default SanjeevaniChatbot;
