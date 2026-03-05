import React, { useState, useEffect, useContext } from "react";
import { Check, Bell, AlertCircle, Info, Package } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import "./Notification.css";

const Notification = () => {
	const { auth } = useContext(AuthContext);
	const patientId = auth?.user?.id;

	const [notifications, setNotifications] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// --- 1. FETCH NOTIFICATIONS ---
	useEffect(() => {
		const fetchNotifications = async () => {
			if (!auth?.token) {
				setLoading(false);
				return;
			}

			const queryParams = new URLSearchParams({
				patientId: patientId,
				role: 'patient'
			}).toString();

			try {
				// Using the unified notification endpoint
				const response = await fetch(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/notifications?${queryParams}`, {
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${auth.token}`,
						'Content-Type': 'application/json'
					},
				});

				if (!response.ok) {
					throw new Error('Failed to fetch notifications');
				}

				const data = await response.json();

				// Filter: Show only unread notifications
				const unreadOnly = data.filter(n => n.isRead === false);
				setNotifications(unreadOnly);

			} catch (err) {
				console.error("Error fetching notifications:", err);
				setError("Could not load notifications.");
			} finally {
				setLoading(false);
			}
		};

		fetchNotifications();

		// Auto-refresh every 30 seconds
		const interval = setInterval(fetchNotifications, 30000);
		return () => clearInterval(interval);
	}, [auth]);

	// --- 2. MARK AS READ FUNCTION ---
	const markAsRead = async (id) => {
		try {
			const response = await fetch(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/notifications/${id}/read`, {
				method: 'PATCH',
				headers: {
					'Authorization': `Bearer ${auth.token}`,
					'Content-Type': 'application/json'
				}
			});

			if (response.ok) {
				// Optimistic UI update
				setNotifications(prev => prev.filter(n => n._id !== id));
			}
		} catch (err) {
			console.error("Error marking notification as read:", err);
		}
	};

	// --- 3. HELPER: ICONS BY TYPE ---
	const getIconByType = (type) => {
		switch (type) {
			case 'order': return <Package size={18} color="#e67e22" />;     // Orange for orders
			case 'payment': return <AlertCircle size={18} color="#27ae60" />; // Green for payments
			case 'system': return <Info size={18} color="#3498db" />;       // Blue for system info
			default: return <Bell size={18} color="#9b59b6" />;             // Purple for others
		}
	};

	if (loading) return <div className="notification-container"><p>Loading notifications...</p></div>;
	if (error) return <div className="notification-container"><p className="error-text">{error}</p></div>;

	return (
		<div className="notification-container">
			<div className="notification-header">
				<h2>Your Notifications</h2>
				{notifications.length > 0 && (
					<span className="badge-count">{notifications.length} New</span>
				)}
			</div>

			{notifications.length === 0 ? (
				<div className="empty-state">
					<p>No new notifications.</p>
				</div>
			) : (
				<ul className="notification-list">
					{notifications.map((notification) => (
						<li key={notification._id} className="notification-item fade-in">
							<div className="notif-icon-wrapper">
								{getIconByType(notification.type)}
							</div>

							<div className="notif-content">
								<div className="notif-top-row">
									<span className="notif-type">{notification.type?.toUpperCase() || 'SYSTEM'}</span>
									<span className="notif-date">
										{new Date(notification.createdAt).toLocaleDateString("en-US", {
											month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
										})}
									</span>
								</div>
								<p className="notif-message">{notification.message}</p>
							</div>

							<button
								className="btn-mark-read"
								onClick={() => markAsRead(notification._id)}
								title="Mark as read"
							>
								<Check size={16} />
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default Notification;