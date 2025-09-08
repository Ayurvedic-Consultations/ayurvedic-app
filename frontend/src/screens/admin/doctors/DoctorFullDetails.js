import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import DoctorDetails from './DoctorDetails';
import AppointmentsTab from './Appointment';
import FeedbackTab from './DoctorFeedback';
import PrescriptionsTab from "./Precription";
import Transactions from "./DoctorTrans";
import {
	Pill,
	CalendarCheck2,
	MessageCircleMore,
	UserCircle2,
	Mail,
	Phone,
	MapPin,
	Stethoscope,
	Star,
	ArrowLeft,
	Briefcase,
	IndianRupee
} from 'lucide-react';

const DoctorFullDetails = () => {
	const { id: doctorId } = useParams();
	const [doctor, setDoctor] = useState(null);
	const [loadingDoctor, setLoadingDoctor] = useState(true);
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("Details");

	// Fetch doctor details by ID
	useEffect(() => {
		const fetchDoctorById = async () => {
			try {
				const res = await fetch(
					`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/doctors/getDoctorById/${doctorId}`
				);

				if (!res.ok) {
					if (res.status === 404) {
						setDoctor([]);
						return;
					}
					throw new Error("Failed to fetch doctors");
				}

				const data = await res.json();
				setDoctor(data);
			} catch (error) {
				console.error("❌ Error fetching doctors:", error);
			} finally {
				setLoadingDoctor(false);
			}
		};

		fetchDoctorById();
	}, [doctorId]);

	const tabs = [
		{ name: "Details", icon: Briefcase },
		{ name: "Prescriptions", icon: Pill },
		{ name: "Appointments", icon: CalendarCheck2 },
		{ name: "Transction", icon: IndianRupee },
		{ name: "Feedback", icon: MessageCircleMore },
	];

	const renderContent = () => {
		switch (activeTab) {
			case "Details":
				return <DoctorDetails doctor={doctor} />;
			case "Prescriptions":
				return (
					<PrescriptionsTab doctorId={doctor._id} doctor={doctor} />
				);
			case "Appointments":
				return <AppointmentsTab doctorId={doctor._id} doctor={doctor} />;
			case "Transction":
				return <Transactions doctorId={doctor._id} doctor={doctor} />;
			case "Feedback":
				return <FeedbackTab doctorId={doctor._id} doctor={doctor} />;
			default:
				return null;
		}
	};

	if (loadingDoctor) {
		return <p style={{ marginTop: "150px" }}>Loading patients...</p>;
	}

	return (
		<div className="profile-page">
			<button className="back-btn" onClick={() => navigate(-1)}>
				<ArrowLeft size={16} /> Back to Doctors
			</button>

			<h1>Doctor Profile</h1>
			<p className="subtitle">Detailed information and activity</p>

			<div className="profile-container">
				{/* Left Panel - Summary */}
				{doctor &&
					<div className="left-panel">
						<div className="avatar">{doctor.firstName ? doctor.firstName.charAt(0) : "?"}</div>
						<h2>{doctor.firstName || "Unknown"} {doctor.lastName || ""}</h2>
						<p className="muted">      {Array.isArray(doctor.specialization) && doctor.specialization.length > 0
							? doctor.specialization.join(", ")
							: "Not specified"}</p>

						<div className="info">
							<p><Mail size={16} /> {doctor.email || "Not specified"}</p>
							<p><Phone size={16} /> {doctor.phone || "Not specified"}</p>
							<p><MapPin size={16} /> {doctor.zipCode || "Not specified"}</p>
						</div>

						<div className="stats">
							<div>
								{/* <p className="stat-value">{doctor.rating}</p> */}
								<p className="stat-value">4.5</p>

								<p className="stat-label"><Star size={14} fill="#FFD700" color="#FFD700" /> Rating</p>
							</div>
							<div>
								<p className="stat-value">{doctor.experience || "N/A"}</p>
								<p className="stat-label">Years of Exp</p>
							</div>
						</div>
					</div>}

				{/* Right Panel - Tabbed Content */}
				<div className="right-panel">
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
					<div className="tab-content">{renderContent()}</div>
				</div>
			</div>
		</div>
	);
};

export default DoctorFullDetails;
