import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import "./MyOrders.css";
import { AuthContext } from "../../context/AuthContext";

function MyOrders() {
	const [orders, setOrders] = useState([]);
	const [status, setStatus] = useState("pending"); // backend uses "pending" not "received"
	const { auth } = useContext(AuthContext);
	const retailerId = auth?.user?.id;

	useEffect(() => {
		const fetchOrders = async () => {
			try {
				const response = await axios.get(
					`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/orders/getOrdersByRetailerId/${retailerId}`,
					{
						headers: { Authorization: `Bearer ${auth.token}` },
					}
				);
				// backend sends { message, orders: [...] }
				setOrders(response.data.orders || []);
				console.log(response.data.orders);
			} catch (error) {
				console.error("Error fetching orders:", error);
			}
		};

		if (retailerId) fetchOrders();
	}, [retailerId, auth.token]);

	const updateOrderStatus = async (orderId, newStatus) => {
		try {
			await axios.patch(
				`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/orders/status`,
				{
					orderId,
					status: newStatus,
				}
			);
			setOrders((prevOrders) =>
				prevOrders.map((order) =>
					order._id === orderId ? { ...order, status: newStatus } : order
				)
			);
		} catch (error) {
			console.error("Error updating order status:", error);
		}
	};

	return (
		<div className="orders-container" style={{marginTop:"175px", padding:"15px", borderRadius:"15px"}}>
			<h1>My Orders</h1>
			<div className="order-tabs">
				<button
					className={status === "pending" ? "active" : ""}
					onClick={() => setStatus("pending")}
				>
					Received
				</button>
				<button
					className={status === "accepted" ? "active" : ""}
					onClick={() => setStatus("accepted")}
				>
					Accepted
				</button>
			</div>
			{orders
				.filter((order) => (order.status === "all") || (order.status === "delivered") || (order.status))
				.map((order) => (
					<div key={order._id} className="order-card">
						<p>
							<strong>Buyer Name:</strong> {order.customerName}
						</p>
						<p>
							<strong>Date:</strong> {order.date}
						</p>
						<p>
							<strong>Item Name:</strong> {order.medicineName}
						</p>
						<p>
							<strong>Quantity:</strong> {order.quantity}
						</p>
						<p>
							<strong>Status:</strong> {order.status}
						</p>
						{status === "pending" && (
							<div className="action-buttons">
								<button onClick={() => updateOrderStatus(order._id, "accepted")}>
									Accept
								</button>
								<button onClick={() => updateOrderStatus(order._id, "rejected")}>
									Reject
								</button>
							</div>
						)}
					</div>
				))}
		</div>
	);
}

export default MyOrders;
