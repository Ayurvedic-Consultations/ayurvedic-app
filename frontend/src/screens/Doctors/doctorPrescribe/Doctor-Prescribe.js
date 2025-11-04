import React, { useState } from 'react';
import './Doctor-Prescribe.css';

// --- Sample Data ---

const SAMPLE_PATIENT = {
  id: "PT-2024-001",
  name: "Sarah Johnson",
  email: "sarah.johnson@email.com",
  phone: "+1-555-0123",
  gender: "Female",
  location: "New York, NY",
  dateOfBirth: "1985-03-15",
  bloodGroup: "A+",
  avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
};

const SAMPLE_PRESCRIPTIONS = [
  {
    id: "RX-001",
    medicineName: "Ibuprofen 400mg",
    startDate: "2024-01-15",
    endDate: "2024-01-25",
    dosage: "1 tablet twice daily",
    instructions: "Take with food to avoid stomach upset",
    reason: "Back pain and inflammation",
    isActive: true,
    prescribedBy: "Dr. Michael Chen",
    prescribedDate: "2024-01-15"
  },
  {
    id: "RX-002",
    medicineName: "Omeprazole 20mg",
    startDate: "2024-01-10",
    endDate: "2024-02-10",
    dosage: "1 capsule daily",
    instructions: "Take 30 minutes before breakfast",
    reason: "Acid reflux",
    isActive: true,
    prescribedBy: "Dr. Emily Rodriguez",
    prescribedDate: "2024-01-10"
  },
  {
    id: "RX-003",
    medicineName: "Amoxicillin 500mg",
    startDate: "2023-12-01",
    endDate: "2023-12-08",
    dosage: "1 capsule three times daily",
    instructions: "Complete the full course even if feeling better",
    reason: "Throat infection",
    isActive: false,
    prescribedBy: "Dr. Sarah Williams",
    prescribedDate: "2023-12-01"
  },
];

const AVAILABLE_MEDICINES = [
  "Paracetamol", "Ibuprofen", "Amoxicillin", "Omeprazole", "Metformin",
  "Lisinopril", "Simvastatin", "Amlodipine", "Aspirin", "Clopidogrel"
];

const COMMON_ASANAS = [
  "Surya Namaskara (Sun Salutation)", "Vrikshasana (Tree Pose)",
  "Trikonasana (Triangle Pose)", "Bhujangasana (Cobra Pose)",
  "Adho Mukha Svanasana (Downward Dog)", "Balasana (Child's Pose)",
  "Shavasana (Corpse Pose)", "Pranayama (Breathing Exercise)",
  "Paschimottanasana (Seated Forward Bend)", "Ustrasana (Camel Pose)"
];

const DEFAULT_DAILY_DIET = {
  breakfast: "Whole grain toast with avocado and eggs",
  lunch: "Grilled chicken salad with mixed vegetables",
  dinner: "Baked salmon with quinoa and steamed vegetables",
  juices: "Fresh orange juice or green smoothie"
};


// --- Utility Functions ---

const getInitials = (name) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// --- Component: PatientHeader ---
const PatientHeader = ({ patient }) => {
  return (
    <div className="patient-header-card">
      <div className="patient-header-content">
        <div className="patient-avatar-section">
          <div className="patient-avatar">
            {patient.avatar ? (
              <img src={patient.avatar} alt={patient.name} className="patient-avatar-image" />
            ) : (
              <div className="patient-avatar-fallback">
                {getInitials(patient.firstname)}
              </div>
            )}
          </div>
        </div>

        <div className="patient-info">
          <div className="patient-name-section">
            <h1 className="patient-name">{patient.name}</h1>
            <span className="patient-id">ID: {patient.id}</span>
          </div>

          <div className="patient-details-grid">
            <div className="patient-detail-item">
              <span className="icon">✉️</span>
              <span className="text-sm">{patient.email}</span>
            </div>
            <div className="patient-detail-item">
              <span className="icon">📞</span>
              <span className="text-sm">{patient.phone}</span>
            </div>
            <div className="patient-detail-item">
              <span className="icon">👤</span>
              <span className="text-sm">{patient.gender}</span>
            </div>
            <div className="patient-detail-item">
              <span className="icon">📍</span>
              <span className="text-sm">{patient.location}</span>
            </div>
            <div className="patient-detail-item">
              <span className="icon">📅</span>
              <span className="text-sm">
                {calculateAge(patient.dateOfBirth)} years old
              </span>
            </div>
            {patient.bloodGroup && (
              <div className="patient-detail-item">
                <span className="icon">❤️</span>
                <span className="text-sm">Blood: {patient.bloodGroup}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


// --- Component: PrescriptionHistory ---
const PrescriptionHistory = ({ records }) => {
  const activeRecords = records.filter(record => record.isActive);
  const pastRecords = records.filter(record => !record.isActive);

  const RecordCard = ({ record }) => (
    <div className="record-card">
      <div className="record-content">
        <div className="record-header">
          <div className="record-title-group">
            <span className="pill-icon">💊</span>
            <h4 className="record-title">{record.medicineName}</h4>
          </div>
          <span className={`record-badge ${record.isActive ? 'active' : 'completed'}`}>
            {record.isActive ? '✅ Active' : '❌ Completed'}
          </span>
        </div>

        <div className="record-details">
          <div className="record-item">
            <span className="icon">📅</span>
            <span>{formatDate(record.startDate)} - {formatDate(record.endDate)}</span>
          </div>
          <div className="record-item">
            <span className="icon">⏰</span>
            <span>{record.dosage}</span>
          </div>
          
          <p className="record-reason"><strong>Reason:</strong> {record.reason}</p>
          <p className="record-instructions"><strong>Instructions:</strong> {record.instructions}</p>
          <p className="record-prescribed-by">
            Prescribed by Dr. {record.prescribedBy} on {formatDate(record.prescribedDate)}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="prescription-history">
      <div className="history-section">
        <div className="section-header">
          <h3 className="section-title">
            <span className="active-icon">✅</span> Active Prescriptions ({activeRecords.length})
          </h3>
        </div>
        <div className="record-list">
          {activeRecords.length > 0 ? (
            activeRecords.map((record) => (
              <RecordCard key={record.id} record={record} />
            ))
          ) : (
            <p className="empty-state">No active prescriptions</p>
          )}
        </div>
      </div>

      <div className="history-section">
        <div className="section-header">
          <h3 className="section-title">
            <span className="past-icon">❌</span> Past Prescriptions ({pastRecords.length})
          </h3>
        </div>
        <div className="record-list">
          {pastRecords.length > 0 ? (
            pastRecords.map((record) => (
              <RecordCard key={record.id} record={record} />
            ))
          ) : (
            <p className="empty-state">No past prescriptions</p>
          )}
        </div>
      </div>
    </div>
  );
};


// --- Component: MedicineForm ---
const MedicineForm = () => {
  const [formData, setFormData] = useState({
    medicineName: "",
    externalLink: "",
    startDate: "",
    endDate: "",
    reason: "",
    dosage: "",
    instructions: ""
  });
  
  const [showExternalLink, setShowExternalLink] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.medicineName || !formData.startDate || !formData.endDate || !formData.reason) {
      alert("Please fill in all required fields.");
      return;
    }

    console.log("Medicine prescription:", formData);
    alert(`${formData.medicineName} has been prescribed successfully! (Check console for details)`);
    setFormData({
      medicineName: "",
      externalLink: "",
      startDate: "",
      endDate: "",
      reason: "",
      dosage: "",
      instructions: ""
    });
    setShowExternalLink(false);
  };
  
  const handleMedicineChange = (e) => {
      const value = e.target.value;
      setFormData(prev => ({ ...prev, medicineName: value }));
      setShowExternalLink(value === 'other');
  };

  return (
    <div className="form-container">
      <div className="form-header-title">
        <h3 className="form-title">
          <span className="form-icon">➕</span>
          Prescribe Medicine
        </h3>
      </div>
      <div className="form-content-body">
        <form onSubmit={handleSubmit} className="medicine-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Medicine Name *</label>
              <select
                className="form-select"
                value={formData.medicineName}
                onChange={handleMedicineChange}
                required
              >
                <option value="">Select medicine</option>
                {AVAILABLE_MEDICINES.map((medicine) => (
                  <option key={medicine} value={medicine}>{medicine}</option>
                ))}
                <option value="other">Other (type below)</option>
              </select>
            </div>
            
            {(showExternalLink || formData.medicineName === "other") && (
              <div className="form-group">
                <label className="form-label">External Medicine Link / Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://example.com/ OR Custom Name"
                  value={formData.externalLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, externalLink: e.target.value }))}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                min={formData.startDate}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Dosage *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., 2 pills per day"
                value={formData.dosage}
                onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Reason for Taking *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Headache, Fever, etc."
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label className="form-label">Instructions</label>
            <textarea
              className="form-textarea"
              placeholder="e.g., Take just before lunch and dinner"
              value={formData.instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
              rows="3"
            ></textarea>
          </div>

          <button type="submit" className="submit-button">
            Add Prescription
          </button>
        </form>
      </div>
    </div>
  );
};


// --- Component: DietPlanForm ---
const DietPlanForm = () => {
  const [dietPlan, setDietPlan] = useState({
    daily: { ...DEFAULT_DAILY_DIET },
    herbs: []
  });
  const [herbInput, setHerbInput] = useState("");

  const updateDailyDiet = (field, value) => {
    setDietPlan(prev => ({
      ...prev,
      daily: { ...prev.daily, [field]: value }
    }));
  };

  const addHerb = () => {
    if (herbInput.trim() && !dietPlan.herbs.includes(herbInput.trim())) {
      setDietPlan(prev => ({
        ...prev,
        herbs: [...prev.herbs, herbInput.trim()]
      }));
      setHerbInput("");
    }
  };

  const removeHerb = (herbToRemove) => {
    setDietPlan(prev => ({
      ...prev,
      herbs: prev.herbs.filter(herb => herb !== herbToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Diet plan:", dietPlan);
    alert("The diet plan has been successfully prescribed! (Check console for details)");
  };

  const DietSection = ({ title, icon, value, onChange, placeholder }) => (
    <div className="diet-section">
      <label className="diet-label">
        <span className="diet-icon">{icon}</span>
        {title}
      </label>
      <textarea
        className="diet-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows="3"
      ></textarea>
    </div>
  );

  return (
    <div className="form-container">
      <div className="form-header-title">
        <h3 className="form-title">
          <span className="form-icon">🍽️</span>
          Prescribe Diet Plan
        </h3>
      </div>
      <div className="form-content-body">
        <form onSubmit={handleSubmit} className="diet-form">
          <div className="diet-plan-grid">
            <DietSection
              title="Breakfast"
              icon="☕"
              value={dietPlan.daily.breakfast}
              onChange={(value) => updateDailyDiet('breakfast', value)}
              placeholder="Enter breakfast recommendations..."
            />
            <DietSection
              title="Lunch"
              icon="☀️"
              value={dietPlan.daily.lunch}
              onChange={(value) => updateDailyDiet('lunch', value)}
              placeholder="Enter lunch recommendations..."
            />
            <DietSection
              title="Dinner"
              icon="🌙"
              value={dietPlan.daily.dinner}
              onChange={(value) => updateDailyDiet('dinner', value)}
              placeholder="Enter dinner recommendations..."
            />
            <DietSection
              title="Juices & Beverages"
              icon="🍹"
              value={dietPlan.daily.juices}
              onChange={(value) => updateDailyDiet('juices', value)}
              placeholder="Enter juice and beverage recommendations..."
            />
          </div>

          <div className="herbs-section">
            <h4 className="herbs-title">Herbs & Supplements</h4>
            <div className="herb-input-group">
              <input
                type="text"
                className="herb-input"
                value={herbInput}
                onChange={(e) => setHerbInput(e.target.value)}
                placeholder="Enter herb name (e.g., Turmeric, Ginger)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHerb())}
              />
              <button type="button" onClick={addHerb} className="add-herb-btn">
                +
              </button>
            </div>
            
            <div className="herb-tags">
              {dietPlan.herbs.map((herb, index) => (
                <div key={index} className="herb-tag">
                  <span className="herb-icon">🌿</span>
                  {herb}
                  <button type="button" onClick={() => removeHerb(herb)} className="remove-herb-btn">
                    ×
                  </button>
                </div>
              ))}
              {dietPlan.herbs.length === 0 && (
                <p className="empty-state-small">No herbs added yet.</p>
              )}
            </div>
          </div>

          <button type="submit" className="submit-button">
            Prescribe Diet Plan
          </button>
        </form>
      </div>
    </div>
  );
};


// --- Component: YogaPlanForm ---
const YogaPlanForm = () => {
  const [morningInput, setMorningInput] = useState("");
  const [eveningInput, setEveningInput] = useState("");
  const [yogaPlan, setYogaPlan] = useState({
    morningPlan: [
      "Surya Namaskara (Sun Salutation)", "Pranayama (Breathing Exercise)", "Vrikshasana (Tree Pose)"
    ],
    eveningPlan: [
      "Balasana (Child's Pose)", "Shavasana (Corpse Pose)", "Padmasana (Lotus Pose)"
    ]
  });

  const addAsana = (type, asana) => {
    if (asana.trim()) {
      const planKey = type === 'morning' ? 'morningPlan' : 'eveningPlan';
      if (!yogaPlan[planKey].includes(asana.trim())) {
        setYogaPlan(prev => ({
          ...prev,
          [planKey]: [...prev[planKey], asana.trim()]
        }));
      }
      if (type === 'morning') {
        setMorningInput("");
      } else {
        setEveningInput("");
      }
    }
  };

  const removeAsana = (type, asanaToRemove) => {
    const planKey = type === 'morning' ? 'morningPlan' : 'eveningPlan';
    setYogaPlan(prev => ({
      ...prev,
      [planKey]: prev[planKey].filter(asana => asana !== asanaToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (yogaPlan.morningPlan.length === 0 && yogaPlan.eveningPlan.length === 0) {
      alert("Please add at least one asana to morning or evening plan.");
      return;
    }
    console.log("Yoga plan:", yogaPlan);
    alert("The yoga plan has been successfully prescribed! (Check console for details)");
  };

  const AsanaPlan = ({ title, icon, asanas, input, setInput, type }) => (
    <div className="asana-plan-card">
      <div className="asana-plan-header">
        <h4 className="asana-plan-title">
          <span className="plan-icon">{icon}</span>
          {title}
        </h4>
      </div>
      <div className="asana-plan-content">
        <div className="asana-input-group">
          <input
            type="text"
            className="asana-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter yoga asana name"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAsana(type, input))}
          />
          <button type="button" onClick={() => addAsana(type, input)} className="add-asana-btn">
            +
          </button>
        </div>

        <div className="common-asanas-container">
          <label className="common-asanas-label">Common Asanas (click to add):</label>
          <div className="common-asanas-scroll">
            <div className="common-asana-tags">
              {COMMON_ASANAS.map((asana) => (
                <button
                  key={asana}
                  type="button"
                  className="common-asana-tag"
                  onClick={() => addAsana(type, asana)}
                  disabled={asanas.includes(asana)}
                >
                  {asana}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="selected-asanas-container">
          <label className="selected-asanas-label">Selected Asanas ({asanas.length}):</label>
          <div className="selected-asanas-scroll">
            {asanas.length > 0 ? (
              <div className="selected-asanas-list">
                {asanas.map((asana, index) => (
                  <div key={index} className="selected-asana-item">
                    <span className="selected-asana-text">
                      <span className="selected-asana-icon">🧘</span>
                      {asana}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAsana(type, asana)}
                      className="remove-asana-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state-small">No asanas added yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="form-container">
      <div className="form-header-title">
        <h3 className="form-title">
          <span className="form-icon">🧘</span>
          Prescribe Yoga Plan
        </h3>
      </div>
      <div className="form-content-body">
        <form onSubmit={handleSubmit} className="yoga-form">
          <div className="yoga-plan-grid">
            <AsanaPlan
              title="Morning Plan"
              icon="☀️"
              asanas={yogaPlan.morningPlan}
              input={morningInput}
              setInput={setMorningInput}
              type="morning"
            />
            <AsanaPlan
              title="Evening Plan"
              icon="🌙"
              asanas={yogaPlan.eveningPlan}
              input={eveningInput}
              setInput={setEveningInput}
              type="evening"
            />
          </div>

          <div className="plan-summary">
            <h4 className="summary-title">
              <span className="summary-icon">📝</span>
              Plan Summary
            </h4>
            <div className="summary-details">
              <div><strong>Morning:</strong> {yogaPlan.morningPlan.length} asanas</div>
              <div><strong>Evening:</strong> {yogaPlan.eveningPlan.length} asanas</div>
            </div>
          </div>

          <button type="submit" className="submit-button">
            Prescribe Yoga Plan
          </button>
        </form>
      </div>
    </div>
  );
};


// --- Component: PrescriptionTabs ---
const PrescriptionTabs = () => {
  const [activeTab, setActiveTab] = useState('medicine');

  const renderForm = () => {
    switch (activeTab) {
      case 'medicine':
        return <MedicineForm />;
      case 'diet':
        return <DietPlanForm />;
      case 'yoga':
        return <YogaPlanForm />;
      default:
        return null;
    }
  };

  return (
    <div className="tabs-container-card">
      <div className="tab-list">
        <button
          className={`tab-trigger ${activeTab === 'medicine' ? 'active' : ''}`}
          onClick={() => setActiveTab('medicine')}
        >
          <span className="tab-icon">💊</span>
          Medicine
        </button>
        <button
          className={`tab-trigger ${activeTab === 'diet' ? 'active' : ''}`}
          onClick={() => setActiveTab('diet')}
        >
          <span className="tab-icon">🍽️</span>
          Diet Plan
        </button>
        <button
          className={`tab-trigger ${activeTab === 'yoga' ? 'active' : ''}`}
          onClick={() => setActiveTab('yoga')}
        >
          <span className="tab-icon">🧘</span>
          Yoga Plan
        </button>
      </div>

      <div className="tab-content">
        {renderForm()}
      </div>
    </div>
  );
};


// --- Main Exported Component ---
const DoctorPrescribe = () => {
  return (
    <div className="app-container">
      <header className="app-header" style={{border:"solid red 2px"}}>
        <div className="header-content">
          <h1 className="app-title">MedCare Prescriber Platform</h1>
          <p className="app-subtitle">Doctor-Patient Consultation System</p>
        </div>
      </header>
      <main className="main-content">
        <PatientHeader patient={SAMPLE_PATIENT} />
        <div className="main-layout">
          <div className="history-column">
            <PrescriptionHistory records={SAMPLE_PRESCRIPTIONS} />
          </div>
          <div className="prescription-column">
            <PrescriptionTabs />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorPrescribe;