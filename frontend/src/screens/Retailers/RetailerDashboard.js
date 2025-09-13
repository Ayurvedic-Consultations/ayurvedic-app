import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./RetailerDashboard.css";
import { AuthContext } from "../../context/AuthContext";
import { jwtDecode } from 'jwt-decode';

function RetailerDashboard() {
	const [retailer, setRetailer] = useState(null);
	const { auth, setAuth } = useContext(AuthContext);
	const firstName = auth.user?.firstName || "Doctor";
	const navigate = useNavigate();
	const [userId, setUserId] = useState(null);

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (token) {
			try {
				const decodedToken = jwtDecode(token);
				setUserId(decodedToken.id);
			} catch (error) {
				console.error("Invalid token:", error);
			}
		}
	}, []);

	useEffect(() => {
		const fetchRetailerData = async () => {
			try {
				const token = localStorage.getItem("token");
				const response = await fetch(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/auth/profile`, {
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				const data = await response.json();
				if (response.ok) {
					setRetailer(data);
					console.log("Retailer Data:", data);
				} else {
					console.error("Failed to fetch retailer data:", data.message);
				}
			} catch (error) {
				console.error("An error occurred:", error);
			}
		};

		fetchRetailerData();
	}, []);

	return (
		<div className="retailer-dashboard">
			<h1>Hi {firstName}!</h1>
			<p>
				Welcome back! Let's showcase your products and connect with potential
				buyers effortlessly.
			</p>
			<div className="dashboard-buttons">
				<Link to={`/profile/retailer/${userId}`}>
					<button className="dashboard-btn">Your Profile</button>
				</Link>
				<Link to="/manage-products">
					<button className="dashboard-btn">Manage Products</button>
				</Link>
				<Link to="/retailer-analytics">
					<button className="dashboard-btn">Analytics</button>
				</Link>
				<Link to="/my-orders">
					<button className="dashboard-btn">My Orders</button>
				</Link>
				<Link to="/customer-support">
					<button className="dashboard-btn">Customer Support</button>
				</Link>
			</div>
		</div>
	);
}

export default RetailerDashboard;
