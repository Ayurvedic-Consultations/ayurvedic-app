import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./PatientProfile.css";

import PatientTrans from "./patientTrans";
import PatientFeedback from "./PatientFeedback";
import PatientHistory from "./PatientHistory";
import DietPlan from "./DietPlan"; // ← your DietPlan component
import Prescription from "./Prescription";


import {
	Pill,
	Apple,
	History,
	IndianRupee,
	MessageSquareText,
	Mail,
	Phone,
	MapPin,
	X, Upload, User,
	CalendarDays,
	HeartPulse,
} from "lucide-react";

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
	const [showEditModal, setShowEditModal] = useState(false);

	// Fetch patient bookings
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

	// Fetch patient details
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
	}, [patientId]);

	// Fetch diet & yoga data (your DietPlan component likely needs this)
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

	// Update profile info
	const handleUpdateProfile = async (updatedData) => {
		try {
			const res = await fetch(
				`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/patients/updatePatient/${patientId}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify(updatedData),
				}
			);

			const data = await res.json();

			if (res.ok && data.success) {
				setPatientData(data.data);

				return true;
			} else {
				alert("Failed to update profile. Please try again.");
				return false;
			}
		} catch (error) {
			console.error("Error updating profile:", error);
			alert("An error occurred while updating the profile. Please try again.");
			return false;
		}
	}

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
			if (!file) return;

			// 500 KB limit
			if (file.size > 100 * 1024) {
				alert("Image must be less than 500KB");
				return;
			}

			// optional but sane
			if (!file.type.startsWith("image/")) {
				alert("Only image files allowed");
				return;
			}

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

		const handleSubmit = async (e) => {
			e.preventDefault();

			const success = await onUpdate(formData);

			if (success) {
				onClose();
			}
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
							{/* firstname */}
							<div className="update_box_form_group">
								<label className="update_box_label" htmlFor="name">
									First Name *
								</label>
								<input
									type="text"
									id="firstName"
									name="firstName"
									value={formData.firstName}
									onChange={handleInputChange}
									className="update_box_input"
									required
								/>
							</div>

							{/* lastname */}
							<div className="update_box_form_group">
								<label className="update_box_label" htmlFor="name">
									Last Name *
								</label>
								<input
									type="text"
									id="lastName"
									name="lastName"
									value={formData.lastName}
									onChange={handleInputChange}
									className="update_box_input"
									required
								/>
							</div>

							{/* Email */}
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

							{/* date of birth  */}
							<div className="update_box_form_group">
								<label className="update_box_label" htmlFor="dateOfBirth">
									Date of Birth *
								</label>
								<input
									type="date"
									id="dob"
									name="dob"
									value={formData.dob}
									onChange={handleInputChange}
									className="update_box_input"
									required
								/>
							</div>

							{/* gender */}
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

							{/* address */}
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

							{/* pincode */}
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

	const renderContent = () => {
		switch (activeTab) {
			case "Prescriptions":
				return <Prescription patientBookings={patientBookings} />;


			case "Diet Plan":
				return <DietPlan dietYogaData={dietYogaData} loading={loadingDiet} patientId={patientId} />;

			case "History":
				return patientBookings ? <PatientHistory bookings={patientBookings} /> : <p style={{ marginTop: "150px" }}>Loading patients...</p>;

			case "Transactions":
				return patientBookings ? <PatientTrans bookings={patientBookings} patientId={patientId} /> : <p style={{ marginTop: "150px" }}>Loading patients...</p>;

			case "Feedback":
				return <PatientFeedback patientId={patientId} />;

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

	function formatDOB2(dobString) {
		const date = new Date(dobString);
		const day = date.getDate().toString().padStart(2, "0");
		const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-indexed
		const year = date.getFullYear();
		return `${year}-${month}-${day}`;
	}

	if (loading) {
		return <p style={{ marginTop: "150px" }}>Loading patients...</p>;
	}

	return (
		<div className="profile-page">
			{showEditModal && (
				<EditModal
					isOpen={showEditModal}
					onClose={() => setShowEditModal(false)}
					onUpdate={handleUpdateProfile}
					currentProfile={{
						firstName: (patientData.firstName),
						lastName: (patientData.lastName),
						email: (patientData.email),
						dateOfBirth: (formatDOB2(patientData.dob)),
						gender: (patientData.gender),
						address: (patientData.address) || "",
						pincode: patientData.zipCode,
						profileImage: patientData.profileImage || null
					}}
				/>
			)}

			<button className="back-btn" onClick={() => navigate(-1)}>
				← Back to Patients
			</button>

			<h1>Patient Dashboard</h1>
			<p className="subtitle">Complete medical and dietary information</p>

			<div className="profile-container">
				<div className="left-panel">
					<div className="avatar">
						{patientData.profileImage ? (
							<img
								src={patientData.profileImage}
								alt="Profile"
								style={{
									width: "100%",
									height: "100%",
									objectFit: "cover",
									borderRadius: "50%",
								}}
							/>
						) : (
							patientData.firstName.charAt(0)
						)}
					</div>
					<h2>{patientData.firstName}</h2>
					<p className="muted">Patient ID: {patientData._id}</p>

					<div style={{ border: "grey solid 2px", borderRadius: "8px", position: "relative", top: "-230px", left: "-110px" }}>
						<button className="back-btn" style={{ margin: "0 0 0 0" }}
							onClick={() => setShowEditModal(true)}>Edit</button>
					</div>

					<div className="info">
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

export default PatientProfile;