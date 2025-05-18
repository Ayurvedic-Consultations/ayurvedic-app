import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./Notification.css";

const Notification = () => {
	const { auth } = useContext(AuthContext); // Get auth context to use email
	const [notifications, setNotifications] = useState([]);
	const userEmail = auth.user?.email; // Get the user's email from context
	console.log(userEmail);
	useEffect(() => {
		const fetchNotifications = async () => {
			try {
				const response = await fetch(
					`${process.env.AYURVEDA_BACKEND_URL}/api/bookings/notifications?email=${userEmail}`
				);
				const data = await response.json();
				if (response.ok) {
					setNotifications(data.notifications);
				} else {
					console.error("Error fetching notifications:", data.error);
				}
			} catch (error) {
				console.error("Error fetching notifications:", error);
			}
		};

		if (userEmail) {
			fetchNotifications();
		}
	}, [userEmail]);

	return (
		<div className="notification-container">
			<h2>Your Notifications</h2>
			{notifications.length === 0 ? (
				<p>No new notifications.</p>
			) : (
				<ul>
					{notifications.map((notification) => (
						<li key={notification._id}>
							<p>{notification.message}</p>
							<span>{new Date(notification.date).toLocaleDateString()}</span>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default Notification;
