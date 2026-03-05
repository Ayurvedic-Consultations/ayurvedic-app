import { useState, useEffect, useContext } from "react";
import "../Patients/Notification.css";
import { AuthContext } from "../../context/AuthContext"; 

const DoctorNotification = () => {
	const { auth } = useContext(AuthContext);
	const doctorId = auth?.user?.id;

	const [notifications, setNotifications] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchNotifications = async () => {
			// 1. Check if user is authenticated
			if (!auth?.token) {
				setLoading(false);
				return;
			}

			const queryParams = new URLSearchParams({
				userId: doctorId,
				role: 'doctor'
			}).toString();

			try {
				// 2. Fetch from your backend
				const response = await fetch(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/notifications?${queryParams}`, {
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${auth.token}`,
						'Content-Type': 'application/json'
					}
				});

				if (!response.ok) {
					throw new Error('Failed to fetch notifications');
				}

				const data = await response.json();

				const unreadNotifications = data.filter(n => n.isRead === false);

				setNotifications(unreadNotifications);

			} catch (err) {
				console.error("Error fetching notifications:", err);
				setError("Could not load notifications.");
			} finally {
				setLoading(false);
			}
		};

		fetchNotifications();
	}, [auth]); 

	if (loading) {
		return <div className="notification-container"><p>Loading notifications...</p></div>;
	}

	if (error) {
		return <div className="notification-container"><p className="error-text">{error}</p></div>;
	}

	return (
		<div className="notification-container">
			<h2>Doctor Notifications</h2>
			{notifications.length === 0 ? (
				<p>No new notifications.</p>
			) : (
				<ul>
					{notifications.map((notification) => (
						<li key={notification._id}> 
							<p>{notification.message}</p>
							<span>
								{new Date(notification.createdAt).toLocaleDateString("en-US", {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}
							</span>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default DoctorNotification;