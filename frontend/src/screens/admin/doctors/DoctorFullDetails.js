import React, { useState, useEffect, useRef } from "react";
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
	X, Upload, User,
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
	const [showEditModal, setShowEditModal] = useState(true);

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

	const EditModal = ({
		isOpen,
		onClose,
		currentProfile,
		onUpdate,
	}) => {
		const [formData, setFormData] = useState(currentProfile);
		const [previewImage, setPreviewImage] = useState(currentProfile.profileImage || null);
		const fileInputRef = useRef(null);

		if (!isOpen) return null;

		const handleInputChange = (e) => {
			const { name, value } = e.target;
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		};

		const handleImageUpload = (e) => {
			const file = e.target.files?.[0];
			if (file) {
				const reader = new FileReader();
				reader.onloadend = () => {
					const result = reader.result;
					setPreviewImage(result);
					setFormData((prev) => ({
						...prev,
						profileImage: result,
					}));
				};
				reader.readAsDataURL(file);
			}
		};

		const handleSubmit = (e) => {
			e.preventDefault();
			onUpdate(formData);
			onClose();
		};

		return (
			<div className="update_box_overlay" onClick={onClose}>
				<div className="update_box_container" onClick={(e) => e.stopPropagation()}>
					<div className="update_box_header">
						<h2 className="update_box_title">Update Profile</h2>
						<button
							className="update_box_close_button"
							onClick={onClose}
							style={{
								border: "1px solid black",
								borderRadius: "6px",
								backgroundColor: "transparent",
								color: "black",
								cursor: "pointer",
								padding: "4px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<X size={24} color="black" />
						</button>
					</div>


					<form onSubmit={handleSubmit} className="update_box_form">
						<div className="update_box_image_section">
							<div className="update_box_image_preview">
								{previewImage ? (
									<img
										src={previewImage}
										alt="Profile preview"
										className="update_box_profile_image"
									/>
								) : (
									<div className="update_box_placeholder_image">
										<User size={48} />
									</div>
								)}
							</div>
							<button
								type="button"
								className="update_box_upload_button"
								onClick={() => fileInputRef.current?.click()}
								style={{ border: "1px solid black", color: "black" }}
							>
								<Upload size={18} />
								Upload Photo
							</button>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								onChange={handleImageUpload}
								className="update_box_file_input"
							/>
						</div>

						<div className="update_box_form_grid">
							<div className="update_box_form_group">
								<label className="update_box_label" htmlFor="name">
									Full Name *
								</label>
								<input
									type="text"
									id="name"
									name="name"
									value={formData.name}
									onChange={handleInputChange}
									className="update_box_input"
									required
								/>
							</div>

							<div className="update_box_form_group">
								<label className="update_box_label" htmlFor="email">
									Email *
								</label>
								<input
									type="email"
									id="email"
									name="email"
									value={formData.email}
									onChange={handleInputChange}
									className="update_box_input"
									required
								/>
							</div>

							<div className="update_box_form_group">
								<label className="update_box_label" htmlFor="yearsOfExperience">
									Years of Experience *
								</label>
								<input
									type="number"
									id="yearsOfExperience"
									name="yearsOfExperience"
									value={formData.yearsOfExperience}
									onChange={handleInputChange}
									className="update_box_input"
									min="0"
									required
								/>
							</div>

							<div className="update_box_form_group">
								<label className="update_box_label" htmlFor="gender">
									Gender *
								</label>
								<select
									id="gender"
									name="gender"
									value={formData.gender}
									onChange={handleInputChange}
									className="update_box_input"
									required
								>
									<option value="">Select Gender</option>
									<option value="male">Male</option>
									<option value="female">Female</option>
									<option value="other">Other</option>
									<option value="prefer-not-to-say">Prefer not to say</option>
								</select>
							</div>

							<div className="update_box_form_group update_box_full_width">
								<label className="update_box_label" htmlFor="address">
									Address *
								</label>
								<textarea
									id="address"
									name="address"
									value={formData.address}
									onChange={handleInputChange}
									className="update_box_textarea"
									rows={3}
									required
								/>
							</div>

							<div className="update_box_form_group">
								<label className="update_box_label" htmlFor="pincode">
									Pincode *
								</label>
								<input
									type="text"
									id="pincode"
									name="pincode"
									value={formData.pincode}
									onChange={handleInputChange}
									className="update_box_input"
									pattern="[0-9]{6}"
									maxLength={6}
									required
								/>
							</div>
						</div>

						<div className="update_box_form_actions">
							<button
								type="button"
								className="update_box_cancel_button"
								onClick={onClose}
							>
								Cancel
							</button>
							<button type="submit" className="update_box_submit_button"
								style={{ border: "1px solid black", color: "black" }}>
								Save Changes
							</button>
						</div>
					</form>
				</div>
			</div>
		);
	};

	if (loadingDoctor) {
		return <p style={{ marginTop: "150px" }}>Loading patients...</p>;
	}

	return (
		<div className="profile-page">
			{showEditModal && (
				<EditModal
					isOpen={showEditModal}
					onClose={() => setShowEditModal(false)}
					onUpdate={(updated) => console.log("Updated profile:", updated)}
					currentProfile={{
						name: "Dr. Rahul Verma",
						email: "rahul.verma@example.com",
						dateOfBirth: "1990-06-15",
						gender: "male",
						address: "221B Baker Street, London",
						pincode: "560001",
						profileImage:
							"https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=400&auto=format&fit=crop",
					}}
				/>
			)}
			<button className="back-btn" onClick={() => navigate(-1)}>
				<ArrowLeft size={16} /> Back to Doctors
			</button>

			<h1>Doctor Dashboard</h1>
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

						<div style={{ border: "grey solid 2px", borderRadius: "8px", position: "relative", top: "-180px", left: "-120px" }}>
							<button className="back-btn" style={{ margin: "0 0 0 0", padding: "3px 6px" }}
								onClick={() => setShowEditModal(true)}>Edit</button>
						</div>

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
