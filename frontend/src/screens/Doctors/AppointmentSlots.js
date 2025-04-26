import React, { useState, useEffect } from "react";
import "./AppointmentSlots.css"; // Ensure CSS is correctly linked

function AppointmentSlots() {
	const [appointments, setAppointments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showInput, setShowInput] = useState({});
	const [meetLink, setMeetLink] = useState({});
	const [linkSent, setLinkSent] = useState({});

	const email = localStorage.getItem("email");

	useEffect(() => {
		const fetchAppointments = async () => {
			try {
				const response = await fetch(
					"http://localhost:8080/api/bookings/bookings"
				);
				if (!response.ok) {
					throw new Error("Failed to fetch appointments");
				}

				const data = await response.json();
				const filteredAppointments = data.bookings.filter(
					(appointment) =>
						appointment.doctorEmail === email &&
						appointment.requestAccept === "y"
				);

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
	}, [email]);

	const handleCreateMeetLink = (id) => {
		window.open("https://meet.google.com", "_blank");
		setShowInput((prev) => ({ ...prev, [id]: true }));
	};

	const handleSendMeetLink = async (id) => {
		if (!meetLink[id] || meetLink[id].trim() === "") {
			alert("Please enter a valid Meet link.");
			return;
		}

		try {
			const response = await fetch(
				`http://localhost:8080/api/bookings/update/meet-link/${id}`,
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
				setLinkSent((prev) => ({ ...prev, [id]: true }));
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

	if (loading) {
		return <p>Loading...</p>;
	}

	if (error) {
		return <p>Error: {error}</p>;
	}

	return (
		<div className="appointments-container">
			<h1>My Appointment Slots</h1>
			<p>
				Please navigate to the patient list tab to write down what supplements,
				food, and yoga the patient should do.
			</p>
			{appointments.length === 0 ? (
				<p>No appointments found.</p>
			) : (
				appointments.map((appointment) => (
					<div key={appointment._id} className="appointment-card">
						<div className="appointment-timing">
							<h2 className="date-time">
								{new Date(appointment.dateOfAppointment).toLocaleDateString(
									"en-GB"
								)}
							</h2>
							<h2 className="date-time">{appointment.timeSlot}</h2>
						</div>
						<div className="appointment-details">
							<p>
								<strong>Name of the Patient:</strong> {appointment.patientName}
							</p>
							<p>
								<strong>Patient Email:</strong>{" "}
								{appointment.patientEmail || "No email available"}
							</p>
							<p>
								<strong>Illness:</strong>{" "}
								{appointment.patientIllness || "No illness information"}
							</p>
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
							{/* Button group for left-aligned "Suggest Diet and Yoga Plan" */}
							<div className="button-group">
								{meetLink[appointment._id] &&
								meetLink[appointment._id] !== "no" ? (
									<button
										className="action-button"
										onClick={() =>
											window.open(meetLink[appointment._id], "_blank")
										}
									>
										Join Meet
									</button>
								) : showInput[appointment._id] ? (
									<>
										<input
											type="text"
											placeholder="Enter Meet link"
											value={meetLink[appointment._id] || ""}
											onChange={(e) =>
												handleInputChange(appointment._id, e.target.value)
											}
											className="meet-link-input"
										/>
										<button
											className="action-button"
											onClick={() => handleSendMeetLink(appointment._id)}
										>
											Send Meet Link
										</button>
									</>
								) : (
									<button
										className="action-button"
										onClick={() => handleCreateMeetLink(appointment._id)}
									>
										Create Meet Link
									</button>
								)}
							</div>
						</div>
					</div>
				))
			)}
		</div>
	);
}

export default AppointmentSlots;
