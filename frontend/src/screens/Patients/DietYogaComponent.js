import React, { useState, useEffect, useContext } from 'react';
import {
    Leaf,
    Activity,
    ShieldAlert,
    CheckCircle2,
    ClipboardEdit,
    User,
    Clock,
    CalendarDays
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import './DietYogaComponent.css';

const DietYogaComponent = () => {
    const { auth } = useContext(AuthContext);
	const patientId = auth?.user?.id;
    const [activeTab, setActiveTab] = useState('general');
    const [prakriti, setPrakriti] = useState(null);
    const [loading, setLoading] = useState(true);

    const [dietYogaData, setDietYogaData] = useState(null);
    const [loadingDiet, setLoadingDiet] = useState(true);
    const [error, setError] = useState(null);

    // NEW: State to track which day is selected (Default to today)
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const [selectedDay, setSelectedDay] = useState(daysOfWeek[new Date().getDay()]);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchPrakritiData = async () => {
            if (!patientId) return;
            try {
                const response = await fetch(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/prakriti/${patientId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                setPrakriti(data.dominantType || 'Vata');
                setLoading(false);
            } catch (err) {
                console.error("Error fetching Prakriti:", err);
                setLoading(false);
            }
        };
        fetchPrakritiData();
    }, [patientId, token]);

    useEffect(() => {
        const fetchDietYoga = async () => {
            if (!patientId) return;
            setLoadingDiet(true);
            try {
                const res = await fetch(
                    `${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/patients/dietYoga/${patientId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!res.ok) {
                    if (res.status === 404) {
                        setDietYogaData(null);
                        return;
                    }
                    throw new Error("Failed to fetch diet & yoga plan");
                }

                const data = await res.json();
                setDietYogaData(data);
            } catch (error) {
                console.error("Error fetching diet & yoga plan:", error);
                setError(error.message);
            } finally {
                setLoadingDiet(false);
            }
        };

        fetchDietYoga();
    }, [patientId, token]);

    // NEW: Get diet based on the selectedDay state, not just today
    const getSelectedDayDiet = () => {
        if (!dietYogaData?.diet?.weekly) return null;
        return dietYogaData.diet.weekly[selectedDay];
    };

    const currentDiet = getSelectedDayDiet();

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

            {activeTab === 'custom' && (
                <div className="dashboard-view-animate">
                    <div className="editor-controls">
                        <div className="doc-info">
                            <User size={18} />
                            <span>Dr. Managed Personalized Plan</span>
                        </div>
                    </div>

                    {loadingDiet ? (
                        <div className="loading-state">Loading clinical plan...</div>
                    ) : !dietYogaData ? (
                        <div className="empty-state">
                            <ShieldAlert className="text-gray" size={32} />
                            <p>No clinical prescription has been assigned by your doctor yet.</p>
                        </div>
                    ) : (
                        <div className="prescription-layout">
                            
                            {/* NEW: Day Selector Buttons */}
                            <div className="clinical-input-group">
                                <label><CalendarDays size={16} /> Select Day</label>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                    {daysOfWeek.map(day => (
                                        <button
                                            key={day}
                                            onClick={() => setSelectedDay(day)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '20px',
                                                border: '1px solid #ccc',
                                                background: selectedDay === day ? '#2E7D32' : 'white',
                                                color: selectedDay === day ? 'white' : '#333',
                                                cursor: 'pointer',
                                                textTransform: 'capitalize',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            {day.slice(0, 3)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="clinical-input-group">
                                <label><CalendarDays size={16} /> Diet Plan for <span style={{textTransform: 'capitalize', color:'#2E7D32'}}>{selectedDay}</span></label>
                                <div className="read-only-box">
                                    {currentDiet ? (
                                        <div className="diet-day-grid">
                                            <p><strong>Breakfast:</strong> {currentDiet.breakfast || "Not specified"}</p>
                                            <p><strong>Lunch:</strong> {currentDiet.lunch || "Not specified"}</p>
                                            <p><strong>Dinner:</strong> {currentDiet.dinner || "Not specified"}</p>
                                            <p><strong>Juices/Fluids:</strong> {currentDiet.juices || "Not specified"}</p>
                                        </div>
                                    ) : (
                                        "No diet plan found for this day."
                                    )}
                                </div>
                            </div>

                            <div className="clinical-input-group">
                                <label><Activity size={16} /> Specialized Yoga Routine</label>
                                <div className="read-only-box">
                                    <div className="yoga-section">
                                        <strong>Morning:</strong>
                                        <ul>
                                            {dietYogaData.yoga?.morning?.map((y, i) => (
                                                <li key={i}>{y.name} {y.link && <a href={y.link} target="_blank" rel="noreferrer">(Link)</a>}</li>
                                            )) || "None"}
                                        </ul>
                                    </div>
                                    <div className="yoga-section mt-2">
                                        <strong>Evening:</strong>
                                        <ul>
                                            {dietYogaData.yoga?.evening?.map((y, i) => (
                                                <li key={i}>{y.name} {y.link && <a href={y.link} target="_blank" rel="noreferrer">(Link)</a>}</li>
                                            )) || "None"}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="clinical-input-group">
                                <label><CheckCircle2 size={16} /> Herbal Support</label>
                                <div className="read-only-box">
                                    {dietYogaData.diet?.herbs?.length > 0
                                        ? dietYogaData.diet.herbs.map((herb, i) => (
                                            <span key={i} style={{ display: 'inline-block', margin: '0.25rem' }} className="pill-item">
                                                {herb}
                                            </span>
                                        ))
                                        : "No specific herbs prescribed."}
                                </div>
                            </div>

                            <div className="last-sync">
                                Plan Created: {new Date(dietYogaData.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DietYogaComponent;