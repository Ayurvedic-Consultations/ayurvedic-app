import React, { useState, useEffect, useContext } from 'react';
import { 
  Leaf, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  ClipboardEdit, 
  Save, 
  User, 
  Clock,
  ArrowRightCircle
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import './DietYogaComponent.css';

const DietYogaComponent = ({ patientId }) => {
  const { auth } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('general'); // 'general' or 'custom'
  const [isEditing, setIsEditing] = useState(false);
  const [prakriti, setPrakriti] = useState(null);
  const [loading, setLoading] = useState(true);

  // State for Custom Prescription (Card 2)
  const [customPlan, setCustomPlan] = useState({
    dietaryNotes: '',
    yogaRoutine: '',
    herbalSupport: '',
    safetyRestrictions: '',
    lastUpdated: null
  });

  const isDoctor = auth.user?.role === 'doctor' || auth.user?.role === 'Doctor';

  useEffect(() => {
    fetchPrakritiData();
    fetchCustomPlan();
  }, [patientId]);

  const fetchPrakritiData = async () => {
    try {
      // In a real scenario, the backend calculates the dominant Dosha from the traits
      const response = await fetch(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/prakriti/${patientId}`);
      const data = await response.json();
      // Assuming backend returns dominant type; if not, logic to calculate it would go here
      setPrakriti(data.dominantType || 'Vata'); 
      setLoading(false);
    } catch (err) {
      console.error("Error fetching Prakriti:", err);
      setLoading(false);
    }
  };

  const fetchCustomPlan = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/diet-plan/${patientId}`);
      if (response.ok) {
        const data = await response.json();
        setCustomPlan(data);
      }
    } catch (err) {
      console.error("Error fetching custom plan:", err);
    }
  };

  const handleSync = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/diet-plan/${patientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...customPlan, lastUpdated: new Date() })
      });
      if (response.ok) {
        setIsEditing(false);
        alert("Clinical Prescription Synchronized.");
      }
    } catch (err) {
      alert("Failed to sync plan.");
    }
  };

  // Automated Constitutional Logic
  const getGeneralPlanByPrakriti = (type) => {
    const plans = {
      Vata: {
        favor: ["Cooked Grains", "Root Vegetables", "Warm Milk", "Ghee", "Sweet Fruits"],
        avoid: ["Raw Salads", "Iced Drinks", "Dried Fruits", "Beans", "Caffeine"],
        description: "Focus on grounding, warming, and nourishing foods to balance airy qualities.",
        yoga: "Slow Hatha, Sun Salutations (Slow), Grounding Poses."
      },
      Pitta: {
        favor: ["Cucumber", "Leafy Greens", "Coconut Oil", "Melons", "Basmati Rice"],
        avoid: ["Hot Chili", "Garlic", "Fermented Foods", "Red Meat", "Alcohol"],
        description: "Focus on cooling, refreshing, and moderately heavy foods to balance heat.",
        yoga: "Moon Salutations, Cooling Pranayama, Relaxed Effort."
      },
      Kapha: {
        favor: ["Ginger Tea", "Spiced Lentils", "Light Fruits (Apples)", "Leafy Greens", "Bitter Veggies"],
        avoid: ["Dairy", "Iced Sweets", "Heavy Fried Foods", "Excess Salt", "Wheat"],
        description: "Focus on light, dry, and stimulating foods to balance heavy qualities.",
        yoga: "Vigorous Flow, Power Yoga, Chest Opening Poses."
      }
    };
    return plans[type] || plans.Vata;
  };

  const activePlan = getGeneralPlanByPrakriti(prakriti);

  return (
    <div className="clinical-dashboard-wrapper">
      {/* 1. INTERACTIVE SELECTION CARDS */}
      <div className="selection-card-row">
        <div 
          className={`nav-card ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <div className="card-icon-hex"><Activity size={24} /></div>
          <div className="card-text">
            <h3>General Protocol</h3>
            <p>Automated Prakriti Guidelines</p>
          </div>
          {activeTab === 'general' && <div className="active-indicator" />}
        </div>

        <div 
          className={`nav-card ${activeTab === 'custom' ? 'active' : ''}`}
          onClick={() => setActiveTab('custom')}
        >
          <div className="card-icon-hex"><ClipboardEdit size={24} /></div>
          <div className="card-text">
            <h3>Clinical Prescription</h3>
            <p>Personalized Doctor’s Plan</p>
          </div>
          {activeTab === 'custom' && <div className="active-indicator" />}
        </div>
      </div>

      {/* 2. TAB CONTENT: GENERAL PROTOCOL */}
      {activeTab === 'general' && (
        <div className="dashboard-view-animate">
          <div className="status-banner">
            <span className="badge-pill">Patient Type: <strong>{prakriti}</strong></span>
            <span className="timestamp"><Clock size={14} /> System Generated</span>
          </div>

          <div className="clinical-grid">
            <div className="grid-card favor">
              <div className="grid-header">
                <CheckCircle2 className="text-teal" />
                <h4>Dietary Recommendations (Favor)</h4>
              </div>
              <div className="pill-container">
                {activePlan.favor.map(item => <span key={item} className="pill-item">{item}</span>)}
              </div>
            </div>

            <div className="grid-card avoid">
              <div className="grid-header">
                <ShieldAlert className="text-red" />
                <h4>Restricted Items (Avoid)</h4>
              </div>
              <div className="pill-container">
                {activePlan.avoid.map(item => <span key={item} className="pill-item-red">{item}</span>)}
              </div>
            </div>

            <div className="grid-card full-width">
              <div className="grid-header">
                <Leaf className="text-teal" />
                <h4>Lifestyle & Yoga Protocol</h4>
              </div>
              <p className="description-text">{activePlan.description}</p>
              <div className="yoga-highlight">
                <strong>Recommended Flow:</strong> {activePlan.yoga}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB CONTENT: CLINICAL EDITOR */}
      {activeTab === 'custom' && (
        <div className="dashboard-view-animate">
          <div className="editor-controls">
            <div className="doc-info">
              <User size={18} />
              <span>Dr. Managed Personalized Plan</span>
            </div>
            {isDoctor && !isEditing && (
              <button className="edit-action-btn" onClick={() => setIsEditing(true)}>Edit Clinical Plan</button>
            )}
            {isEditing && (
              <button className="sync-action-btn" onClick={handleSync}>
                <Save size={16} /> Sync with Patient
              </button>
            )}
          </div>

          <div className="prescription-layout">
            <div className="clinical-input-group">
              <label><Leaf size={16} /> Dietary Adjustments</label>
              {isEditing ? (
                <textarea 
                  value={customPlan.dietaryNotes} 
                  onChange={(e) => setCustomPlan({...customPlan, dietaryNotes: e.target.value})}
                  placeholder="e.g. 1 tsp Ghee with warm water at night..."
                />
              ) : (
                <div className="read-only-box">{customPlan.dietaryNotes || "No specific dietary notes provided."}</div>
              )}
            </div>

            <div className="clinical-input-group">
              <label><Activity size={16} /> Specialized Yoga Routine</label>
              {isEditing ? (
                <textarea 
                  value={customPlan.yogaRoutine} 
                  onChange={(e) => setCustomPlan({...customPlan, yogaRoutine: e.target.value})}
                  placeholder="e.g. Specific Pranayama for 10 mins..."
                />
              ) : (
                <div className="read-only-box">{customPlan.yogaRoutine || "Standard protocol applies."}</div>
              )}
            </div>

            <div className="clinical-input-group">
              <label><CheckCircle2 size={16} /> Herbal Support</label>
              {isEditing ? (
                <textarea 
                  value={customPlan.herbalSupport} 
                  onChange={(e) => setCustomPlan({...customPlan, herbalSupport: e.target.value})}
                  placeholder="Enter formulations..."
                />
              ) : (
                <div className="read-only-box">{customPlan.herbalSupport || "Consult doctor for herbs."}</div>
              )}
            </div>

            <div className="clinical-input-group">
              <label className="text-red"><ShieldAlert size={16} /> Safety Restrictions</label>
              {isEditing ? (
                <textarea 
                  value={customPlan.safetyRestrictions} 
                  onChange={(e) => setCustomPlan({...customPlan, safetyRestrictions: e.target.value})}
                  placeholder="Critical 'No-Go' items..."
                />
              ) : (
                <div className="read-only-box red-border">{customPlan.safetyRestrictions || "None specified."}</div>
              )}
            </div>
          </div>
          {customPlan.lastUpdated && (
            <div className="last-sync">
              Last Updated: {new Date(customPlan.lastUpdated).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
  
};

export default DietYogaComponent;