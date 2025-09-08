import React, { useState, useEffect } from "react";
import "./PatientFullDetails.css";
import { useNavigate } from "react-router-dom";

const PatientManagement = () => {
	const [patients, setPatients] = useState([
		{
			id: 3,
			firstName: "Emily",
			lastName: "Davis",
			email: "emily.davis@email.com",
			phone: "+1 (555) 345-6789",
			gender: "Female",
			zipCode: 312544,
			dietPlan: true,
		},
	]);

	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchPatients = async () => {
			try {
				const res = await fetch(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/patients/getAllPatients`);
				if (!res.ok) throw new Error("Failed to fetch patients");
				const data = await res.json();
				setPatients(data);
			} catch (error) {
				console.error("Error fetching patients:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchPatients();
	}, []);

	const [search, setSearch] = useState("");
	const filteredPatients = patients.filter(
		(p) =>
			p.firstName?.toLowerCase().includes(search.toLowerCase()) ||
			p.lastName?.toLowerCase().includes(search.toLowerCase()) ||
			p.email?.toLowerCase().includes(search.toLowerCase()) ||
			p.phone?.toLowerCase().includes(search.toLowerCase())
	);

	const navigate = useNavigate();
	// Row click → go to details page
	
	const handleRowClick = (id) => {
		navigate(`/patients/${id}`);
	};

	const handleDelete = async (id) => {
		if (!window.confirm("Are you sure you want to delete this patient?")) return;

		try {
			const res = await fetch(
				`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/patients/deletePatient/${id}`,
				{
					method: "DELETE",
				}
			);

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.message || "Failed to delete patient");
			}

			// Remove from local state so UI updates
			setPatients((prevPatients) => prevPatients.filter((p) => p._id !== id));

			alert("Patient deleted successfully!");
		} catch (error) {
			console.error("Error deleting patient:", error);
			alert("Error deleting patient: " + error.message);
		}
	};

	const handleEdit = (id) => {
		alert(`Editing patient with ID: ${id}`);
	};

	const backToPatients = () => {
		navigate(-1); // Adjust the path as needed
	};

	if (loading) {
		return <p style={{ marginTop: "150px" }}>Loading patients...</p>;
	}

	return (
		<div className="patient-container">
			<div className="header">
				<button onClick={backToPatients} className="back-btn">← Back</button>
				<h2>Patient Management</h2>
			</div>

			<div className="data-search-bar">
				<input
					type="text"
					placeholder="Search patients by name, email, or contact..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
			</div>

			<div className="table-wrapper">
				<table className="patient-table">
					<thead>
						<tr>
							<th>Name</th>
							<th>Email</th>
							<th>Contact No.</th>
							<th>Gender</th>
							<th>ZipCode</th>
							<th>Age</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{filteredPatients.length > 0 ? (
							filteredPatients.map((patient) => (
								<tr key={patient._id}
									onClick={() => handleRowClick(patient._id)}
									style={{ cursor: "pointer" }}
								>
									<td data-label="Name">{`${patient.firstName} ${patient.lastName}`}</td>
									<td data-label="Email">{patient.email}</td>
									<td data-label="Contact No.">{patient.phone}</td>
									<td data-label="Gender">{patient.gender}</td>
									<td data-label="ZipCode">{patient.zipCode}</td>
									<td data-label="Age">{patient.age}</td>
									<td data-label="Actions" className="action-buttons">
										<button className="edit-btn" onClick={() => handleEdit(patient._id)}>
											Edit
										</button>
										<button className="delete-btn" onClick={() => handleDelete(patient._id)}>
											Delete
										</button>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan="7" className="no-patients">
									No patients found matching your search.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default PatientManagement;