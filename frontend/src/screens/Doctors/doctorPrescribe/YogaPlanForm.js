import React, { useState } from 'react';
// Removed the invalid `yoga` icon and added link helpers
import { HeartPulse, Sun, Moon, Plus, X, ListTodo, Send, ExternalLink, Link as LinkIcon } from 'lucide-react';
import './YogaPlanForm.css';

const COMMON_ASANAS = [
  "Surya Namaskara (Sun Salutation)", "Vrikshasana (Tree Pose)",
  "Trikonasana (Triangle Pose)", "Bhujangasana (Cobra Pose)",
  "Adho Mukha Svanasana (Downward Dog)", "Balasana (Child's Pose)",
  "Shavasana (Corpse Pose)", "Pranayama (Breathing Exercise)",
  "Paschimottanasana (Seated Forward Bend)", "Ustrasana (Camel Pose)"
];

const AsanaPlanCard = ({ title, Icon, planType, planData, commonAsanas, addAsana, removeAsana }) => {
  const [input, setInput] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const isYouTubeUrl = (url) => {
    if (!url) return true; // optional
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, '');
      return host === 'youtube.com' || host === 'youtu.be' || host === 'm.youtube.com';
    } catch {
      return false;
    }
  };

  const handleAdd = () => {
    const name = input.trim();
    const link = youtubeUrl.trim();

    if (!name) return;

    if (link && !isYouTubeUrl(link)) {
      alert('Please enter a valid YouTube URL (youtube.com or youtu.be), or leave it blank.');
      return;
    }

    addAsana(planType, { name, link });
    setInput("");
    setYoutubeUrl("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="asana-plan-card">
      <div className="asana-plan-header">
        <h4 className="asana-plan-title"><Icon className="plan-icon" size={20} />{title}</h4>
      </div>

      <div className="asana-plan-content">
        <div className="asana-input-group">
          <input
            type="text"
            className="asana-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter asana name..."
            onKeyPress={handleKeyPress}
          />
          <input
            type="url"
            className="asana-input asana-link-input"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="YouTube link (optional)"
            onKeyPress={handleKeyPress}
          />
          <button type="button" onClick={handleAdd} className="add-asana-btn">
            <Plus size={20} />
          </button>
        </div>

        <div className="common-asanas-container">
          <label className="common-asanas-label">Click to add from common asanas:</label>
          <div className="common-asanas-scroll">
            <div className="common-asana-tags">
              {commonAsanas.map((asana) => (
                <button
                  key={asana}
                  type="button"
                  className="common-asana-tag"
                  onClick={() => addAsana(planType, asana)}
                  disabled={planData.some(item => item.name === asana)}
                >
                  {asana}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="selected-asanas-container">
          <label className="selected-asanas-label">Selected Asanas ({planData.length}):</label>
          <div className="selected-asanas-scroll">
            {planData.length > 0 ? (
              <div className="selected-asanas-list">
                {planData.map(({ name, link }) => (
                  <div key={name} className="selected-asana-item">
                    {link ? (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="selected-asana-text asana-link"
                        title="Open video"
                      >
                        {name} <ExternalLink size={14} style={{ marginLeft: 6 }} />
                      </a>
                    ) : (
                      <span className="selected-asana-text">{name}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeAsana(planType, name)}
                      className="remove-asana-btn"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No asanas added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export function YogaPlanForm() {
  const [yogaPlan, setYogaPlan] = useState({
    morning: [
      { name: "Surya Namaskara (Sun Salutation)", link: "" },
      { name: "Pranayama (Breathing Exercise)", link: "" }
    ],
    evening: [
      { name: "Balasana (Child's Pose)", link: "" },
      { name: "Shavasana (Corpse Pose)", link: "" }
    ]
  });

  const addAsana = (planType, asana) => {
    const item = typeof asana === 'string'
      ? { name: asana.trim(), link: "" }
      : { name: (asana.name || '').trim(), link: (asana.link || '').trim() };

    if (!item.name) return;

    setYogaPlan(prev => {
      if (prev[planType].some(a => a.name.toLowerCase() === item.name.toLowerCase())) {
        return prev; // prevent duplicates by name
      }
      return {
        ...prev,
        [planType]: [...prev[planType], item]
      };
    });
  };

  const removeAsana = (planType, asanaName) => {
    setYogaPlan(prev => ({
      ...prev,
      [planType]: prev[planType].filter(a => a.name !== asanaName)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (yogaPlan.morning.length === 0 && yogaPlan.evening.length === 0) {
      alert("Please add at least one asana to a plan.");
      return;
    }
    console.log("Yoga plan submitted:", yogaPlan);
    alert("The yoga plan has been successfully prescribed.");
  };

  const planDetails = [
    { id: 'morning', title: 'Morning Plan', Icon: Sun },
    { id: 'evening', title: 'Evening Plan', Icon: Moon }
  ];

  return (
    <div className="form-card">
      <div className="form-header">
        <h3 className="form-title">
          <HeartPulse className="form-icon" size={24} />
          Prescribe Yoga & Wellness Plan
        </h3>
      </div>
      <div className="form-content">
        <form onSubmit={handleSubmit} className="yoga-form">
          <div className="yoga-plan-grid">
            {planDetails.map(plan => (
              <AsanaPlanCard
                key={plan.id}
                title={plan.title}
                Icon={plan.Icon}
                planType={plan.id}
                planData={yogaPlan[plan.id]}
                commonAsanas={COMMON_ASANAS}
                addAsana={addAsana}
                removeAsana={removeAsana}
              />
            ))}
          </div>

          <div className="plan-summary">
            <h4 className="summary-title"><ListTodo size={18} />Plan Summary</h4>
            <div className="summary-details">
              <div><strong>Morning:</strong> {yogaPlan.morning.length} asanas</div>
              <div><strong>Evening:</strong> {yogaPlan.evening.length} asanas</div>
            </div>
          </div>

          <button type="submit" className="submit-button">
            <Send size={18} />
            Prescribe Yoga Plan
          </button>
        </form>
      </div>
    </div>
  );
}