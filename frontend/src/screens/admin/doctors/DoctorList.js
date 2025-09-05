import React, { useState } from "react";
import "./DoctorList.css"; // Using the same professional CSS
import { useNavigate } from "react-router-dom";
import {
	User,
	Mail,
	Phone,
	Stethoscope,
	Trash2,
	Pencil,
	Search,
	ArrowLeft,
	X,
	MapPin,
	Award,
} from "lucide-react";

// Dummy data updated with location and experience
const initialDoctorsData = [
	{
		id: 1,
		name: "Dr. Evelyn Reed",
		email: "evelyn.reed@clinic.com",
		contact: "+1 (555) 0101",
		specialization: "Cardiology",
		experience: 15,
		location: "Wellness City",
		patientsAssigned: 12,
	},
	{
		id: 2,
		name: "Dr. Marcus Thorne",
		email: "marcus.thorne@clinic.com",
		contact: "+1 (555) 0102",
		specialization: "Neurology",
		experience: 12,
		location: "Central Hospital",
		patientsAssigned: 8,
	},
	{
		id: 3,
		name: "Dr. Samuel Chen",
		email: "samuel.chen@clinic.com",
		contact: "+1 (555) 0103",
		specialization: "Pediatrics",
		experience: 10,
		location: "Green Valley Clinic",
		patientsAssigned: 25,
	},
	{
		id: 4,
		name: "Dr. Anya Sharma",
		email: "anya.sharma@clinic.com",
		contact: "+1 (555) 0104",
		specialization: "Cardiology",
		experience: 8,
		location: "Wellness City",
		patientsAssigned: 15,
	},
];

const DoctorManagement = () => {
	const [doctors, setDoctors] = useState(initialDoctorsData);
	const [search, setSearch] = useState("");
	const [specializationFilter, setSpecializationFilter] = useState("All");

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [doctorToDelete, setDoctorToDelete] = useState(null);

	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [doctorToEdit, setDoctorToEdit] = useState(null);

	const navigate = useNavigate();

	// Combined filter logic for search and specialization
	const filteredDoctors = doctors.filter((d) => {
		const matchesSearch =
			d.name.toLowerCase().includes(search.toLowerCase()) ||
			d.email.toLowerCase().includes(search.toLowerCase()) ||
			d.specialization.toLowerCase().includes(search.toLowerCase());

		const matchesFilter =
			specializationFilter === "All" ||
			d.specialization === specializationFilter;

		return matchesSearch && matchesFilter;
	});

	const handleRowClick = (id) => navigate(`/admin/consultations/${id}`);

	// --- Delete Modal Logic ---
	//   const handleDeleteClick = (e, id) => {
	//     e.stopPropagation();
	//     setDoctorToDelete(id);
	//     setIsDeleteModalOpen(true);
	//   };

	//   const confirmDelete = () => {
	//     setDoctors(doctors.filter((doctor) => doctor.id !== doctorToDelete));
	//     setIsDeleteModalOpen(false);
	//     setDoctorToDelete(null);
	//   };

	// --- Edit Modal Logic ---
	const handleEditClick = (e, doctor) => {
		e.stopPropagation();
		setDoctorToEdit(doctor);
		setIsEditModalOpen(true);
	};

	const handleSaveChanges = (updatedDoctor) => {
		setDoctors(
			doctors.map((doc) => (doc.id === updatedDoctor.id ? updatedDoctor : doc))
		);
		setIsEditModalOpen(false);
		setDoctorToEdit(null);
	};

	const uniqueSpecializations = [
		"All",
		...new Set(initialDoctorsData.map((d) => d.specialization)),
	];

	return (
		<div className="management-container">
			<div className="header">
				<button onClick={() => navigate(-1)} className="back-btn">
					<ArrowLeft size={18} /> Back
				</button>
				<h2>Doctor Management</h2>
			</div>

			<div className="controls-container">
				<div className="search-bar">
					<Search className="search-icon" size={30} />
					<input
						type="text"
						placeholder="Search by name, email, or specialization..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
					<div className="filter-wrapper">
						<Stethoscope size={20} className="filter-icon" />
						<select
							className="specialization-filter"
							value={specializationFilter}
							onChange={(e) => setSpecializationFilter(e.target.value)}
						>
							{uniqueSpecializations.map((spec) => (
								<option key={spec} value={spec}>
									{spec}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			<div className="table-wrapper">
				<table className="management-table">
					<thead>
						<tr>
							<th>
								<div className="th-content">
									<User size={16} />
									<span>Name</span>
								</div>
							</th>
							<th>
								<div className="th-content">
									<Stethoscope size={16} />
									<span>Specialization</span>
								</div>
							</th>
							<th>
								<div className="th-content">
									<Award size={16} />
									<span>Experience</span>
								</div>
							</th>
							<th>
								<div className="th-content">
									<MapPin size={16} />
									<span>Location</span>
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
						{filteredDoctors.length > 0 ? (
							filteredDoctors.map((doctor) => (
								<tr key={doctor.id} onClick={() => handleRowClick(doctor.id)}>
									<td data-label="Name">
										<div className="doctor-name-cell">
											<div className="avatar-sm">{doctor.name.charAt(4)}</div>
											<div>
												{doctor.name}
												<div className="doctor-email">{doctor.email}</div>
											</div>
										</div>
									</td>
									<td data-label="Specialization">{doctor.specialization}</td>
									<td data-label="Experience">{doctor.experience} years</td>
									<td data-label="Location">{doctor.location}</td>
									<td data-label="Actions" className="action-buttons">
										<button
											className="edit-btn"
											onClick={(e) => handleEditClick(e, doctor)}
										>
											<Pencil size={16} /> Edit
										</button>
										{/* <button className="delete-btn" onClick={(e) => handleDeleteClick(e, doctor.id)}>
                      <Trash2 size={16} /> Delete
                    </button> */}
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan="5" className="no-results">
									No doctors found matching your criteria.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* <DeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      /> */}

			{doctorToEdit && (
				<EditModal
					isOpen={isEditModalOpen}
					onClose={() => setIsEditModalOpen(false)}
					doctor={doctorToEdit}
					onSave={handleSaveChanges}
				/>
			)}
		</div>
	);
};

// Reusable Delete Modal Component
// const DeleteModal = ({ isOpen, onClose, onConfirm }) => {
//     if (!isOpen) return null;
//     return (
//         <div className="modal-overlay">
//           <div className="modal-content">
//             <button className="close-modal-btn" onClick={onClose}><X size={24} /></button>
//             <h3>Confirm Deletion</h3>
//             <p>Are you sure you want to delete this doctor? This action cannot be undone.</p>
//             <div className="modal-actions">
//               <button className="btn-cancel" onClick={onClose}>Cancel</button>
//               <button className="btn-confirm-delete" onClick={onConfirm}>Delete</button>
//             </div>
//           </div>
//         </div>
//     );
// };

// Reusable Edit Modal Component
const EditModal = ({ isOpen, onClose, doctor, onSave }) => {
	const [formData, setFormData] = useState(doctor);

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
					<h3>Edit Doctor Details</h3>
					<button className="close-modal-btn" onClick={onClose}>
						<X size={20} />
					</button>
				</div>
				<form onSubmit={handleSubmit} className="edit-form">
					<div className="form-group">
						<label>Name</label>
						<input
							type="text"
							name="name"
							value={formData.name}
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
					<div className="form-row">
						<div className="form-group">
							<label>Specialization</label>
							<input
								type="text"
								name="specialization"
								value={formData.specialization}
								onChange={handleChange}
							/>
						</div>
						<div className="form-group">
							<label>Experience (yrs)</label>
							<input
								type="number"
								name="experience"
								value={formData.experience}
								onChange={handleChange}
							/>
						</div>
					</div>
					<div className="form-group">
						<label>Location</label>
						<input
							type="text"
							name="location"
							value={formData.location}
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

export default DoctorManagement;
