import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./RetailerDashboard.css";
import { AuthContext } from "../../context/AuthContext";
import { jwtDecode } from "jwt-decode";

function RetailerDashboard() {
	const [retailer, setRetailer] = useState(null);
	const { auth, setAuth } = useContext(AuthContext);
	const firstName = auth.user?.firstName || "Doctor";
	const navigate = useNavigate();
	const [userId, setUserId] = useState(null);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			try {
				const decodedToken = jwtDecode(token);
				setUserId(decodedToken.id);
			} catch (error) {
				console.error("Invalid token:", error);
			}
		}
	}, []);

	return (
		<div className="retailerdb-dashboard">
			<h1>Hi {firstName}!</h1>
			<p>
				Welcome back! Let's showcase your products and connect with potential
				buyers effortlessly.
			</p>

			<div className="retailerdb-buttons">
				<Link to={`/profile/retailer/${userId}`}>
					<button className="retailerdb-btn">Your Profile</button>
				</Link>
				<Link to="/manage-products">
					<button className="retailerdb-btn">Manage Products</button>
				</Link>
				<Link to="/retailer-analytics">
					<button className="retailerdb-btn">Analytics</button>
				</Link>
				<Link to="/my-orders">
					<button className="retailerdb-btn">My Orders</button>
				</Link>
				<Link to="/customer-support">
					<button className="retailerdb-btn">Customer Support</button>
				</Link>
			</div>
		</div>
	);
}

export default RetailerDashboard;
