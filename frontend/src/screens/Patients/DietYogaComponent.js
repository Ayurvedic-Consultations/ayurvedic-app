import React, { useState, useEffect, useContext } from 'react';
import {
    ShieldAlert, CheckCircle2, ClipboardEdit, User, Apple, Soup, Salad,
    GlassWater, CalendarDays, ChevronLeft, Clock, ArrowRight, Leaf,
    Sun, Moon, Activity, HeartPulse, Video
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import './DietYogaComponent.css';

const DAY_UI_META = {
    monday: { label: "Light Detox", icon: <Leaf size={18} /> },
    tuesday: { label: "Energy Boost", icon: <Activity size={18} /> },
    wednesday: { label: "Digestion Focus", icon: <HeartPulse size={18} /> },
    thursday: { label: "Protein Day", icon: <Apple size={18} /> },
    friday: { label: "Cooling Day", icon: <GlassWater size={18} /> },
    saturday: { label: "Recovery", icon: <Moon size={18} /> },
    sunday: { label: "Relax & Reset", icon: <Sun size={18} /> }
};

const DietYogaComponent = () => {
    const { auth } = useContext(AuthContext);
    const patientId = auth?.user?.id;

    const token = localStorage.getItem('token');

    // --- STATE MANAGEMENT ---
    const [activeTab, setActiveTab] = useState('general');

    // Data States
    const [prakriti, setPrakriti] = useState(null);
    const [dietYogaData, setDietYogaData] = useState(null);

    // UI/View States
    // Initialize selectedDay as null to show the Weekly Grid first
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedMeal, setSelectedMeal] = useState(null);

    // Loading/Error States
    const [loadingPrakriti, setLoadingPrakriti] = useState(true);
    const [loadingDiet, setLoadingDiet] = useState(true);
    const [error, setError] = useState(null);

    // Helper to get today's name for highlighting (optional)
    const todayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];

    // --- EFFECTS ---

    // 1. Fetch Prakriti
    useEffect(() => {
        const fetchPrakritiData = async () => {
            if (!patientId) return;
            try {
                const response = await fetch(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/prakriti/${patientId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                setPrakriti(data.dominantType || 'Vata');
            } catch (err) {
                console.error("Error fetching Prakriti:", err);
            } finally {
                setLoadingPrakriti(false);
            }
        };
        fetchPrakritiData();
    }, [patientId, token]);

    // 2. Fetch Diet Plan
    useEffect(() => {
        const fetchDietYoga = async () => {
            if (!patientId) return;
            setLoadingDiet(true);
            try {
                const res = await fetch(
                    `${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/patients/dietYoga/${patientId}`,
                    { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
                );

                if (!res.ok) {
                    if (res.status === 404) {
                        setDietYogaData(null); // No plan assigned yet
                        return;
                    }
                    throw new Error("Failed to fetch diet & yoga plan");
                }
                const data = await res.json();
                setDietYogaData(data);
            } catch (error) {
                console.error("Error fetching diet plan:", error);
                setError(error.message);
            } finally {
                setLoadingDiet(false);
            }
        };
        fetchDietYoga();
    }, [patientId, token]);

    // --- HELPERS ---

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

    // Re-added helper to prevent crashes in View 3
    const getRecipe = (mealType, mealName) => ({
        name: mealName || "Consult your doctor",
        prep: "10 mins",
        cook: mealType === "juice" || mealType === "juices" ? "0 mins" : "20 mins",
        ingredients: [
            { name: "Main Ingredient", qty: "1 portion" },
            { name: "Seasonal Veg/Fruit", qty: "As advised" },
            { name: "Spices", qty: "To taste" }
        ],
        steps: [
            "Wash and prepare ingredients.",
            "Cook gently to preserve nutrients.",
            "Consume warm."
        ]
    });

    const activePlan = getGeneralPlanByPrakriti(prakriti);

    // --- RENDER HELPERS FOR CUSTOM TAB ---

    const renderRecipeView = () => {
        const dayData = dietYogaData.diet.weekly[selectedDay];
        const mealKey = selectedMeal === "juice" ? "juices" : selectedMeal;
        const mealName = dayData ? dayData[mealKey] : "Not assigned";
        const recipe = getRecipe(selectedMeal, mealName);

        return (
            <div className="diet-card full-width animate-in">
                <div className="diet-header-nav">
                    <button className="btn-back-pill" onClick={() => setSelectedMeal(null)}>
                        <ChevronLeft size={16} /> Back
                    </button>
                    <div className="recipe-hero">
                        <h2>{selectedMeal.toUpperCase()}</h2>
                        <p className="subtitle">{recipe.name}</p>
                    </div>
                </div>
                {/* Recipe Details */}
                <div className="recipe-section">
                    <h4 className="section-title"><Leaf size={14} /> INGREDIENTS</h4>
                    <div className="ingredients-wrapper">
                        {recipe.ingredients.map((i, idx) => (
                            <div key={idx} className="ingredient-pill">
                                <span className="qty">• {i.qty}</span><span>{i.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="recipe-section">
                    <h4 className="section-title"><Clock size={14} /> PREPARATION</h4>
                    <div className="steps-timeline">
                        {recipe.steps.map((s, i) => (
                            <div key={i} className="step-row">
                                <div className="step-marker">{i + 1}</div><p className="step-text">{s}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderDailyView = () => {
        const uiMeta = DAY_UI_META[selectedDay] || { label: "Daily Plan", icon: <Sun size={18} /> };
        const dayData = dietYogaData.diet.weekly[selectedDay] || {};

        return (
            <div className="diet-card full-width animate-in">
                <div className="diet-header-row">
                    <button className="btn-back-simple" onClick={() => setSelectedDay(null)}>
                        <ChevronLeft size={18} /> Back to Week
                    </button>
                    <h3>{selectedDay.toUpperCase()} • {uiMeta.label}</h3>
                </div>
                <div className="meals-grid-layout">
                    {["breakfast", "lunch", "dinner", "juice"].map((meal) => {
                        const dataKey = meal === "juice" ? "juices" : meal;
                        const mealContent = dayData[dataKey] || "Rest";
                        return (
                            <div key={meal} className="meal-category-card" onClick={() => setSelectedMeal(meal)}>
                                <div className="meal-icon-circle">
                                    {meal === "breakfast" ? <Sun size={24} /> :
                                        meal === "lunch" ? <Salad size={24} /> :
                                            meal === "dinner" ? <Moon size={24} /> : <GlassWater size={24} />}
                                </div>
                                <div className="meal-info">
                                    <h5>{meal.toUpperCase()}</h5>
                                    <span>{mealContent}</span>
                                </div>
                                <div className="meal-arrow"><ArrowRight size={20} /></div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderWeeklyView = () => (
        <div className="diet-card full-width animate-in">
            <div className="diet-header-row">
                <div className="header-left">
                    <div className="icon-badge"><CalendarDays size={20} /></div>
                    <h3>Weekly Diet Plan</h3>
                </div>
                <span className="status-pill active">Active Plan</span>
            </div>

            <div className="weekly-calendar-grid">
                {Object.keys(DAY_UI_META).map((day) => (
                    <div
                        key={day}
                        // Highlight if it's today
                        className={`calendar-day-card ${day === todayName ? 'today-highlight' : ''}`}
                        onClick={() => setSelectedDay(day)}
                    >
                        <span className="day-name">{day.slice(0, 3).toUpperCase()}</span>
                        <span className="day-label">{DAY_UI_META[day].label}</span>
                    </div>
                ))}
            </div>

            {/* YOGA SECTION */}
            <div className="yoga-highlight-section">
                <div className="yoga-header">
                    <h4 className="yoga-main-title">🧘 Yoga Recommendations</h4>
                    <span className="yoga-subtitle">Daily movement for balance</span>
                </div>
                <div className="yoga-sections-wrapper">
                    {/* Morning */}
                    {dietYogaData.yoga?.morning?.length > 0 && (
                        <div className="yoga-routine-column">
                            <h5 className="yoga-time-title"><Sun size={18} className="icon-morning" /> Morning Flow</h5>
                            <div className="yoga-card-list">
                                {dietYogaData.yoga.morning.map((y, idx) => (
                                    <div key={idx} className="yoga-card">
                                        <div className="yoga-card-content">
                                            <span className="yoga-name">{y.name}</span>
                                        </div>
                                        {y.link && (
                                            <a href={y.link} target="_blank" rel="noopener noreferrer" className="btn-watch">
                                                <Video size={14} /> Watch
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Evening */}
                    {dietYogaData.yoga?.evening?.length > 0 && (
                        <div className="yoga-routine-column">
                            <h5 className="yoga-time-title"><Moon size={18} className="icon-evening" /> Evening Flow</h5>
                            <div className="yoga-card-list">
                                {dietYogaData.yoga.evening.map((y, idx) => (
                                    <div key={idx} className="yoga-card">
                                        <div className="yoga-card-content">
                                            <span className="yoga-name">{y.name}</span>
                                        </div>
                                        {y.link && (
                                            <a href={y.link} target="_blank" rel="noopener noreferrer" className="btn-watch">
                                                <Video size={14} /> Watch
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // --- MAIN RENDER ---

    return (
        <div className="clinical-dashboard-wrapper">
            {/* Tab Navigation */}
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

            {/* TAB: GENERAL PROTOCOL */}
            {activeTab === 'general' && (
                <div className="dashboard-view-animate">
                    {loadingPrakriti ? (
                        <div className="loading-state">Loading Prakriti...</div>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>
            )}

            {/* TAB: CUSTOM (CLINICAL PRESCRIPTION) */}
            {activeTab === 'custom' && (
                <div className="dashboard-view-animate">
                    <div className="editor-controls">
                        <div className="doc-info">
                            <User size={18} />
                            <span>Dr. Managed Personalized Plan</span>
                        </div>
                    </div>

                    {loadingDiet ? (
                        <div className="loading-state">Loading Plan...</div>
                    ) : error ? (
                        <div className="error-state">Error: {error}</div>
                    ) : !dietYogaData ? (
                        <div className="empty-state">No Plan Assigned</div>
                    ) : (
                        // Logic Router:
                        // 1. If Meal is selected -> Show Recipe View
                        // 2. If Day is selected -> Show Daily View
                        // 3. Default -> Show Weekly View
                        selectedMeal ? renderRecipeView() :
                            selectedDay ? renderDailyView() :
                                renderWeeklyView()
                    )}
                </div>
            )}
        </div>
    );
};

export default DietYogaComponent;