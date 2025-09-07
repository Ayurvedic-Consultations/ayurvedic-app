import React, { useState, useEffect } from 'react';
import './patientTrans.css'; // Assuming your CSS file is named this
import { ReceiptText, Search } from 'lucide-react';

const Transactions = ({ bookings, patientId }) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [patientOrders, setPatientOrders] = useState([]);
	const [loadingOrders, setLoadingOrders] = useState(true);
	const [transactions, setTransactions] = useState([]);

	// ✅ Fetch all orders for a patient
	useEffect(() => {
		const fetchPatientOrders = async () => {
			try {
				const res = await fetch(
					`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/patients/orders/${patientId}`
				);

				if (!res.ok) {
					if (res.status === 404) {
						setPatientOrders([]); // no orders
						return;
					}
					throw new Error("Failed to fetch patient orders");
				}

				const data = await res.json();
				setPatientOrders(data);
			} catch (error) {
				console.error("❌ Error fetching patient orders:", error);
			} finally {
				setLoadingOrders(false);
			}
		};

		if (patientId) fetchPatientOrders();
	}, [patientId]);


	// 🩺 Map Bookings to Transactions
	const mapBookingsToTransactions = (bookings) => {
		return bookings.map((b) => ({
			id: b._id,
			date: b.dateOfAppointment || b.createdAt,
			doctor: b.doctorName,
			description: `Consultation with ${b.doctorName} (${b.patientIllness})`,
			amount: b.amountPaid,
			type: "consultation"
		}));
	};

	// 💊 Map Orders to Transactions
	const mapOrdersToTransactions = (orders) => {
		return orders.map((o) => ({
			id: o._id,
			date: o.createdAt,
			doctor: `${o.retailers.map(r => r).join(", ")}`,
			description: `Medicine order (${o.items.length} items, ${o.orderStatus})`,
			amount: o.totalPrice,
			type: "medicine"
		}));
	};

	useEffect(() => {
		if (bookings && patientOrders) {
			const allTransactions = [
				...mapBookingsToTransactions(bookings),
				...mapOrdersToTransactions(patientOrders),
			];

			allTransactions.forEach(t => {
				t.dateObj = new Date(t.date); // store Date object for reliable sorting
			});

			// Sort newest → oldest
			allTransactions.sort((a, b) => b.dateObj - a.dateObj);

			setTransactions(allTransactions);
		}
	}, [bookings, patientOrders]);



	const filteredTransactions = transactions.filter((t) => {
		const term = searchTerm.toLowerCase();
		return (
			t.doctor.toLowerCase().includes(term) ||
			t.amount.toString().includes(term) ||
			t.id.toLowerCase().includes(term) ||
			t.type.toLowerCase().includes(term) // also allow search by type
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
						placeholder="Search by Doctor, Amount, or ID..."
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
							<th>Doctor</th>
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
									<td className="doctor-name">{t.doctor}</td>
									<td>
										{t.description}
										<span className={`badge ${t.type}`}>
											{t.type === "consultation" ? "Consultation" : "Medicine"}
										</span>
									</td>
									<td className="transaction-amount">
										₹{t.amount.toLocaleString("en-IN")}
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