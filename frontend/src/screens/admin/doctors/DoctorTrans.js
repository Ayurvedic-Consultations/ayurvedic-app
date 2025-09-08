import React, { useState, useEffect } from 'react';
import { ReceiptText, Search } from 'lucide-react';
// import './doctorTrans.css'; // add CSS if needed

const Transactions = ({ doctorId }) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [orders, setOrders] = useState([]);
	const [loadingOrders, setLoadingOrders] = useState(true);
	const [doctorBookings, setDoctorBookings] = useState([]);
	const [loadingBookings, setLoadingBookings] = useState(true);
	const [transactions, setTransactions] = useState([]);

	// ✅ Fetch all orders associated with this doctor
	useEffect(() => {
		const fetchOrders = async () => {
			try {
				const res = await fetch(
					`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/orders/getOrdersByBuyerId/${doctorId}`
				);

				if (!res.ok) {
					if (res.status === 404) {
						setOrders([]);
						return;
					}
					throw new Error('Failed to fetch doctor orders');
				}

				const data = await res.json();
				setOrders(data.orders || []);
				console.log(data.orders);
			} catch (error) {
				console.error('❌ Error fetching doctor orders:', error);
			} finally {
				setLoadingOrders(false);
			}
		};

		if (doctorId) fetchOrders();
	}, [doctorId]);

	// ✅ Fetch all bookings for this doctor
	useEffect(() => {
		const fetchDoctorBookings = async () => {
			try {
				const res = await fetch(
					`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/bookings/doctor/${doctorId}`
				);

				if (!res.ok) {
					if (res.status === 404) {
						setDoctorBookings([]);
						return;
					}
					throw new Error('Failed to fetch doctor bookings');
				}

				const data = await res.json();
				setDoctorBookings(data.bookings || []);
			} catch (error) {
				console.error('❌ Error fetching doctor bookings:', error);
			} finally {
				setLoadingBookings(false);
			}
		};

		if (doctorId) fetchDoctorBookings();
	}, [doctorId]);

	// 🩺 Map Bookings to Transactions
	const mapBookingsToTransactions = (bookings) => {
		return bookings.map((b) => ({
			id: b._id,
			date: b.dateOfAppointment || b.createdAt,
			patient: b.patientName,
			description: `Consultation with ${b.patientName} (${b.patientIllness})`,
			amount: b.amountPaid,
			type: 'consultation',
		}));
	};

	// 💊 Map Orders to Transactions
	const mapOrdersToTransactions = (orders) => {
		return orders.map((o) => ({
			id: o._id,
			date: o.createdAt,
			patient: `${o.retailers.length > 0 ? o.retailers.join(', ') : "Pharmacy"}`, 
			description: `Medicine order (${o.items?.length || 0} items, ${o.orderStatus})`,
			amount: o.totalPrice,
			type: 'medicine',
		}));
	};

	// ✅ Combine and sort all transactions
	useEffect(() => {
		if (!loadingBookings && !loadingOrders) {
			const allTransactions = [
				...mapBookingsToTransactions(doctorBookings),
				...mapOrdersToTransactions(orders),
			];

			allTransactions.forEach((t) => {
				t.dateObj = new Date(t.date);
			});

			allTransactions.sort((a, b) => b.dateObj - a.dateObj);
			setTransactions(allTransactions);
		}
	}, [doctorBookings, orders, loadingBookings, loadingOrders]);

	// 🔍 Search filter
	const filteredTransactions = transactions.filter((t) => {
		const term = searchTerm.toLowerCase();
		return (
			t.patient?.toLowerCase().includes(term) ||
			t.amount?.toString().includes(term) ||
			t.id?.toLowerCase().includes(term) ||
			t.type?.toLowerCase().includes(term)
		);
	});

	return (
		<div className="card transaction-card">
			<div className="transaction-header">
				<h3>
					<ReceiptText size={20} /> Transaction History
				</h3>
				<div className="search-container">
					<Search size={18} className="search-icon" />
					<input
						type="text"
						placeholder="Search by Patient, Amount, or ID..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
			</div>

			<div className="transaction-table-container">
				<table className="transaction-table">
					<thead>
						<tr>
							<th>Transaction ID</th>
							<th>Date</th>
							<th>Patient</th>
							<th>Description</th>
							<th>Amount Paid</th>
						</tr>
					</thead>
					<tbody>
						{filteredTransactions.length > 0 ? (
							filteredTransactions.map((t) => (
								<tr key={t.id}>
									<td className="transaction-id">{t.id}</td>
									<td>{new Date(t.date).toLocaleDateString()}</td>
									<td className="patient-name">{t.patient || 'N/A'}</td>
									<td>
										{t.description}{' '}
										<span className={`badge ${t.type}`}>
											{t.type === 'consultation' ? 'Consultation' : 'Medicine'}
										</span>
									</td>
									<td className="transaction-amount">
										₹{t.amount?.toLocaleString('en-IN') || 0}
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan="5" className="no-results">
									No transactions found.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default Transactions;
