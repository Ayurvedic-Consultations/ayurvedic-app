import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import "./MyOrders.css";
import { AuthContext } from "../../context/AuthContext";

function MyOrders() {
	const [orders, setOrders] = useState([]);
	const [status, setStatus] = useState("pending" || "delivered" || "accepted" || "rejected" || "shipped");
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
			await axios.post(
				`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/orders/status`,
				{
					orderId,
					status: newStatus,
				},
				{
					headers: { Authorization: `Bearer ${auth.token}` },
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
		<div
			className="myorders-container"
			style={{ marginTop: "175px", padding: "15px", borderRadius: "15px" }}
		>
			<h1>My Orders</h1>

			<div className="myorders-tabs">
				<button
					className={status === "pending" ? "myorders-active" : ""}
					onClick={() => setStatus("pending")}
				>
					Received
				</button>
				<button
					className={status === "accepted" ? "myorders-active" : ""}
					onClick={() => setStatus("accepted")}
				>
					Accepted
				</button>
				<button
					className={status === "delivered" ? "myorders-active" : ""}
					onClick={() => setStatus("delivered")}
				>
					Delivered
				</button>
				<button
					className={status === "shipped" ? "myorders-active" : ""}
					onClick={() => setStatus("shipped")}
				>
					Shipped
				</button>
				<button
					className={status === "rejected" ? "myorders-active" : ""}
					onClick={() => setStatus("rejected")}
				>
					Rejected
				</button>
			</div>

			{orders
				.filter((order) => order.status === status)
				.map((order) => (
					<div key={order._id} className="myorders-card">
						<p>
							<strong>Buyer Name:</strong> {order.customerName}
						</p>
						<p>
							<strong>Order Recieving Date:</strong>{" "}
							{new Date(order.date).toLocaleDateString()}
						</p>

						<p>
							<strong>Shipping Address:</strong>{" "}
							{order.shippingAddress
								? `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`
								: "N/A"}
						</p>

						<p>
							<strong>Items:</strong>
						</p>

						<table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
							<thead>
								<tr>
									<th style={{ border: "1px solid #ccc", padding: "6px" }}>Medicine</th>
									<th style={{ border: "1px solid #ccc", padding: "6px" }}>Unit Price</th>
									<th style={{ border: "1px solid #ccc", padding: "6px" }}>Quantity</th>
									<th style={{ border: "1px solid #ccc", padding: "6px" }}>Subtotal</th>
								</tr>
							</thead>
							<tbody>
								{order.items.map((item, idx) => (
									<tr key={idx}>
										<td style={{ border: "1px solid #ccc", padding: "6px" }}>{item.medicineName}</td>
										<td style={{ border: "1px solid #ccc", padding: "6px" }}>{item.unitPrice}</td>
										<td style={{ border: "1px solid #ccc", padding: "6px" }}>{item.quantity}</td>
										<td style={{ border: "1px solid #ccc", padding: "6px" }}>{item.subTotal}</td>
									</tr>
								))}
							</tbody>
						</table>

						<p>
							<strong>Order Total:</strong> {order.orderTotal}
						</p>
						<p>
							<strong>Status:</strong> {order.status}
						</p>

						<div className="myorders-actions">
							{(status === "pending" || "accepted") && "Update Status:"}

							{status === "pending" && (
								<button onClick={() => updateOrderStatus(order._id, "accepted")}>
									Accept
								</button>
							)}

							{status === "pending" && (
								<button onClick={() => updateOrderStatus(order._id, "rejected")}>
									Reject
								</button>
							)}

							{status === "accepted" && (
								<button onClick={() => updateOrderStatus(order._id, "shipped")}>
									Shipped
								</button>
							)}
						</div>
					</div>
				))}
		</div>
	);
}

export default MyOrders;
