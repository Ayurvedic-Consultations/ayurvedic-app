import React, { useState } from 'react';
// Import Lucide icons
import { Salad, Coffee, Sun, Moon, GlassWater, Sprout, Leaf, Plus, X, Send, Loader2 } from 'lucide-react';
import './DietPlanForm.css';

// --- Constants ---
const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const DEFAULT_DAILY_DIET = {
	breakfast: "Whole grain toast with avocado",
	lunch: "Grilled chicken salad",
	dinner: "Baked salmon with quinoa",
	juices: "Fresh orange juice"
};

// --- Main Form Component ---
// NOTICE: Added appointmentId prop so we know who we are prescribing for
export function DietPlanForm({ bookingId, patientId, doctorId }) {
	const [activeTab, setActiveTab] = useState('weekly');
	const [herbInput, setHerbInput] = useState("");
	const token = localStorage.getItem('token');

	// 1. Add Loading and Error states
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const [dietPlan, setDietPlan] = useState({
		weekly: DAYS_OF_WEEK.reduce((acc, day) => {
			acc[day] = { ...DEFAULT_DAILY_DIET };
			return acc;
		}, {}),
		herbs: ["Turmeric", "Ginger"]
	});

	// --- Event Handlers ---
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

	// 2. THE NEW SUBMIT FUNCTION
	const handleSubmit = async (e) => {
		e.preventDefault();

		// Reset states
		setLoading(true);
		setError(null);

		try {
			const response = await fetch(
				`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/diet-yoga/`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`
					},
					body: JSON.stringify({
						bookingId: bookingId,
						patientId: patientId,
						doctorId: doctorId,
						dietPlan: dietPlan
					})
				}
			);

			if (!response.ok) {
				// You can try to parse the error message from backend if available
				const errData = await response.json().catch(() => ({}));
				throw new Error(errData.message || "Failed to submit diet plan");
			}

			const data = await response.json();
			console.log("Diet Plan Submitted Successfully:", data);
			alert("The diet plan has been successfully prescribed.");

		} catch (err) {
			console.error("Submission Error:", err);
			setError(err.message);
			alert(`Error: ${err.message}`);
		} finally {
			setLoading(false);
		}
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
						<button type="button" className={`tab-trigger ${activeTab === 'weekly' ? 'active' : ''}`} onClick={() => setActiveTab('weekly')}>Weekly Plan</button>
						<button type="button" className={`tab-trigger ${activeTab === 'herbs' ? 'active' : ''}`} onClick={() => setActiveTab('herbs')}>Herbs & Supplements</button>
					</div>

					{/* Tab Content */}
					<div className="tab-content">
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

					{/* Error Message Display (Optional) */}
					{error && <div style={{ color: 'red', marginTop: '10px' }}>Error: {error}</div>}

					<button type="submit" className="submit-button" disabled={loading}>
						{loading ? (
							<>
								<Loader2 className="animate-spin" size={18} style={{ marginRight: '8px' }} />
								Prescribing...
							</>
						) : (
							<>
								<Send size={18} style={{ marginRight: '8px' }} />
								Prescribe Diet Plan
							</>
						)}
					</button>
				</form>
			</div>
		</div>
	);
}
