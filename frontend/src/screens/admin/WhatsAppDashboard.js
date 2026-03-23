import React, { useState, useEffect, useRef, useCallback } from 'react';
import './WhatsAppDashboard.css';

const API_BASE = process.env.REACT_APP_AYURVEDA_BACKEND_URL || 'http://localhost:8080';

const WhatsAppDashboard = () => {
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [sessionDetail, setSessionDetail] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('conversations');
    const [manualMessage, setManualMessage] = useState('');
    const [sending, setSending] = useState(false);
    const chatEndRef = useRef(null);

    // Fetch sessions
    const fetchSessions = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/api/whatsapp/sessions?search=${searchQuery}`);
            const data = await res.json();
            if (data.success) {
                setSessions(data.sessions);
            }
        } catch (err) {
            console.error('Error fetching sessions:', err);
        }
    }, [searchQuery]);

    // Fetch stats
    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/api/whatsapp/stats`);
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    }, []);

    // Fetch session detail
    const fetchSessionDetail = useCallback(async (phoneNumber) => {
        try {
            const res = await fetch(`${API_BASE}/api/whatsapp/sessions/${phoneNumber}`);
            const data = await res.json();
            if (data.success) {
                setSessionDetail(data.session);
            }
        } catch (err) {
            console.error('Error fetching session detail:', err);
        }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchSessions(), fetchStats()]);
            setLoading(false);
        };
        loadData();
    }, [fetchSessions, fetchStats]);

    // Auto-refresh every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchSessions();
            fetchStats();
            if (selectedSession) {
                fetchSessionDetail(selectedSession);
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [selectedSession, fetchSessions, fetchStats, fetchSessionDetail]);

    // Scroll to bottom of chat
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [sessionDetail]);

    const handleSelectSession = async (phoneNumber) => {
        setSelectedSession(phoneNumber);
        await fetchSessionDetail(phoneNumber);
    };

    const handleSendManual = async () => {
        if (!manualMessage.trim() || !selectedSession) return;
        setSending(true);
        try {
            await fetch(`${API_BASE}/api/whatsapp/send-manual`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: selectedSession, message: manualMessage })
            });
            setManualMessage('');
            await fetchSessionDetail(selectedSession);
        } catch (err) {
            console.error('Error sending manual message:', err);
        }
        setSending(false);
    };

    const handleDeleteSession = async (phoneNumber) => {
        if (!window.confirm(`Delete session for ${phoneNumber}?`)) return;
        try {
            await fetch(`${API_BASE}/api/whatsapp/sessions/${phoneNumber}`, { method: 'DELETE' });
            setSelectedSession(null);
            setSessionDetail(null);
            fetchSessions();
        } catch (err) {
            console.error('Error deleting session:', err);
        }
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHrs = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHrs / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHrs < 24) return `${diffHrs}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    const formatMessageTime = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const getFullName = (profile) => {
        if (!profile) return 'Unknown User';
        if (profile.fullName) return profile.fullName; // fallback for older data
        const first = profile.firstName || '';
        const last = profile.lastName || '';
        const full = `${first} ${last}`.trim();
        return full || 'Unknown User';
    };

    const getFlowLabel = (flow) => {
        const labels = {
            'idle': 'Idle',
            'registration': '📝 Registering',
            'health_consultation': '🩺 Consulting',
            'doctor_matching': '👨‍⚕️ Matching',
            'booking': '📅 Booking',
            'general_chat': '💬 Chatting'
        };
        return labels[flow] || flow;
    };

    if (loading) {
        return (
            <div className="wa-dashboard">
                <div className="wa-loading">
                    <div className="wa-spinner"></div>
                    <span>Loading dashboard...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="wa-dashboard" id="whatsapp-dashboard">
            {/* Header */}
            <div className="wa-header">
                <div className="wa-header-left">
                    <div className="wa-header-icon">💬</div>
                    <div>
                        <h1>WhatsApp <span>AI Dashboard</span></h1>
                        <p>Manage Ayurvedic AI conversations</p>
                    </div>
                </div>
                <div className="wa-header-actions">
                    <button className="wa-btn wa-btn-secondary" onClick={() => { fetchSessions(); fetchStats(); }}>
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="wa-stats-grid">
                <div className="wa-stat-card">
                    <div className="wa-stat-header">
                        <span className="wa-stat-label">Total Conversations</span>
                        <span className="wa-stat-icon green">💬</span>
                    </div>
                    <p className="wa-stat-value">{stats?.totalSessions || 0}</p>
                </div>
                <div className="wa-stat-card">
                    <div className="wa-stat-header">
                        <span className="wa-stat-label">Registered Users</span>
                        <span className="wa-stat-icon purple">👤</span>
                    </div>
                    <p className="wa-stat-value">{stats?.registeredUsers || 0}</p>
                </div>
                <div className="wa-stat-card">
                    <div className="wa-stat-header">
                        <span className="wa-stat-label">Active Today</span>
                        <span className="wa-stat-icon yellow">⚡</span>
                    </div>
                    <p className="wa-stat-value">{stats?.activeToday || 0}</p>
                </div>
                <div className="wa-stat-card">
                    <div className="wa-stat-header">
                        <span className="wa-stat-label">Total Messages</span>
                        <span className="wa-stat-icon pink">📨</span>
                    </div>
                    <p className="wa-stat-value">{stats?.totalMessages || 0}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="wa-tabs">
                <button
                    className={`wa-tab ${activeTab === 'conversations' ? 'active' : ''}`}
                    onClick={() => setActiveTab('conversations')}
                >
                    Conversations
                </button>
                <button
                    className={`wa-tab ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    Analytics
                </button>
            </div>

            {activeTab === 'conversations' && (
                <div className="wa-main-layout">
                    {/* Session List */}
                    <div className="wa-session-panel">
                        <div className="wa-search-box">
                            <div className="wa-search-wrapper">
                                <span className="wa-search-icon">🔍</span>
                                <input
                                    className="wa-search-input"
                                    type="text"
                                    placeholder="Search by name or phone..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    id="wa-search-input"
                                />
                            </div>
                        </div>
                        <div className="wa-session-list">
                            {sessions.length === 0 ? (
                                <div className="wa-empty-state">
                                    <div className="wa-empty-icon">📱</div>
                                    <h3>No Conversations Yet</h3>
                                    <p>WhatsApp conversations will appear here once users start messaging.</p>
                                </div>
                            ) : (
                                sessions.map((session) => (
                                    <div
                                        key={session.phoneNumber}
                                        className={`wa-session-item ${selectedSession === session.phoneNumber ? 'active' : ''}`}
                                        onClick={() => handleSelectSession(session.phoneNumber)}
                                        id={`session-${session.phoneNumber}`}
                                    >
                                        <div className={`wa-session-avatar ${session.isRegistered ? 'registered' : ''}`}>
                                            {getInitials(getFullName(session.profile))}
                                        </div>
                                        <div className="wa-session-info">
                                            <p className="wa-session-name">
                                                {getFullName(session.profile)}
                                            </p>
                                            <p className="wa-session-phone">{session.phoneNumber}</p>
                                        </div>
                                        <div className="wa-session-meta">
                                            <div className="wa-session-time">{formatTime(session.lastActive)}</div>
                                            <div className={`wa-session-badge ${session.currentFlow === 'idle' ? 'idle' : 'active-flow'}`}>
                                                {getFlowLabel(session.currentFlow)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Chat Panel */}
                    <div className="wa-chat-panel">
                        {sessionDetail ? (
                            <>
                                <div className="wa-chat-header">
                                    <div className="wa-chat-header-info">
                                        <div className={`wa-session-avatar ${sessionDetail.isRegistered ? 'registered' : ''}`}>
                                            {getInitials(getFullName(sessionDetail.profile))}
                                        </div>
                                        <div className="wa-chat-header-details">
                                            <h3>{getFullName(sessionDetail.profile)}</h3>
                                            <p>
                                                {sessionDetail.phoneNumber} • {getFlowLabel(sessionDetail.currentFlow)} • {sessionDetail.totalMessages} messages
                                            </p>
                                        </div>
                                    </div>
                                    <div className="wa-chat-header-actions">
                                        <button
                                            className="wa-icon-btn danger"
                                            onClick={() => handleDeleteSession(sessionDetail.phoneNumber)}
                                            title="Delete session"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                <div className="wa-chat-messages">
                                    {sessionDetail.conversationHistory?.length === 0 ? (
                                        <div className="wa-empty-state">
                                            <p>No messages in this conversation yet.</p>
                                        </div>
                                    ) : (
                                        sessionDetail.conversationHistory?.map((msg, idx) => (
                                            <div key={idx} className={`wa-message ${msg.role}`}>
                                                <div>{msg.content}</div>
                                                <div className="wa-message-time">{formatMessageTime(msg.timestamp)}</div>
                                            </div>
                                        ))
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                <div className="wa-chat-input">
                                    <input
                                        type="text"
                                        placeholder="Send a manual message..."
                                        value={manualMessage}
                                        onChange={(e) => setManualMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendManual()}
                                        id="wa-manual-message-input"
                                    />
                                    <button
                                        className="wa-send-btn"
                                        onClick={handleSendManual}
                                        disabled={sending || !manualMessage.trim()}
                                        id="wa-send-btn"
                                    >
                                        {sending ? 'Sending...' : 'Send ➤'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="wa-empty-state">
                                <div className="wa-empty-icon">💬</div>
                                <h3>Select a Conversation</h3>
                                <p>Choose a conversation from the left panel to view the full chat history and user details.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'analytics' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {/* Flow Distribution */}
                    <div className="wa-profile-panel">
                        <h3 style={{ color: '#fff', marginBottom: '16px', fontSize: '16px' }}>
                            📊 Active Flow Distribution
                        </h3>
                        <div className="wa-profile-details">
                            {stats?.flowDistribution?.map((flow, idx) => (
                                <div className="wa-profile-field" key={idx}>
                                    <span className="wa-profile-field-label">{getFlowLabel(flow._id)}</span>
                                    <span className="wa-profile-field-value">{flow.count} users</span>
                                </div>
                            ))}
                            {(!stats?.flowDistribution || stats.flowDistribution.length === 0) && (
                                <p style={{ color: '#5a6a80', textAlign: 'center' }}>No data available yet</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="wa-profile-panel">
                        <h3 style={{ color: '#fff', marginBottom: '16px', fontSize: '16px' }}>
                            📈 Recent Activity (7 days)
                        </h3>
                        <div className="wa-profile-details">
                            {stats?.recentActivity?.map((day, idx) => (
                                <div className="wa-profile-field" key={idx}>
                                    <span className="wa-profile-field-label">{day._id}</span>
                                    <span className="wa-profile-field-value">
                                        {day.count} users • {day.messages} msgs
                                    </span>
                                </div>
                            ))}
                            {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                                <p style={{ color: '#5a6a80', textAlign: 'center' }}>No activity recorded yet</p>
                            )}
                        </div>
                    </div>

                    {/* User Profile (when selected) */}
                    {sessionDetail && (
                        <div className="wa-profile-panel" style={{ gridColumn: '1 / -1' }}>
                            <div className="wa-profile-header">
                                <div className="wa-profile-avatar">
                                    {getInitials(getFullName(sessionDetail.profile))}
                                </div>
                                <h3>{getFullName(sessionDetail.profile)}</h3>
                                <p>{sessionDetail.phoneNumber}</p>
                            </div>
                            <div className="wa-profile-details">
                                <div className="wa-profile-field">
                                    <span className="wa-profile-field-label">Status</span>
                                    <span className={`wa-status-badge ${sessionDetail.isRegistered ? 'registered' : 'unregistered'}`}>
                                        {sessionDetail.isRegistered ? '✅ Registered' : '⏳ Not Registered'}
                                    </span>
                                </div>
                                <div className="wa-profile-field">
                                    <span className="wa-profile-field-label">Age</span>
                                    <span className="wa-profile-field-value">{sessionDetail.profile?.age || 'N/A'}</span>
                                </div>
                                <div className="wa-profile-field">
                                    <span className="wa-profile-field-label">Gender</span>
                                    <span className="wa-profile-field-value">{sessionDetail.profile?.gender || 'N/A'}</span>
                                </div>
                                <div className="wa-profile-field">
                                    <span className="wa-profile-field-label">Location (Zip Code)</span>
                                    <span className="wa-profile-field-value">{sessionDetail.profile?.zipCode || sessionDetail.profile?.location || 'N/A'}</span>
                                </div>
                                <div className="wa-profile-field">
                                    <span className="wa-profile-field-label">Email ID</span>
                                    <span className="wa-profile-field-value">{sessionDetail.profile?.email || 'N/A'}</span>
                                </div>
                                <div className="wa-profile-field">
                                    <span className="wa-profile-field-label">Current Flow</span>
                                    <span className="wa-profile-field-value">{getFlowLabel(sessionDetail.currentFlow)}</span>
                                </div>
                                <div className="wa-profile-field">
                                    <span className="wa-profile-field-label">Total Messages</span>
                                    <span className="wa-profile-field-value">{sessionDetail.totalMessages}</span>
                                </div>
                                <div className="wa-profile-field">
                                    <span className="wa-profile-field-label">Last Active</span>
                                    <span className="wa-profile-field-value">{formatTime(sessionDetail.lastActive)}</span>
                                </div>
                                {sessionDetail.healthData?.symptoms && (
                                    <>
                                        <div className="wa-profile-field" style={{ background: 'rgba(37, 211, 102, 0.05)' }}>
                                            <span className="wa-profile-field-label">🩺 Symptoms</span>
                                            <span className="wa-profile-field-value">{sessionDetail.healthData.symptoms}</span>
                                        </div>
                                        <div className="wa-profile-field" style={{ background: 'rgba(37, 211, 102, 0.05)' }}>
                                            <span className="wa-profile-field-label">📊 AI Analysis</span>
                                            <span className="wa-profile-field-value" style={{ maxWidth: '300px', fontSize: '12px' }}>
                                                {sessionDetail.healthData.aiAnalysis || 'Pending'}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WhatsAppDashboard;
