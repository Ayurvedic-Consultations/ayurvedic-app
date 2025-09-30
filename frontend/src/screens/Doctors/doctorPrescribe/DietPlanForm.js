import React, { useState } from 'react';
// Import Lucide icons
import { Salad, Coffee, Sun, Moon, GlassWater, Sprout, Leaf, Plus, X, Send } from 'lucide-react';
import './DietPlanForm.css';

// --- Constants ---
const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const DEFAULT_DAILY_DIET = {
  breakfast: "Whole grain toast with avocado",
  lunch: "Grilled chicken salad",
  dinner: "Baked salmon with quinoa",
  juices: "Fresh orange juice"
};

const dietSectionsData = [
  { id: 'breakfast', title: 'Breakfast', Icon: Coffee, placeholder: 'e.g., Oatmeal with fruits...' },
  { id: 'lunch', title: 'Lunch', Icon: Sun, placeholder: 'e.g., Quinoa salad...' },
  { id: 'dinner', title: 'Dinner', Icon: Moon, placeholder: 'e.g., Baked tofu...' },
  { id: 'juices', title: 'Juices & Beverages', Icon: GlassWater, placeholder: 'e.g., Green smoothie...' }
];

// --- Reusable Sub-component ---
const DietSection = ({ id, title, Icon, value, onChange, placeholder }) => (
  <div className="diet-section">
    <label htmlFor={id} className="diet-label">
      <Icon className="diet-icon" size={20} />
      {title}
    </label>
    <textarea
      id={id}
      name={id}
      className="diet-textarea"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows="3"
    ></textarea>
  </div>
);

// --- Main Form Component ---
export function DietPlanForm() {
  const [activeTab, setActiveTab] = useState('daily'); // State to manage active tab
  const [herbInput, setHerbInput] = useState("");
  const [dietPlan, setDietPlan] = useState({
    daily: { ...DEFAULT_DAILY_DIET },
    // Initialize weekly plan for all 7 days
    weekly: DAYS_OF_WEEK.reduce((acc, day) => {
      acc[day] = { ...DEFAULT_DAILY_DIET };
      return acc;
    }, {}),
    herbs: ["Turmeric", "Ginger"]
  });

  // --- Event Handlers ---
  const updateDailyDiet = (field, value) => {
    setDietPlan(prev => ({ ...prev, daily: { ...prev.daily, [field]: value } }));
  };
  
  const updateWeeklyDiet = (day, field, value) => {
    setDietPlan(prev => ({
        ...prev,
        weekly: { ...prev.weekly, [day]: { ...prev.weekly[day], [field]: value } }
    }));
  };

  const addHerb = () => {
    const trimmedHerb = herbInput.trim();
    if (trimmedHerb && !dietPlan.herbs.includes(trimmedHerb)) {
      setDietPlan(prev => ({ ...prev, herbs: [...prev.herbs, trimmedHerb] }));
      setHerbInput("");
    }
  };

  const removeHerb = (herbToRemove) => {
    setDietPlan(prev => ({ ...prev, herbs: prev.herbs.filter(herb => herb !== herbToRemove) }));
  };
  
  const handleHerbInputKeyPress = (e) => {
      if (e.key === 'Enter') {
          e.preventDefault();
          addHerb();
      }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Diet plan submitted:", dietPlan);
    alert("The diet plan has been successfully prescribed.");
  };

  return (
    <div className="form-card">
      <div className="form-header">
        <h3 className="form-title">
          <Salad className="form-icon" size={24} />
          Prescribe Diet Plan
        </h3>
      </div>
      <div className="form-content">
        <form onSubmit={handleSubmit} className="diet-form">
          {/* Tab Navigation */}
          <div className="tabs-list">
            <button type="button" className={`tab-trigger ${activeTab === 'daily' ? 'active' : ''}`} onClick={() => setActiveTab('daily')}>Daily Plan</button>
            <button type="button" className={`tab-trigger ${activeTab === 'weekly' ? 'active' : ''}`} onClick={() => setActiveTab('weekly')}>Weekly Plan</button>
            <button type="button" className={`tab-trigger ${activeTab === 'herbs' ? 'active' : ''}`} onClick={() => setActiveTab('herbs')}>Herbs & Supplements</button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Daily Plan View */}
            {activeTab === 'daily' && (
              <div className="diet-plan-grid">
                {dietSectionsData.map(({ id, title, Icon, placeholder }) => (
                  <DietSection
                    key={id} id={id} title={title} Icon={Icon}
                    value={dietPlan.daily[id]}
                    onChange={(value) => updateDailyDiet(id, value)}
                    placeholder={placeholder}
                  />
                ))}
              </div>
            )}

            {/* Weekly Plan View */}
            {activeTab === 'weekly' && (
              <div className="weekly-plan-container">
                {DAYS_OF_WEEK.map(day => (
                  <div key={day} className="weekly-day-card">
                    <h4 className="weekly-day-title">{day.charAt(0).toUpperCase() + day.slice(1)}</h4>
                    <div className="weekly-day-grid">
                      {Object.keys(dietPlan.weekly[day]).map(meal => (
                        <div key={meal} className="weekly-meal-section">
                          <label className="weekly-meal-label">{meal.charAt(0).toUpperCase() + meal.slice(1)}</label>
                          <textarea
                            className="diet-textarea"
                            value={dietPlan.weekly[day][meal]}
                            onChange={(e) => updateWeeklyDiet(day, meal, e.target.value)}
                            rows="2"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Herbs & Supplements View */}
            {activeTab === 'herbs' && (
              <div className="herbs-section">
                <h4 className="herbs-title"><Sprout size={18} />Herbs & Supplements</h4>
                <div className="herb-input-group">
                  <input type="text" className="herb-input" value={herbInput} onChange={(e) => setHerbInput(e.target.value)} placeholder="Enter herb name and press Enter" onKeyPress={handleHerbInputKeyPress} />
                  <button type="button" onClick={addHerb} className="add-herb-btn"><Plus size={20} /></button>
                </div>
                <div className="herb-tags">
                  {dietPlan.herbs.map((herb, index) => (
                    <div key={index} className="herb-tag">
                      <Leaf size={14} />{herb}
                      <button type="button" onClick={() => removeHerb(herb)} className="remove-herb-btn"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button type="submit" className="submit-button">
            <Send size={18} />
            Prescribe Diet Plan
          </button>
        </form>
      </div>
    </div>
  );
}