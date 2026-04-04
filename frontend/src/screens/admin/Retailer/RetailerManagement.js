import React, { useState, useEffect } from "react";
import "./RetailerManagement.css";
import { useNavigate } from "react-router-dom";
import {
	Store,
	Mail,
	Phone,
	MapPin,
	Search,
	ArrowLeft,
	Pencil,
	X,
} from "lucide-react";
const initialRetailersData = [
	{
		_id: "dummy1",
		BusinessName: "Loading...",
		firstName: "Test",
		lastName: "Retailer",
		email: "loading@example.com",
		phone: "0000000000",
		status: "active",
		zipCode: "123456",
	},
];
const RetailerManagement = () => {
	const [retailers, setRetailers] = useState(initialRetailersData);
	const [loadingRetailers, setLoadingRetailers] = useState(true);
	const [search, setSearch] = useState("");
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [retailerToEdit, setRetailerToEdit] = useState(null);
	const navigate = useNavigate();
	useEffect(() => {
		const fetchAllRetailers = async () => {
			try {
				const res = await fetch(
					`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/retailers/getAllRetailers`
				);
				if (!res.ok) {
					if (res.status === 404) {
						setRetailers([]);
						return;
					}
					throw new Error("Failed to fetch retailers");
				}
				const data = await res.json();
				setRetailers(data);
			} catch (error) {
				console.error("❌ Error fetching retailers:", error);
			} finally {
				setLoadingRetailers(false);
			}
		};
		fetchAllRetailers();
	}, []);
	const filteredRetailers = retailers.filter((r) => {
		const term = search.toLowerCase();
		return (
			(r.firstName || "").toLowerCase().includes(term) ||
			(r.lastName || "").toLowerCase().includes(term) ||
			(r.BusinessName || "").toLowerCase().includes(term) ||
			(r.email || "").toLowerCase().includes(term) ||
			(r.phone || "").includes(term) ||
			(r.zipCode || "").includes(term)
		);
	});
	const handleRowClick = (_id) => navigate(`/admin/medicine-orders/${_id}`);
	const handleEditClick = (e, retailer) => {
		e.stopPropagation();
		setRetailerToEdit(retailer);
		setIsEditModalOpen(true);
	};
	const handleSaveChanges = (updatedRetailer) => {
		setRetailers(
			retailers.map((r) =>
				r._id === updatedRetailer._id ? updatedRetailer : r
			)
		);
		setIsEditModalOpen(false);
		setRetailerToEdit(null);
	};
	if (loadingRetailers) {
		return <div className="rm-loading-state">Loading Retailers...</div>;
	}
	return (
		<div className="rm-management-container">
			<div className="rm-header">
				<button onClick={() => navigate(-1)} className="rm-back-btn">
					<ArrowLeft size={18} /> Back
				</button>
				<h2>Retailer Management</h2>
			</div>
			<div className="rm-controls-container">
				<div className="rm-search-bar">
					<Search className="rm-search-icon" size={20} />
					<input
						type="text"
						placeholder="Search by name, business, email, or phone..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
			</div>
			<div className="rm-table-wrapper">
				<div className="rm-table-scroll-container">
					<table className="rm-management-table">
						<thead>
							<tr>
								<th>
									<div className="rm-th-content">
										<Store size={16} />
										<span>Business Name</span>
									</div>
								</th>
								<th>
									<div className="rm-th-content">
										<span>Status</span>
									</div>
								</th>
								<th>
									<div className="rm-th-content">
										<Mail size={16} />
										<span>Email</span>
									</div>
								</th>
								<th>
									<div className="rm-th-content">
										<Phone size={16} />
										<span>Phone</span>
									</div>
								</th>
								<th>
									<div className="rm-th-content">
										<MapPin size={16} />
										<span>Zip Code</span>
									</div>
								</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{filteredRetailers.length > 0 ? (
								filteredRetailers.map((retailer) => (
									<tr
										key={retailer._id}
										onClick={() => handleRowClick(retailer._id)}
									>
										<td>
											<div className="rm-retailer-name-cell">
												<div className="rm-avatar-sm">
													{(
														retailer.BusinessName ||
														retailer.firstName ||
														"?"
													).charAt(0)}
												</div>
												<div>
													{retailer.BusinessName ||
														`${retailer.firstName} ${retailer.lastName}`}
												</div>
											</div>
										</td>
										<td>
											<span
												className={`rm-status-pill ${(retailer.status || "").toLowerCase() === "active"
														? "rm-active"
														: "rm-inactive"
													}`}
											>
												{retailer.status}
											</span>
										</td>
										<td>{retailer.email}</td>
										<td>{retailer.phone}</td>
										<td>{retailer.zipCode}</td>
										<td>
											<button
												className="rm-edit-btn"
												onClick={(e) => handleEditClick(e, retailer)}
											>
												<Pencil size={16} /> Edit
											</button>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan="6" className="rm-no-results">
										No retailers found matching your criteria.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
			{retailerToEdit && (
				<EditModal
					isOpen={isEditModalOpen}
					onClose={() => setIsEditModalOpen(false)}
					retailer={retailerToEdit}
					onSave={handleSaveChanges}
				/>
			)}
		</div>
	);
};
const EditModal = ({ isOpen, onClose, retailer, onSave }) => {
	const [formData, setFormData] = useState(retailer);
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};
	const handleSubmit = (e) => {
		e.preventDefault();
		onSave(formData);
	};
	if (!isOpen) return null;
	return (
		<div className="rm-modal-overlay">
			<div className="rm-modal-content">
				<div className="rm-modal-header">
					<h3>Edit Retailer Details</h3>
					<button className="rm-close-modal-btn" onClick={onClose} aria-label="Close">
						<X size={20} />
					</button>
				</div>
				<form onSubmit={handleSubmit} className="rm-edit-form">
					<div className="rm-form-grid">
						<div className="rm-form-group full-width">
							<label>Business Name</label>
							<input
								type="text"
								name="BusinessName"
								value={formData.BusinessName}
								onChange={handleChange}
							/>
						</div>
						<div className="rm-form-group">
							<label>Email</label>
							<input
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
							/>
						</div>
						<div className="rm-form-group">
							<label>Phone</label>
							<input
								type="text"
								name="phone"
								value={formData.phone}
								onChange={handleChange}
							/>
						</div>
						<div className="rm-form-group">
							<label>Status</label>
							<div className="rm-select-wrapper">
								<select
									name="status"
									value={formData.status}
									onChange={handleChange}
								>
									<option value="active">Active</option>
									<option value="inactive">Inactive</option>
								</select>
							</div>
						</div>
						<div className="rm-form-group">
							<label>Zip Code</label>
							<input
								type="text"
								name="zipCode"
								value={formData.zipCode}
								onChange={handleChange}
							/>
						</div>
					</div>
					<div className="rm-modal-footer">
						<div className="rm-modal-actions">
							<button
								type="button"
								className="rm-btn-cancel"
								onClick={onClose}
							>
								Cancel
							</button>
							<button type="submit" className="rm-btn-save">
								Save Changes
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};
export default RetailerManagement;