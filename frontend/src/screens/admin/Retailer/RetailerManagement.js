import React, { useState, useEffect } from "react";
import "./RetailerManagement.css"; // follow DoctorList.css structure
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

	// ✅ Fetch all retailers
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

	// Filter by search term (safe checks)
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
			retailers.map((r) => (r._id === updatedRetailer._id ? updatedRetailer : r))
		);
		setIsEditModalOpen(false);
		setRetailerToEdit(null);
	};

	if(loadingRetailers) {
		return <p style={{margin:"150px"}}> Loading... </p>;
	}

	return (
		<div className="management-container">
			<div className="header">
				<button onClick={() => navigate(-1)} className="back-btn">
					<ArrowLeft size={18} /> Back
				</button>
				<h2>Retailer Management</h2>
			</div>

			<div className="controls-container">
				<div className="search-bar">
					<Search className="search-icon" size={20} />
					<input
						type="text"
						placeholder="Search by name, business, email, or phone..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
			</div>

			<div className="table-wrapper">
				<table className="management-table">
					<thead>
						<tr>
							<th>
								<div className="th-content">
									<Store size={16} />
									<span>Business Name</span>
								</div>
							</th>
							<th>
								<div className="th-content">
									<span>Status</span>
								</div>
							</th>
							<th>
								<div className="th-content">
									<Mail size={16} />
									<span>Email</span>
								</div>
							</th>
							<th>
								<div className="th-content">
									<Phone size={16} />
									<span>Phone</span>
								</div>
							</th>
							<th>
								<div className="th-content">
									<MapPin size={16} />
									<span>Zip Code</span>
								</div>
							</th>
							<th>
								<div className="th-content">
									<span>Actions</span>
								</div>
							</th>
						</tr>
					</thead>
					<tbody>
						{filteredRetailers.length > 0 ? (
							filteredRetailers.map((retailer) => (
								<tr
									key={retailer._id}
									onClick={() => handleRowClick(retailer._id)}
								>
									<td data-label="Business Name">
										<div className="retailer-name-cell" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
											<div className="avatar-sm">
												{(retailer.BusinessName || retailer.firstName || "?").charAt(0)}
											</div>
											<div>
												{retailer.BusinessName || `${retailer.firstName} ${retailer.lastName}`}
											</div>
										</div>
									</td>
									<td data-label="Status">
										<span
											className={`status-pill ${(retailer.status || "").toLowerCase() === "active"
													? "active"
													: "inactive"
												}`}
										>
											{retailer.status}
										</span>
									</td>
									<td data-label="Email">{retailer.email}</td>
									<td data-label="Phone">{retailer.phone}</td>
									<td data-label="Zip Code">{retailer.zipCode}</td>
									<td data-label="Actions" className="action-buttons">
										<button
											className="edit-btn"
											onClick={(e) => handleEditClick(e, retailer)}
										>
											<Pencil size={16} /> Edit
										</button>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan="6" className="no-results">
									No retailers found matching your criteria.
								</td>
							</tr>
						)}
					</tbody>
				</table>
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
		<div className="modal-overlay">
			<div className="modal-content">
				<div className="modal-header">
					<h3>Edit Retailer Details</h3>
					<button className="close-modal-btn" onClick={onClose}>
						<X size={20} />
					</button>
				</div>
				<form onSubmit={handleSubmit} className="edit-form">
					<div className="form-group">
						<label>Business Name</label>
						<input
							type="text"
							name="BusinessName"
							value={formData.BusinessName}
							onChange={handleChange}
						/>
					</div>
					<div className="form-group">
						<label>Email</label>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
						/>
					</div>
					<div className="form-group">
						<label>Phone</label>
						<input
							type="text"
							name="phone"
							value={formData.phone}
							onChange={handleChange}
						/>
					</div>
					<div className="form-group">
						<label>Status</label>
						<select
							name="status"
							value={formData.status}
							onChange={handleChange}
						>
							<option value="active">Active</option>
							<option value="inactive">Inactive</option>
						</select>
					</div>
					<div className="form-group">
						<label>Zip Code</label>
						<input
							type="text"
							name="zipCode"
							value={formData.zipCode}
							onChange={handleChange}
						/>
					</div>
					<div className="modal-actions">
						<button type="button" className="btn-cancel" onClick={onClose}>
							Cancel
						</button>
						<button type="submit" className="btn-save">
							Save Changes
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default RetailerManagement;
