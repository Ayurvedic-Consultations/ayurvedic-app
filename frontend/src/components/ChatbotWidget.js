import React, { useState, useEffect, useContext } from 'react';
import './ChatbotWidget.css';
import { AuthContext } from '../context/AuthContext';

const ChatbotWidget = () => {
  const { auth } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    // Only render for doctors
    if (auth?.role !== 'doctor') return;
  }, [auth]);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: 'Doctor', text: input };
    setChat(prev => [...prev, userMsg]);

    const payload = {
      question: input,
      session_id: sessionId || undefined
    };

    try {
      const res = await fetch(`${process.env.AYURVEDA_NLP_URL}/askanythingayurveda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setSessionId(data.session_id);
      setChat(prev => [...prev, { sender: 'Bot', text: data.answer }]);
    } catch (err) {
      setChat(prev => [...prev, { sender: 'Bot', text: 'Error fetching response.' }]);
    }

    setInput('');
  };

  if (auth?.role !== 'doctor') return null;

  return (
    <div className="chatbot-container">
      <div className="chatbot-toggle" onClick={toggleChat}>💬</div>
      {isOpen && (
        <div className="chatbot-box">
          <div className="chat-messages">
            {chat.map((msg, idx) => (
              <div key={idx} className={msg.sender === 'Doctor' ? 'msg-user' : 'msg-bot'}>
                <strong>{msg.sender}:</strong> {msg.text}
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask something..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;

