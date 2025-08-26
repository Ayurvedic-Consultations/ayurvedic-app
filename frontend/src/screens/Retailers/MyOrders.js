import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import "./MyOrders.css";
import { AuthContext } from "../../context/AuthContext";

function MyOrders() {
	const [orders, setOrders] = useState([]);
	const [status, setStatus] = useState("received");
	const { auth } = useContext(AuthContext); // Access auth context
	const retailerId = auth?.user?.id;

	useEffect(() => {
		const fetchOrders = async () => {
			try {
				const response = await axios.get(
					`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/orders/user`,
					{
						params: { retailerId },
						headers: { Authorization: `Bearer ${auth.token}` },
					}
				);
				setOrders(response.data);
			} catch (error) {
				console.error("Error fetching orders:", error);
			}
		};

		if (retailerId) fetchOrders();
	}, [retailerId]);

	const updateOrderStatus = async (orderId, newStatus) => {
		try {
			await axios.patch(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/orders/status`, {
				orderId,
				status: newStatus,
			});
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
		<div className="orders-container">
			<h1>My Orders</h1>
			<div className="order-tabs">
				<button
					className={status === "received" ? "active" : ""}
					onClick={() => setStatus("received")}
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
				.filter((order) => order.status === status)
				.map((order) => (
					<div key={order._id} className="order-card">
						<p>
							<strong>Buyer Name:</strong>{" "}
							{order.buyer.firstName + " " + order.buyer.lastName}
						</p>
						<p>
							<strong>Item Name:</strong> {order.medicine.name}
						</p>
						<p>
							<strong>Quantity:</strong> {order.quantity}
						</p>
						<p>
							<strong>Status:</strong> {order.status}
						</p>
						{status === "received" && (
							<div className="action-buttons">
								<button
									onClick={() => updateOrderStatus(order._id, "accepted")}
								>
									Accept
								</button>
								<button
									onClick={() => updateOrderStatus(order._id, "rejected")}
								>
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
