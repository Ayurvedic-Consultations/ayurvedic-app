import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./AppointmentSlots.css";

function AppointmentSlots() {
	const [appointments, setAppointments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showInput, setShowInput] = useState({});
	const [meetLink, setMeetLink] = useState({});

	const { auth } = useContext(AuthContext);
	// Get the doctorId from the authenticated user context
	const doctorId = auth.user?.id;

	// The email is still useful for a redundant check, though doctorId is primary
	const email = localStorage.getItem("email");

	const navigate = useNavigate();

	// --- Helper for Robust Time Parsing ---
	const parseAppointmentDateTime = (dateString, timeSlot) => {
		// Start with the date part
		const appointmentDate = new Date(dateString);

		// Extract the start time part (e.g., "09:00 AM" or "04:00 PM")
		const startTimePart = timeSlot.split(" - ")[0].trim();
		const [time, period] = startTimePart.split(" ");
		let [hours, minutes] = time.split(":").map(Number);

		// Convert to 24-hour format
		if (period === "PM" && hours !== 12) {
			hours += 12;
		} else if (period === "AM" && hours === 12) {
			hours = 0; // Midnight case
		}

		// Set the hours and minutes on the date object
		appointmentDate.setHours(hours, minutes, 0, 0);
		return appointmentDate;
	};
	// ----------------------------------------

	useEffect(() => {
		const fetchAppointments = async () => {
			try {
				if (!doctorId) {
					setLoading(false);
					setError("Error: Doctor ID not found.");
					return;
				}

				const response = await fetch(
					// Fetch all bookings for this doctor ID
					`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/bookings/doctor/${doctorId}`
				);

				if (!response.ok) {
					throw new Error("Failed to fetch appointments");
				}

				const data = await response.json();
				const currentTime = new Date();

				// Calculate the cutoff time (30 minutes ago)
				const cutoffTime = new Date(currentTime);
				cutoffTime.setMinutes(cutoffTime.getMinutes() - 30);

				const rawBookings = Array.isArray(data.bookings) ? data.bookings : [];

				const filteredAppointments = rawBookings
					.filter((appointment) => {
						// FIX 1: Filter only for ACCEPTED appointments
						if (appointment.requestAccept !== "accepted") {
							return false;
						}
						// Redundant but safe check
						if (appointment.doctorEmail !== email) {
							return false;
						}

						// Parse the appointment date and time correctly
						const appointmentDateTime = parseAppointmentDateTime(
							appointment.dateOfAppointment,
							appointment.timeSlot
						);

						// Show appointments that are in the future or within the last 30 minutes
						return appointmentDateTime >= cutoffTime;
					})
					// Sort appointments by date and time
					.sort((a, b) => {
						const dateA = parseAppointmentDateTime(a.dateOfAppointment, a.timeSlot);
						const dateB = parseAppointmentDateTime(b.dateOfAppointment, b.timeSlot);
						return dateA.getTime() - dateB.getTime();
					});

				// Initialize meetLinks state based on fetched appointments
				const meetLinks = {};
				filteredAppointments.forEach((appointment) => {
					if (appointment.meetLink && appointment.meetLink !== "no") {
						meetLinks[appointment._id] = appointment.meetLink;
					}
				});

				setMeetLink(meetLinks);
				setAppointments(filteredAppointments);
				setLoading(false);
			} catch (error) {
				setError(error.message);
				setLoading(false);
			}
		};

		fetchAppointments();

		// Set up a timer to refresh the appointments every minute
		const intervalId = setInterval(fetchAppointments, 60000);

		// Clean up the interval when the component unmounts
		return () => clearInterval(intervalId);
	}, [doctorId, email]); // FIX: Added doctorId to dependencies

	const handleCreateMeetLink = (id) => {
		// Open the meet link service (e.g., Google Meet)
		window.open("https://meet.google.com", "_blank");
		// Show the input field for the user to paste the generated link
		setShowInput((prev) => ({ ...prev, [id]: true }));
	};

	const handleSendMeetLink = async (id) => {
		if (!meetLink[id] || meetLink[id].trim() === "") {
			alert("Please enter a valid Meet link.");
			return;
		}

		try {
			const response = await fetch(
				`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/bookings/update/meet-link/${id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ meetLink: meetLink[id] }),
				}
			);

			const data = await response.json();

			if (response.ok) {
				alert("Meet link sent successfully!");
				// FIX: Update the appointment list locally without full refresh
				setAppointments(prevApps =>
					prevApps.map(app =>
						app._id === id ? { ...app, meetLink: meetLink[id] } : app
					)
				);
				// Hide the input field after sending
				setShowInput(prev => ({ ...prev, [id]: false }));

			} else {
				alert(`Error: ${data.error}`);
			}
		} catch (error) {
			alert("Failed to send the meet link.");
		}
	};

	const handleInputChange = (id, value) => {
		setMeetLink((prev) => ({ ...prev, [id]: value }));
	};

	// Helper function to determine if an appointment is currently active
	const isAppointmentActive = (appointment) => {
		const now = new Date();
		// Use the robust parser for start time
		const startTime = parseAppointmentDateTime(appointment.dateOfAppointment, appointment.timeSlot);

		// Calculate end time based on appointment duration (assuming 30 minutes)
		const endTime = new Date(startTime);
		endTime.setMinutes(endTime.getMinutes() + 30);

		return now >= startTime && now <= endTime;
	};

	if (loading) {
		return <p style={{ marginTop: "150px", padding: "15px", background: "white", width: "max-content", borderRadius: "15px", marginLeft: "50px" }}>Loading...</p>;
	}

	if (error) {
		return <p style={{ marginTop: "150px", padding: "15px", background: "white", width: "max-content", borderRadius: "15px", marginLeft: "50px" }}>Error: {error}</p>;
	}

	return (
		<div className="appointments-container">
			<h1>My Appointment Slots</h1>

			<p>Showing upcoming appointments and those from the past 30 minutes.</p>
			{appointments.length === 0 ? (
				<p>No upcoming appointments found.</p>
			) : (
				<div className="appointment-list">
					{appointments.map((appointment) => {
						const isActive = isAppointmentActive(appointment);
						const hasMeetLink = appointment.meetLink && appointment.meetLink !== "no";

						return (
							<div
								key={appointment._id}
								className={`appointment-card ${isActive ? 'active-appointment' : ''}`}
							>
								<div className="appointment-timing">
									<h2 className="date-time">
										{new Date(appointment.dateOfAppointment).toLocaleDateString("en-GB")}
									</h2>
									<h2 className="date-time">{appointment.timeSlot}</h2>
									{isActive && <span className="active-badge">Active Now</span>}
								</div>
								<div className="appointment-details">
									<p>
										<strong>Name of the Patient:</strong> {appointment.patientName}
									</p>
									<p>
										<strong>Illness:</strong>{" "}
										{appointment.patientIllness || "No illness information"}
									</p>
									<button
										className="prescribe-button"
										// Use an anonymous arrow function to call navigate with the state object
										onClick={() => {
											navigate("/doctorsprescribe", {
												state: {
													bookingId: appointment._id,
													patientId: appointment.patientId,
													doctorId: appointment.doctorId
												}
											});
										}}
									>
										Go to Prescribe Supplements
									</button>
								</div>
								<div className="appointment-details">
									<p>
										<strong>Gender:</strong> {appointment.patientGender}
									</p>
									<p>
										<strong>Age:</strong>{" "}
										{appointment.patientAge || "No age information"}
									</p>

								</div>
								<div className="appointment-actions">
									<div className="button-group">
										{hasMeetLink ? (
											<button
												className="action-button join-button"
												onClick={() => window.open(appointment.meetLink, "_blank")}
											>
												Join Meet
											</button>
										) : showInput[appointment._id] ? (
											<>
												<input
													type="text"
													placeholder="Paste Meet link"
													value={meetLink[appointment._id] || ""}
													onChange={(e) =>
														handleInputChange(appointment._id, e.target.value)
													}
													className="meet-link-input"
												/>
												<button
													className="action-button send-link-button"
													onClick={() => handleSendMeetLink(appointment._id)}
												>
													Send Link
												</button>
											</>
										) : (
											<button
												className="action-button create-link-button"
												onClick={() => handleCreateMeetLink(appointment._id)}
											>
												Create Meet Link
											</button>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

export default AppointmentSlots;
