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
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("Diet Plan");
	const [patientData, setPatientData] = useState(null);
	const [dietYogaData, setDietYogaData] = useState(null);
	const [loadingDiet, setLoadingDiet] = useState(true);
	const [loading, setLoading] = useState(true);
	const [patientBookings, setPatientBookings] = useState([]);
	const [loadingBookings, setLoadingBookings] = useState(true);

	// ✅ Fetch all bookings for a patient
	useEffect(() => {
		const fetchPatientBookings = async () => {
			try {
				const res = await fetch(
					`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/bookings/patient/${patientId}`
				);

				if (!res.ok) {
					if (res.status === 404) { 
						setPatientBookings([]);
						return;
					}
					throw new Error("Failed to fetch patient bookings");
				}

				const data = await res.json();
				setPatientBookings(data.bookings);
			} catch (error) {
				console.error("❌ Error fetching patient bookings:", error);
			} finally {
				setLoadingBookings(false);
			}
		};

		if (patientId) fetchPatientBookings();
	}, [patientId]);


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
							<span className="badge">
								{patientBookings.reduce(
									(total, booking) => total + booking.recommendedSupplements.length,
									0
								)}
							</span>
						</h3>

						{patientBookings.length > 0 &&
							patientBookings.map((booking, bIdx) =>
								booking.recommendedSupplements.map((supp, sIdx) => (
									<div key={`${bIdx}-${sIdx}`} className="sub-card" style={{ width: "100%" }}>
										<div className="sub-card-header">
											<h4>{supp.medicineName}</h4>
											<span className="dosage">{supp.dosage}</span>
										</div>
										<div className="prescription-details">
											<div>
												<p className="label">For</p>
												<p>{supp.forIllness}</p>
											</div>
											<div>
												<p className="label">Duration</p>
												<p>{supp.duration}</p>
											</div>
											<div>
												<p className="label">Instruction</p>
												<p>{supp.instructions}</p>
											</div>
											<div>
												<p className="label">Prescribed by</p>
												<p>{booking.doctorName}</p>
											</div>
										</div>
										<p className="prescribed-date">
											⏱ Prescribed on {new Date(booking.createdAt).toLocaleDateString()}
										</p>
									</div>
								))
							)}
					</div>
				);
			case "Diet Plan":
				return (
					loadingDiet ? (
						<p style={{ marginTop: "200px" }}>Loading diet plan...</p>
					) : (<div className="card">
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

								<div className="sub-card meal-card" style={{ padding: "10px 25px" }}>
									<h3>Herbs</h3>
									<ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
										{dietYogaData?.diet?.herbs?.map((herb, i) => (
											<li key={i}>{herb}</li>
										))}
									</ul>
								</div>


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
					</div>)
				);
			case "History":
				return patientBookings ? <PatientHistory bookings={patientBookings} /> : <p style={{ marginTop: "150px" }}>Loading patients...</p>;
			case "Transactions":
				return patientBookings ? <PatientTrans bookings={patientBookings} patientId={patientId}/> : <p style={{ marginTop: "150px" }}>Loading patients...</p>;
			case "Feedback":
				return <PatientFeedback patientId={patientId}/>;
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