
import React, { useState, useEffect } from 'react';
import './PatientHistory.css'; // Make sure you create this new CSS file
import { History as HistoryIcon, CalendarClock, FileText } from 'lucide-react';


const History = ({ bookings }) => {
	const [upcomingAppointments, setUpcomingAppointments] = useState([]);
	const [pastAppointments, setPastAppointments] = useState([]);

	useEffect(() => {
		const now = new Date();

		const upcoming = bookings
			.filter((b) => new Date(b.dateOfAppointment) >= now)
			.sort((a, b) => new Date(a.dateOfAppointment) - new Date(b.dateOfAppointment))
			.map((b) => ({
				id: b._id,
				doctor: b.doctorName,
				date: b.dateOfAppointment,
				time: b.timeSlot,
				reason: b.meetLink,
			}));

		const past = bookings
			.filter((b) => new Date(b.dateOfAppointment) < now)
			.sort((a, b) => new Date(b.dateOfAppointment) - new Date(a.dateOfAppointment))
			.map((b) => ({
				id: b._id,
				doctor: b.doctorName,
				date: b.dateOfAppointment,
				time: b.timeSlot,
				reason: b.doctorsMessage,
			}));

		setUpcomingAppointments(upcoming);
		console.log(upcomingAppointments)
		setPastAppointments(past);
	}, [bookings]);

	return (
		<div className="card history-card">
			<h3>
				<HistoryIcon size={20} /> Medical History & Appointments
			</h3>

			<div className="history-section">
				<h4>
					<CalendarClock size={18} /> Upcoming Schedule
				</h4>
				<div className="upcoming-list">
					{upcomingAppointments.length > 0 ? (
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
									<p className="doctor-name">{appt.doctor}</p>
									<strong>LINK : </strong>
									<a href={appt.reason} className="appointment-reason"  target="_blank" 
    rel="noopener noreferrer">
										{appt.reason}
									</a>
								</div>
								<div className="upcoming-time">{appt.time}</div>
							</div>
						))
					) : (
						<p className="no-history">No upcoming appointments scheduled.</p>
					)}
				</div>
			</div>

			{/* Past Visits Section - Timeline */}
			<div className="history-section">
				<h4>
					<HistoryIcon size={18} /> Past Visits
				</h4>
				<div className="timeline">
					{pastAppointments.length > 0 ? (
						pastAppointments.map((visit) => (
							<div key={visit.id} className="timeline-item">
								<div className="timeline-dot"></div>
								<div className="timeline-content">
									<div className="timeline-header">
										<p className="timeline-doctor">{visit.doctor}</p>
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
											<strong>Reason:</strong> {visit.reason}
										</p>
									</div>
								</div>
							</div>
						))
					) : (
						<p className="no-history">No past visits recorded.</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default History;