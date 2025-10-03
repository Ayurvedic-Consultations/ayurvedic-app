import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './OrderHistory.css';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

const API_BASE_URL = `${process.env.REACT_APP_AYURVEDA_BACKEND_URL}`;
const img = "https://images.unsplash.com/photo-1638310526160-ce17611bffff?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const OrderHistory = () => {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const { auth } = useContext(AuthContext);
	const userId = auth?.user?.id;
	const navigate = useNavigate();

	useEffect(() => {
		const fetchOrders = async () => {
			try {
				setLoading(true);
				const response = await axios.get(`${API_BASE_URL}/api/orders`, {
					params: { userId },
					headers: { Authorization: `Bearer ${auth.token}` }
				});
				setOrders(response.data);
				console.log(response.data);
				setLoading(false);
			} catch (error) {
				console.error('Error fetching orders:', error);
				setError('Failed to load your orders. Please try again later.');
				setLoading(false);
			}
		};

		if (userId) fetchOrders();
	}, [userId, auth.token]);

	// Function to format date
	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	// Function to handle image paths
	const getImageUrl = (imagePath) => {
		if (!imagePath) {
			// No image provided → use Unsplash random fallback
			return img;
		}

		// Handle different image path scenarios
		if (imagePath.startsWith('http')) {
			// Already a full URL
			return imagePath;
		} else if (imagePath.startsWith('/')) {
			// Absolute path from root
			return `${API_BASE_URL}${imagePath}`;
		} else {
			// Relative path
			return `${API_BASE_URL}/${imagePath}`;
		}
	};


	// Function to map status to badge color
	const getStatusColor = (status) => {
		switch (status) {
			case 'pending': return '#FFC107'; // yellow
			case 'processing': return '#2196F3'; // blue
			case 'shipped': return '#9C27B0'; // purple
			case 'delivered': return '#4CAF50'; // green
			case 'cancelled': return '#F44336'; // red
			default: return '#757575'; // grey
		}
	};

	return (
		<div className="order-history" style={{ marginTop: '160px' }}>
			<h1>Your Order History</h1>

			{loading ? (
				<p>Loading your orders...</p>
			) : error ? (
				<p className="error-message">{error}</p>
			) : orders.length === 0 ? (
				<div className="empty-state">
					<p>You haven't placed any orders yet.</p>
					<button
						onClick={() => window.location.href = '/shop'}
						className="shop-now-btn"
					>
						Shop Now
					</button>
				</div>
			) : (
				<div className="orders-container" style={{ width: "100%" }}>
					{orders.map((order) => (
						<div key={order._id} className="order-card">
							<div className="order-header" style={{ width: "100%" }}>
								<div>
									<h3>Order #{order._id.slice(-6)}</h3>
									<p className="order-date">{formatDate(order.createdAt)}</p>
								</div>
								<div
									className="status-badge"
									style={{ backgroundColor: getStatusColor(order.orderStatus) }}
								>
									{order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
								</div>
							</div>

							<div className="order-items">
								<h3>Items</h3>
								<h4>Retailer: {order.retailer.BusinessName}</h4>
								{order.items.map((item, index) => (
									<div key={index} className="order-item">
										<div className="item-image">
											{item.image ? (
												<img
													src={getImageUrl(item.image)}
													alt={item.name}
													onError={(e) => {
														e.target.onerror = null;
														e.target.src = '/placeholder-image.png';
													}}
												/>
											) : (
												<img
													src={img}
													alt={item.name}
												/>
											)}
										</div>
										<div className="item-details">
											<p className="item-name">{item.medicineId.name}</p>
											<p className="item-price">
												₹{(Number(item.medicineId.price) || 0).toFixed(2)} × {item.quantity}
											</p>
											<p className="item-subtotal">
												Subtotal: ₹{(Number(item.subTotal) || 0).toFixed(2)}
											</p>
										</div>
									</div>
								))}
							</div>

							<div className="order-footer" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
								<div className="payment-info">
									<p><strong>Payment Method:</strong> {order.paymentMethod === 'cashOnDelivery' ? 'Cash On Delivery' : 'Online Payment'}</p>
									<p><strong>Payment Status:</strong> {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}</p>
								</div>
								<div className="order-total">
									<p><strong>Total Amount:</strong> ${(Number(order.totalPrice) || 0).toFixed(2)}</p>
								</div>
								{order.orderStatus.toLowerCase() === "delivered" && order.review && (
									<div
										className="order-feedback"
										style={{
											marginTop: "10px",
											padding: "10px",
											borderTop: "1px solid #ccc",
											width: "100%",
											display: "flex",
											flexDirection: "column",
											justifyContent: "center",
											alignItems: "center",
											textAlign: "center",
										}}
									>
										<h4>Customer Feedback</h4>

										{/* Display star icons */}
										<div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
											{[1, 2, 3, 4, 5].map((i) => (
												<Star
													key={i}
													size={16}
													color={i <= order.review.rating ? "#FFD700" : "#ccc"}
												/>
											))}
											
										</div>

										{order.review.comment && (
											<p style={{ marginTop: "5px" }}>
											 {order.review.comment}
											</p>
										)}
										{order.review.deliveredAt && (
											<p style={{ marginTop: "5px" }}>
												<strong>Delivered On:</strong>{" "}
												{new Date(order.review.deliveredAt).toLocaleDateString()}
											</p>
										)}
									</div>
								)}
								<div className="order-total">
									<div className="order-total">
										{order.orderStatus.toLowerCase() === "shipped" && (
											<button
												className="bf-btn-primary"
												onClick={() => navigate(`/BuyerFeedback/${order._id}`)}
											>
												Update Order Status
											</button>
										)}

										{order.orderStatus.toLowerCase() === "delivered" && (
											<button
												className="bf-btn-primary"
												onClick={() => navigate(`/BuyerFeedback/${order._id}`)}
											>
												Update Feedback
											</button>
										)}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default OrderHistory;