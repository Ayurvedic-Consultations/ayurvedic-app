import React, { useEffect } from 'react';
import { Package, CheckCircle2, Truck, AlertTriangle } from 'lucide-react';
import './RetailerOrdersTab.css';

// Helper function to determine the class and icon for a given status
const getStatusBadge = (status) => {
	switch (status.toLowerCase()) {
		case 'delivered':
			return { className: 'status-delivered', Icon: CheckCircle2 };
		case 'shipped':
			return { className: 'status-shipped', Icon: Truck };
		case 'pending':
			return { className: 'status-pending', Icon: AlertTriangle };
		default:
			return { className: 'status-default', Icon: Package };
	}
};

const fetchRetailerOrders = async (retailerId, setOrders, setLoading, setError) => {
	setLoading(true);
	setError(null);
	try {
		const response = await fetch(
			`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/orders/getOrdersByRetailerId/${retailerId}`
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || 'Failed to fetch orders for this retailer.');
		}

		const data = await response.json();
		setOrders(data.orders);
	} catch (error) {
		console.error("❌ Error fetching retailer's orders:", error);
		setError(error.message);
	} finally {
		setLoading(false);
	}
};

const RetailerOrdersTab = ({ retailerId }) => {
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState(null);
	const [orders, setOrders] = React.useState([]);

	useEffect(() => {
		if (retailerId) {
			fetchRetailerOrders(retailerId, setOrders, setLoading, setError);
		}
	}, [retailerId]);

	if (error) {
		return (
			<div className="no-orders-container">
				<Package size={48} className="no-orders-icon" />
				<h3>No Orders Found</h3>
				<p>{error}</p>
			</div>
		);
	}

	if (!orders || orders.length === 0) {
		return (
			<div className="no-orders-container">
				<Package size={48} className="no-orders-icon" />
				<h3>No Orders Found</h3>
				<p>This retailer does not have any order history yet.</p>
			</div>
		);
	}

	return (
		<div className="orders-tab-container">
			<div className="orders-header">
				<h3 className="orders-title">Order History</h3>
				<p className="orders-subtitle">
					Showing all {orders.length} orders placed with this retailer.
				</p>
			</div>
			<div className="orders-table-wrapper">
				<table className="orders-table">
					<thead>
						<tr>
							<th>Order ID</th>
							<th>Customer Name</th>
							<th>Medicine</th>
							<th>Quantity</th>
							<th>Order Date</th>
							<th>Status</th>
							<th>Amount</th>
						</tr>
					</thead>
					<tbody>
						{orders.map((order) => {
							const { className, Icon } = getStatusBadge(order.status);
							return (
								<tr key={order._id}>
									<td data-label="Order ID">
										<span className="order-id">{order._id}</span>
									</td>
									<td data-label="Customer Name">{order.customerName}</td>
									<td data-label="Medicine">{order.medicineName || 'N/A'}</td>
									<td data-label="Quantity">{order.quantity || 'N/A'}</td>
									<td data-label="Order Date">{order.date}</td>
									<td data-label="Status">
										<span className={`status-badge ${className}`}>
											<Icon size={14} />
											{order.status}
										</span>
									</td>
									<td data-label="Amount">
										<span className="order-total">₹{order.total.toLocaleString('en-IN')}</span>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default RetailerOrdersTab;

