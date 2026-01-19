import React, { useState, useEffect } from "react";
import {
  Apple,
  Soup,
  Salad,
  GlassWater,
  CalendarDays,
  ChevronLeft,
  Clock,
  ArrowRight,
  Leaf,
  Sun,
  Moon,
  Activity,
  HeartPulse
} from "lucide-react";
import "./DietPlan.css";

/* ==============================
   DAY INTELLIGENCE LAYER
   ============================== */
const DAY_THEME = {
  monday: {
    label: "Light Detox",
    icon: <Leaf size={18} />,
    meals: {
      breakfast: "Fruit porridge with honey",
      lunch: "Simple dal & rice",
      dinner: "Vegetable khichdi",
      juice: "Amla juice"
    },
    yoga: "Gentle stretching & mobility"
  },
  tuesday: {
    label: "Energy Boost",
    icon: <Activity size={18} />,
    meals: {
      breakfast: "Oats with nuts",
      lunch: "Rajma & rice",
      dinner: "Vegetable soup",
      juice: "Beetroot juice"
    },
    yoga: "Strength flow & balance"
  },
  wednesday: {
    label: "Digestion Focus",
    icon: <HeartPulse size={18} />,
    meals: {
      breakfast: "Warm poha",
      lunch: "Curd rice",
      dinner: "Steamed vegetable bowl",
      juice: "Jeera water"
    },
    yoga: "Twisting asanas for digestion"
  },
  thursday: {
    label: "Protein Day",
    icon: <Apple size={18} />,
    meals: {
      breakfast: "Sprouts bowl",
      lunch: "Paneer & roti",
      dinner: "Dal soup",
      juice: "Protein drink"
    },
    yoga: "Core activation & stability"
  },
  friday: {
    label: "Cooling Day",
    icon: <GlassWater size={18} />,
    meals: {
      breakfast: "Banana smoothie",
      lunch: "Vegetable pulao",
      dinner: "Curd with rice",
      juice: "Coconut water"
    },
    yoga: "Cooling pranayama"
  },
  saturday: {
    label: "Recovery",
    icon: <Moon size={18} />,
    meals: {
      breakfast: "Idli & chutney",
      lunch: "Balanced thali",
      dinner: "Light soup",
      juice: "Herbal tea"
    },
    yoga: "Slow restorative yoga"
  },
  sunday: {
    label: "Relax & Reset",
    icon: <Sun size={18} />,
    meals: {
      breakfast: "Seasonal fruit bowl",
      lunch: "Home-style meal",
      dinner: "Early light dinner",
      juice: "Warm water"
    },
    yoga: "Meditation & breathing"
  }
};

const DietPlan = ({ patientId }) => {
  const [dietYogaData, setDietYogaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);

  /* ==============================
     FETCH LOGIC
     ============================== */
  useEffect(() => {
    const fetchDietYoga = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/patients/dietYoga/${patientId}`
        );
        if (!res.ok) {
          if (res.status === 404) {
            setDietYogaData({ message: "Not Subscribed" });
            return;
          }
          throw new Error("Failed");
        }
        const data = await res.json();
        setDietYogaData(data);
      } catch (error) {
        console.error("Error diet:", error);
      } finally {
        setLoading(false);
      }
    };
    if (patientId) fetchDietYoga();
  }, [patientId]);

  /* ==============================
     SIMPLE REALISTIC RECIPE
     ============================== */
  const getRecipe = (meal, name) => ({
    name,
    prep: "5 mins",
    cook: meal === "juice" ? "0 mins" : "10 mins",
    ingredients: [
      { name: "Seasonal ingredients", qty: "As advised" },
      { name: "Natural spices", qty: "Minimal" }
    ],
    steps: [
      "Prepare fresh ingredients.",
      "Cook gently on low flame.",
      "Consume warm for best digestion."
    ]
  });

  if (loading)
    return (
      <div className="diet-loading">
        <div className="spinner"></div> Loading Plan...
      </div>
    );

  if (!dietYogaData || dietYogaData.message)
    return (
      <div className="diet-card full-width">
        <div className="empty-state">No diet plan assigned.</div>
      </div>
    );

  /* ==============================
     VIEW 3 – RECIPE DETAIL
     ============================== */
  if (selectedMeal && selectedDay) {
    const theme = DAY_THEME[selectedDay];
    const recipe = getRecipe(selectedMeal, theme.meals[selectedMeal]);

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

        <div className="recipe-section">
          <h4 className="section-title"><Leaf size={14}/> INGREDIENTS</h4>
          <div className="ingredients-wrapper">
            {recipe.ingredients.map((i, idx) => (
              <div key={idx} className="ingredient-pill">
                <span className="qty">• {i.qty}</span>
                <span>{i.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="recipe-section">
          <h4 className="section-title"><Clock size={14}/> PREPARATION</h4>

          <div className="time-stats">
            <div className="time-card">
              <Clock size={20}/>
              <div>
                <span className="label">Prep</span>
                <span className="value">{recipe.prep}</span>
              </div>
            </div>
            <div className="time-card">
              <Soup size={20}/>
              <div>
                <span className="label">Cook</span>
                <span className="value">{recipe.cook}</span>
              </div>
            </div>
          </div>

          <div className="steps-timeline">
            {recipe.steps.map((s, i) => (
              <div key={i} className="step-row">
                <div className="step-marker">{i + 1}</div>
                <p className="step-text">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ==============================
     VIEW 2 – DAILY MEALS
     ============================== */
  if (selectedDay) {
    const theme = DAY_THEME[selectedDay];

    return (
      <div className="diet-card full-width animate-in">
        <div className="diet-header-row">
          <button className="btn-back-simple" onClick={() => setSelectedDay(null)}>
            <ChevronLeft size={18}/> Back to Week
          </button>
          <h3>{selectedDay.toUpperCase()} • {theme.label}</h3>
        </div>

        <div className="meals-grid-layout">
          {["breakfast","lunch","dinner","juice"].map(meal => (
            <div
              key={meal}
              className="meal-category-card"
              onClick={() => setSelectedMeal(meal)}
            >
              <div className="meal-icon-circle">
                {meal === "breakfast" ? <Sun size={24}/> :
                 meal === "lunch" ? <Salad size={24}/> :
                 meal === "dinner" ? <Moon size={24}/> :
                 <GlassWater size={24}/>}
              </div>
              <div className="meal-info">
                <h5>{meal.toUpperCase()}</h5>
                <span>{theme.meals[meal]}</span>
              </div>
              <div className="meal-arrow"><ArrowRight size={20}/></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ==============================
     VIEW 1 – WEEKLY OVERVIEW
     ============================== */
  return (
    <div className="diet-card full-width animate-in">
      <div className="diet-header-row">
        <div className="header-left">
          <div className="icon-badge"><CalendarDays size={20}/></div>
          <h3>Weekly Diet Plan</h3>
        </div>
        <span className="status-pill active">Active Plan</span>
      </div>

      <div className="weekly-calendar-grid">
        {Object.entries(DAY_THEME).map(([day, data]) => (
          <div
            key={day}
            className="calendar-day-card"
            onClick={() => setSelectedDay(day)}
          >
            <span className="day-name">{day.slice(0,3).toUpperCase()}</span>
            <span className="day-label">{data.label}</span>
          </div>
        ))}
      </div>

      <div className="yoga-highlight-section">
        <h4 className="yoga-title">🧘 Yoga Focus</h4>
        <div className="yoga-cards-row">
          <div className="yoga-routine-card">
            <h5>Today’s Focus</h5>
            <p>{DAY_THEME[selectedDay || "monday"].yoga}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DietPlan;
