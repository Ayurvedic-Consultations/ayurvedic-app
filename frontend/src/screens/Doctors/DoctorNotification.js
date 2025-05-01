import React from "react";
import "../Patients/Notification.css"; // Include any necessary styles

const DoctorNotification = () => {
	// Sample notifications data for doctors, replace with real data as needed
	const notifications = [
		{
			id: 1,
			message: "You have a new appointment scheduled for tomorrow.",
			date: "2024-11-04",
		},
		{ id: 2, message: "A patient has sent you a message.", date: "2024-11-02" },
		{
			id: 3,
			message: "Your profile has been updated successfully.",
			date: "2024-11-01",
		},
	];

	return (
		<div className="notification-container">
			<h2>Doctor Notifications</h2>
			{notifications.length === 0 ? (
				<p>No new notifications.</p>
			) : (
				<ul>
					{notifications.map((notification) => (
						<li key={notification.id}>
							<p>{notification.message}</p>
							<span>{notification.date}</span>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default DoctorNotification;
