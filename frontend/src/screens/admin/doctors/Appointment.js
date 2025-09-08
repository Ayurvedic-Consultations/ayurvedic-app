import React, { useState, useEffect } from "react";
import "./Appointment.css";
import { CalendarClock, History as HistoryIcon } from "lucide-react";

const Appointments = ({ doctorId }) => {
	const [doctorBookings, setDoctorBookings] = useState([]);
	const [loadingBookings, setLoadingBookings] = useState(true);
	const [upcomingAppointments, setUpcomingAppointments] = useState([]);
	const [pastAppointments, setPastAppointments] = useState([]);

	// ✅ Fetch all bookings for a doctor
	useEffect(() => {
		const fetchDoctorBookings = async () => {
			try {
				const res = await fetch(
					`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/bookings/doctor/${doctorId}`
				);

				if (!res.ok) {
					if (res.status === 404) {
						setDoctorBookings([]);
						return;
					}
					throw new Error("Failed to fetch doctor bookings");
				}

				const data = await res.json();
				setDoctorBookings(data.bookings || []);
				console.log("Doctor Bookings Data:", data);
			} catch (error) {
				console.error("❌ Error fetching doctor bookings:", error);
			} finally {
				setLoadingBookings(false);
			}
		};

		if (doctorId) fetchDoctorBookings();
	}, [doctorId]);

	// ✅ Split into upcoming / past
	useEffect(() => {
		const now = new Date();

		const upcoming = doctorBookings
			.filter((b) => new Date(b.dateOfAppointment) >= now)
			.sort((a, b) => new Date(a.dateOfAppointment) - new Date(b.dateOfAppointment))
			.map((b) => ({
				id: b._id,
				patient: b.patientName,
				date: b.dateOfAppointment,
				time: b.timeSlot,
				reason: b.patientIllness,
			}));

		const past = doctorBookings
			.filter((b) => new Date(b.dateOfAppointment) < now)
			.sort((a, b) => new Date(b.dateOfAppointment) - new Date(a.dateOfAppointment))
			.map((b) => ({
				id: b._id,
				patient: b.patientName,
				date: b.dateOfAppointment,
				time: b.timeSlot,
				reason: b.doctorsMessage,
			}));

		setUpcomingAppointments(upcoming);
		setPastAppointments(past);
	}, [doctorBookings]);

	return (
		<div className="card appointments-card">
			<h3>
				<CalendarClock size={20} /> My Appointments
			</h3>

			{/* Upcoming Appointments Section */}
			<div className="appointments-section">
				<h4>
					<CalendarClock size={18} /> Upcoming Schedule
				</h4>
				<div className="upcoming-list">
					{loadingBookings ? (
						<p>Loading appointments...</p>
					) : upcomingAppointments.length > 0 ? (
						upcomingAppointments.map((appt) => (
							<div key={appt.id} className="upcoming-appointment-card">
								<div className="upcoming-date">
									<span>
										{new Date(appt.date).toLocaleDateString("en-US", { day: "numeric" })}
									</span>
									<span>
										{new Date(appt.date).toLocaleDateString("en-US", { month: "short" })}
									</span>
								</div>
								<div className="upcoming-details">
									<p className="patient-name">Patient: {appt.patient}</p>
									<p className="appointment-reason">Illness: {appt.reason}</p>
								</div>
								<div className="upcoming-time">{appt.time}</div>
							</div>
						))
					) : (
						<p className="no-appointments">No upcoming appointments scheduled.</p>
					)}
				</div>
			</div>

			{/* Past Appointments Section - Timeline */}
			<div className="appointments-section">
				<h4>
					<HistoryIcon size={18} /> Past Visits
				</h4>
				<div className="timeline">
					{loadingBookings ? (
						<p>Loading past visits...</p>
					) : pastAppointments.length > 0 ? (
						pastAppointments.map((visit) => (
							<div key={visit.id} className="timeline-item">
								<div className="timeline-dot"></div>
								<div className="timeline-content">
									<div className="timeline-header">
										<p className="timeline-patient">Patient: {visit.patient}</p>
										<p className="timeline-date">
											{new Date(visit.date).toLocaleDateString("en-GB", {
												day: "numeric",
												month: "long",
												year: "numeric",
											})}
										</p>
									</div>
									<div className="timeline-details">
										<p>
											<strong>Notes:</strong> {visit.reason}
										</p>
									</div>
								</div>
							</div>
						))
					) : (
						<p className="no-appointments">No past visits recorded.</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default Appointments;
