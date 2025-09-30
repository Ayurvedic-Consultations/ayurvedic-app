import React, { useState } from 'react';
// 1. Corrected icon import: 'yoga' to 'Yoga'
import { HeartPulse, Sun, Moon, yoga, Plus, X, ListTodo, Send } from 'lucide-react';
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

  const handleAdd = () => {
    if (input.trim()) {
      addAsana(planType, input);
      setInput("");
    }
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
            placeholder="Enter custom asana..."
            onKeyPress={handleKeyPress}
          />
          <button type="button" onClick={handleAdd} className="add-asana-btn"><Plus size={20} /></button>
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
                  disabled={planData.includes(asana)}
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
                {planData.map((asana) => (
                  <div key={asana} className="selected-asana-item">
                    {/* Corrected component usage: <yoga> to <Yoga> */}
                    <span className="selected-asana-text"><yoga size={16} />{asana}</span>
                    <button type="button" onClick={() => removeAsana(planType, asana)} className="remove-asana-btn"><X size={14} /></button>
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
    morning: ["Surya Namaskara (Sun Salutation)", "Pranayama (Breathing Exercise)"],
    evening: ["Balasana (Child's Pose)", "Shavasana (Corpse Pose)"]
  });

  const addAsana = (planType, asana) => {
    const trimmedAsana = asana.trim();
    if (trimmedAsana && !yogaPlan[planType].includes(trimmedAsana)) {
      setYogaPlan(prev => ({
        ...prev,
        [planType]: [...prev[planType], trimmedAsana]
      }));
    }
  };

  const removeAsana = (planType, asanaToRemove) => {
    setYogaPlan(prev => ({
      ...prev,
      [planType]: prev[planType].filter(asana => asana !== asanaToRemove)
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