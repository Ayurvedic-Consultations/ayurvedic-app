import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./PatientProfile.css";

import PatientTrans from "./patientTrans"; // Import Transactions component
import PatientFeedback from "./PatientFeedback"; // Import Feedback component
import PatientHistory from "./PatientHistory"; // Import History component

// Import icons from lucide-react
import {
	Pill,
	Apple,
	History,
	IndianRupee,
	MessageSquareText,
	Mail,
	Phone,
	MapPin,
	CalendarDays,
	HeartPulse, // Kept for placeholder example, but Vitals tab is removed
} from "lucide-react";

// Dummy data (remains the same)
const patient = {
	id: 1,
	name: "Sarah Johnson",
	email: "sarah.johnson@email.com",
	contact: "+1-555-0123",
	address: "123 Main St, New York, NY 10001",
	joinedDate: "2024-01-15",
	age: 34,
	gender: "Female",
	prescriptions: [
		{
			id: 1,
			medicine: "Amoxicillin 500mg",
			frequency: "Twice daily",
			duration: "7 days",
			doctorName: "Dr. Smith",
			dosage: "1 tablet",
			instruction: "Take with meal",
			prescribedDate: "2024-08-20",
		},
		{
			id: 2,
			medicine: "Vitamin D3",
			frequency: "Once daily",
			duration: "30 days",
			doctorName: "Dr. Wilson",
			dosage: "1000 IU",
			instruction: "Take with meal",
			prescribedDate: "2024-08-25",
		},
	],
	dietPlan: {
		planName: "Weight Loss Plan",
		calories: 1500,
		subscriptionDate: "2024-08-01",
		duration: "3 months",
		meals: [
			{
				type: "Breakfast",
				items: ["Oatmeal with berries", "Green tea"],
				calories: 350,
			},
			{
				type: "Lunch",
				items: ["Grilled chicken salad", "Water"],
				calories: 450,
			},
			{
				type: "Dinner",
				items: ["Salmon with vegetables", "Herbal tea"],
				calories: 500,
			},
			{ type: "Juice", items: ["Carrot juice", "Apple juice"], calories: 150 },
		],
	},
};

// Placeholder components for new tabs
const HistoryTab = () => <div className="card"><h3><History size={20} /> Patient History</h3><p>Medical history will be displayed here.</p></div>;
const Transactions = () => <div className="card"><h3><IndianRupee size={20} /> Transactions</h3><p>Billing and transaction details will be displayed here.</p></div>;
const Feedback = () => <div className="card"><h3><MessageSquareText size={20} /> Feedback</h3><p>Patient feedback will be displayed here.</p></div>;

// Array to manage tabs and their icons (Vitals removed)
const tabs = [
	{ name: "Prescriptions", icon: Pill },
	{ name: "Diet Plan", icon: Apple },
	{ name: "History", icon: History },
	{ name: "Transactions", icon: IndianRupee },
	{ name: "Feedback", icon: MessageSquareText },
];

const PatientProfile = () => {
	const { id: patientId } = useParams();
	console.log("Patient ID from URL:", patientId);
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("Diet Plan");
	const [patientData, setPatientData] = useState(null);
	const [dietYogaData, setDietYogaData] = useState(null);
	const [loadingDiet, setLoadingDiet] = useState(true);
	const [loading, setLoading] = useState(true);

	// patient details fetch
	useEffect(() => {
		const fetchPatient = async () => {
			try {
				const res = await fetch(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/patients/getPatient/${patientId}`);
				if (!res.ok) throw new Error("Failed to fetch patient");
				const data = await res.json();
				setPatientData(data);
			} catch (error) {
				console.error("Error fetching patients:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchPatient();
	}, []);

	// diet & yoga plan fetch
	useEffect(() => {
		const fetchDietYoga = async () => {
			try {
				const res = await fetch(
					`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/patients/dietYoga/${patientId}`
				);
				if (!res.ok) {
					if (res.status === 404) {
						setDietYogaData({ message: "Patient has not subscribed to a diet & yoga plan yet" });
						return;
					}
					throw new Error("Failed to fetch diet & yoga plan");
				}
				const data = await res.json();
				setDietYogaData(data);
				console.log("Fetched diet & yoga plan:", data);
			} catch (error) {
				console.error("Error fetching diet & yoga plan:", error);
			} finally {
				setLoadingDiet(false);
			}
		};

		fetchDietYoga();
	}, [patientId]);

	const renderContent = () => {
		switch (activeTab) {
			case "Prescriptions":
				return (
					<div className="card">
						<h3>
							<Pill size={20} /> Medicines Prescribed{" "}
							<span className="badge">{patient.prescriptions.length}</span>
						</h3>
						{patient.prescriptions.map((p) => (
							<div key={p.id} className="sub-card">
								<div className="sub-card-header">
									<h4>{p.medicine}</h4>
									<span className="dosage">{p.dosage}</span>
								</div>
								<div className="prescription-details">
									<div>
										<p className="label">Frequency</p>
										<p>{p.frequency}</p>
									</div>
									<div>
										<p className="label">Duration</p>
										<p>{p.duration}</p>
									</div>
									<div>
										<p className="label">Instruction</p>
										<p>{p.instruction}</p>
									</div>
									<div>
										<p className="label">Prescribed by</p>
										<p>{p.doctorName}</p>
									</div>
								</div>
								<p className="prescribed-date">
									⏱ Prescribed on{" "}
									{new Date(p.prescribedDate).toLocaleDateString()}
								</p>
							</div>
						))}
					</div>
				);
			case "Diet Plan":
				return (
					<div className="card">
						<h3>
							<Apple size={20} /> Diet Plan{" "}
							{dietYogaData?.message ? (
								<span className="badge error">Not Subscribed</span>
							) : (
								<span className="badge success">Subscribed</span>
							)}
						</h3>

						{dietYogaData && !dietYogaData?.message && (
							<>
								<h4>Daily Meal Plan</h4>
								<div className="meal-grid">
									{dietYogaData?.diet?.daily &&
										Object.entries(dietYogaData.diet.daily).map(([mealType, mealValue]) => (
											<div key={mealType} className="sub-card meal-card">
												<h5>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</h5>
												<p>{mealValue}</p>
											</div>
										))}
								</div>

								<h4>Weekly Meal Plan</h4>
								<div className="meal-grid">
									{dietYogaData?.diet?.weekly &&
										Object.entries(dietYogaData.diet.weekly).map(([day, meals]) => (
											<div key={day} className="sub-card meal-card">
												<h5>{day.charAt(0).toUpperCase() + day.slice(1)}</h5>
												<ul>
													{Object.entries(meals).map(([mealType, mealValue], i) => (
														<li key={i}>
															<strong>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}:</strong>{" "}
															{mealValue}
														</li>
													))}
												</ul>
											</div>
										))}
								</div>

								<h3>Herbs</h3>
								<ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
									{dietYogaData?.diet?.herbs?.map((herb, i) => (
										<li key={i}>{herb}</li>
									))}
								</ul>

								<h3>Yoga Plan</h3>
								<div className="meal-grid">
									<div className="sub-card meal-card">
										<h5>Morning Plan</h5>
										<p>{dietYogaData?.yoga?.morningPlan}</p>
									</div>
									<div className="sub-card meal-card">
										<h5>Evening Plan</h5>
										<p>{dietYogaData?.yoga?.eveningPlan}</p>
									</div>
								</div>
							</>
						)}
					</div>
				);

			case "History":
				return <PatientHistory />;
			case "Transactions":
				return <PatientTrans />;
			case "Feedback":
				return <PatientFeedback />;
			default:
				return null;
		}
	};

	function formatDOB(dobString) {
		const date = new Date(dobString);
		const day = date.getDate().toString().padStart(2, "0");
		const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-indexed
		const year = date.getFullYear();
		return `${day}-${month}-${year}`;
	}

	if (loading) {
		return <p style={{ marginTop: "150px" }}>Loading patients...</p>;
	}

	return (
		<div className="profile-page">
			<button className="back-btn" onClick={() => navigate(-1)}>
				← Back to Patients
			</button>

			<h1>Patient Profile</h1>
			<p className="subtitle">Complete medical and dietary information</p>

			<div className="profile-container">
				{/* Left Panel */}
				<div className="left-panel">
					<div className="avatar">{patientData.firstName.charAt(0)}</div>
					<h2>{patientData.firstName}</h2>
					<p className="muted">Patient ID: {patientData._id}</p>

					<div className="info">
						{/*-- Icon Change: Emojis replaced with Lucide icons --*/}
						<p><Mail size={16} /> {patientData.email}</p>
						<p><Phone size={16} /> {patientData.phone}</p>
						<p><MapPin size={16} /> {patientData.zipCode}</p>
						<p><CalendarDays size={16} />{` DOB: ${formatDOB(patientData.dob)}`}</p>
					</div>

					<div className="stats">
						<div>
							<p className="stat-value">{patientData.age}</p>
							<p className="stat-label">Age</p>
						</div>
						<div>
							<p className="stat-value">{patientData.gender}</p>
							<p className="stat-label">Gender</p>
						</div>
					</div>
				</div>

				{/* Right Panel */}
				<div className="right-panel">
					{/* Tabs Navigation */}
					<div className="tabs-container">
						{tabs.map((tab) => (
							<button
								key={tab.name}
								className={`tab-btn ${activeTab === tab.name ? "active" : ""}`}
								onClick={() => setActiveTab(tab.name)}
							>
								<tab.icon size={16} strokeWidth={2.5} />
								{tab.name}
							</button>
						))}
					</div>

					{/* Content based on active tab */}
					<div className="tab-content">{renderContent()}</div>
				</div>
			</div>
		</div>
	);
};

export default PatientProfile;