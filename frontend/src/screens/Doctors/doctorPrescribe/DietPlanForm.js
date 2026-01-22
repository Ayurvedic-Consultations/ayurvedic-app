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
  <div className="dp-diet-section">
    <label htmlFor={id} className="dp-diet-label">
      <Icon className="dp-diet-icon" size={20} />
      {title}
    </label>
    <textarea
      id={id}
      name={id}
      className="dp-diet-textarea"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows="3"
    ></textarea>
  </div>
);

// --- Main Form Component ---
export function DietPlanForm() {
  const [activeTab, setActiveTab] = useState('daily');
  const [herbInput, setHerbInput] = useState("");
  const [dietPlan, setDietPlan] = useState({
    daily: { ...DEFAULT_DAILY_DIET },
    weekly: DAYS_OF_WEEK.reduce((acc, day) => {
      acc[day] = { ...DEFAULT_DAILY_DIET };
      return acc;
    }, {}),
    herbs: ["Turmeric", "Ginger"]
  });

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
    <div className="dp-form-card">
      <div className="dp-form-header">
        <h3 className="dp-form-title">
          <Salad className="dp-form-icon" size={24} />
          Prescribe Diet Plan
        </h3>
      </div>

      <div className="dp-form-content">
        <form onSubmit={handleSubmit} className="dp-diet-form">

          {/* Tab Navigation */}
          <div className="dp-tabs-list">
            <button type="button" className={`dp-tab-trigger ${activeTab === 'daily' ? 'dp-active' : ''}`} onClick={() => setActiveTab('daily')}>Daily Plan</button>
            <button type="button" className={`dp-tab-trigger ${activeTab === 'weekly' ? 'dp-active' : ''}`} onClick={() => setActiveTab('weekly')}>Weekly Plan</button>
            <button type="button" className={`dp-tab-trigger ${activeTab === 'herbs' ? 'dp-active' : ''}`} onClick={() => setActiveTab('herbs')}>Herbs & Supplements</button>
          </div>

          {/* Tab Content */}
          <div className="dp-tab-content">

            {activeTab === 'daily' && (
              <div className="dp-diet-plan-grid">
                {dietSectionsData.map(({ id, title, Icon, placeholder }) => (
                  <DietSection
                    key={id}
                    id={id}
                    title={title}
                    Icon={Icon}
                    value={dietPlan.daily[id]}
                    onChange={(value) => updateDailyDiet(id, value)}
                    placeholder={placeholder}
                  />
                ))}
              </div>
            )}

            {activeTab === 'weekly' && (
              <div className="dp-weekly-plan-container">
                {DAYS_OF_WEEK.map(day => (
                  <div key={day} className="dp-weekly-day-card">
                    <h4 className="dp-weekly-day-title">
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </h4>
                    <div className="dp-weekly-day-grid">
                      {Object.keys(dietPlan.weekly[day]).map(meal => (
                        <div key={meal} className="dp-weekly-meal-section">
                          <label className="dp-weekly-meal-label">
                            {meal.charAt(0).toUpperCase() + meal.slice(1)}
                          </label>
                          <textarea
                            className="dp-diet-textarea"
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

            {activeTab === 'herbs' && (
              <div className="dp-herbs-section">
                <h4 className="dp-herbs-title">
                  <Sprout size={18} /> Herbs & Supplements
                </h4>

                <div className="dp-herb-input-group">
                  <input
                    type="text"
                    className="dp-herb-input"
                    value={herbInput}
                    onChange={(e) => setHerbInput(e.target.value)}
                    placeholder="Enter herb name and press Enter"
                    onKeyPress={handleHerbInputKeyPress}
                  />
                  <button type="button" onClick={addHerb} className="dp-add-herb-btn">
                    <Plus size={20} />
                  </button>
                </div>

                <div className="dp-herb-tags">
                  {dietPlan.herbs.map((herb, index) => (
                    <div key={index} className="dp-herb-tag">
                      <Leaf size={14} /> {herb}
                      <button
                        type="button"
                        onClick={() => removeHerb(herb)}
                        className="dp-remove-herb-btn"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          <button type="submit" className="dp-submit-button">
            <Send size={18} />
            Prescribe Diet Plan
          </button>
        </form>
      </div>
    </div>
  );
}
