import { useState, useEffect } from "react";
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
	HeartPulse,
	ExternalLink,
	Video
} from "lucide-react";
import "./DietPlan.css";

/* ==============================
   UI METADATA LAYER (Static Visuals Only)
   ============================== */
const DAY_UI_META = {
	monday: { label: "Light Detox", icon: <Leaf size={18} /> },
	tuesday: { label: "Energy Boost", icon: <Activity size={18} /> },
	wednesday: { label: "Digestion Focus", icon: <HeartPulse size={18} /> },
	thursday: { label: "Protein Day", icon: <Apple size={18} /> },
	friday: { label: "Cooling Day", icon: <GlassWater size={18} /> },
	saturday: { label: "Recovery", icon: <Moon size={18} /> },
	sunday: { label: "Relax & Reset", icon: <Sun size={18} /> }
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
				console.log("Diet & Yoga Data:", data);
			} catch (error) {
				console.error("Error diet:", error);
			} finally {
				setLoading(false);
			}
		};
		if (patientId) fetchDietYoga();
	}, [patientId]);

	/* ==============================
	   HELPER: REALISTIC RECIPE GENERATOR
	   (Backend only gives name, this generates structure)
	   ============================== */
	const getRecipe = (mealType, mealName) => ({
		name: mealName || "Consult your doctor",
		prep: "10 mins",
		cook: mealType === "juice" || mealType === "juices" ? "0 mins" : "20 mins",
		ingredients: [
			{ name: "Main Ingredient (As prescribed)", qty: "1 portion" },
			{ name: "Seasonal Vegetables/Fruits", qty: "As advised" },
			{ name: "Ayurvedic Spices", qty: "To taste" }
		],
		steps: [
			"Wash and prepare fresh ingredients.",
			"Cook gently on low flame to preserve nutrients.",
			"Add spices as recommended in your chart.",
			"Consume warm for best digestion."
		]
	});

	if (loading)
		return (
			<div className="diet-loading">
				<div className="spinner"></div> Loading Plan...
			</div>
		);

	// Check if data exists and has the required structure
	if (!dietYogaData || dietYogaData.message || !dietYogaData.diet)
		return (
			<div className="diet-card full-width">
				<div className="empty-state">No diet plan assigned yet.</div>
			</div>
		);

	/* ==============================
	   VIEW 3 – RECIPE DETAIL
	   ============================== */
	if (selectedMeal && selectedDay) {
		// Access dynamic data from backend
		const dayData = dietYogaData.diet.weekly[selectedDay];

		// Handle mapping: Backend uses 'juices', Frontend UI uses 'juice'
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

				<div className="recipe-section">
					<h4 className="section-title"><Leaf size={14} /> INGREDIENTS</h4>
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
					<h4 className="section-title"><Clock size={14} /> PREPARATION</h4>
					<div className="time-stats">
						<div className="time-card">
							<Clock size={20} />
							<div>
								<span className="label">Prep</span>
								<span className="value">{recipe.prep}</span>
							</div>
						</div>
						<div className="time-card">
							<Soup size={20} />
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
		const uiMeta = DAY_UI_META[selectedDay] || { label: "Daily Plan", icon: <Sun size={18} /> };
		// Safe access to backend data
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
						// Map 'juice' UI key to 'juices' backend key
						const dataKey = meal === "juice" ? "juices" : meal;
						const mealContent = dayData[dataKey] || "Rest";

						return (
							<div
								key={meal}
								className="meal-category-card"
								onClick={() => setSelectedMeal(meal)}
							>
								<div className="meal-icon-circle">
									{meal === "breakfast" ? <Sun size={24} /> :
										meal === "lunch" ? <Salad size={24} /> :
											meal === "dinner" ? <Moon size={24} /> :
												<GlassWater size={24} />}
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
	}

	/* ==============================
	   VIEW 1 – WEEKLY OVERVIEW & YOGA
	   ============================== */
	return (
		<div className="diet-card full-width animate-in">
			<div className="diet-header-row">
				<div className="header-left">
					<div className="icon-badge"><CalendarDays size={20} /></div>
					<h3>Weekly Diet Plan</h3>
				</div>
				<span className="status-pill active">Active Plan</span>
			</div>

			{/* Days Grid */}
			<div className="weekly-calendar-grid">
				{Object.keys(DAY_UI_META).map((day) => (
					<div
						key={day}
						className="calendar-day-card"
						onClick={() => setSelectedDay(day)}
					>
						<span className="day-name">{day.slice(0, 3).toUpperCase()}</span>
						<span className="day-label">{DAY_UI_META[day].label}</span>
					</div>
				))}
			</div>

			{/* Yoga Section - Fetched from DB */}

			<div className="yoga-highlight-section">
				<div className="yoga-header">
					<h4 className="yoga-main-title">🧘 Yoga Recommendations</h4>
					<span className="yoga-subtitle">Daily movement for balance</span>
				</div>

				<div className="yoga-sections-wrapper">
					{/* Morning Yoga Column */}
					{dietYogaData.yoga?.morning?.length > 0 && (
						<div className="yoga-routine-column">
							<h5 className="yoga-time-title">
								<Sun size={18} className="icon-morning" /> Morning Flow
							</h5>
							<div className="yoga-card-list">
								{dietYogaData.yoga.morning.map((y, idx) => (
									<div key={idx} className="yoga-card">
										<div className="yoga-card-content">
											<span className="yoga-name">{y.name}</span>
											<span className="yoga-tag">Start your day</span>
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

					{/* Evening Yoga Column */}
					{dietYogaData.yoga?.evening?.length > 0 && (
						<div className="yoga-routine-column">
							<h5 className="yoga-time-title">
								<Moon size={18} className="icon-evening" /> Evening Flow
							</h5>
							<div className="yoga-card-list">
								{dietYogaData.yoga.evening.map((y, idx) => (
									<div key={idx} className="yoga-card">
										<div className="yoga-card-content">
											<span className="yoga-name">{y.name}</span>
											<span className="yoga-tag">Unwind & Relax</span>
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
};

export default DietPlan;