import React, { useState } from "react";
import "./PatientFullDetails.css";
import { useNavigate } from "react-router-dom";

const PatientManagement = () => {
  const [patients, setPatients] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      contact: "+1 (555) 123-4567",
      gender: "Female",
      prescriptions: 2,
      dietPlan: true,
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.chen@email.com",
      contact: "+1 (555) 234-5678",
      gender: "Male",
      prescriptions: 1,
      dietPlan: false,
    },
    {
      id: 3,
      name: "Emily Davis",
      email: "emily.davis@email.com",
      contact: "+1 (555) 345-6789",
      gender: "Female",
      prescriptions: 3,
      dietPlan: true,
    },
  ]);

  const [search, setSearch] = useState("");

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.contact.toLowerCase().includes(search.toLowerCase())
  );

  const navigate = useNavigate();
    // Row click → go to details page
  const handleRowClick = (id) => {
    navigate(`/patients/${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      setPatients(patients.filter((patient) => patient.id !== id));
    }
  };

  const handleEdit = (id) => {
    alert(`Editing patient with ID: ${id}`);
    // In a real application, you would navigate to an edit page or open a modal
  };

  const backToPatients = () => {
    navigate(-1); // Adjust the path as needed
  };

  return (
    <div className="patient-container">
      <div className="header">
        <button onClick={backToPatients} className="back-btn">← Back</button>
        <h2>Patient Management</h2>
      </div>

      <div className="search-bar">
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
              <th>Prescriptions</th>
              <th>Diet Plan</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <tr key={patient.id}
              
                  onClick={() => handleRowClick(patient.id)}
                  style={{ cursor: "pointer" }}
                
                
                >
                  <td data-label="Name">{patient.name}</td>
                  <td data-label="Email">{patient.email}</td>
                  <td data-label="Contact No.">{patient.contact}</td>
                  <td data-label="Gender">{patient.gender}</td>
                  <td data-label="Prescriptions">{patient.prescriptions}</td>
                  <td data-label="Diet Plan">
                    {patient.dietPlan ? "Yes" : "No"}
                  </td>
                  <td data-label="Actions" className="action-buttons">
                    <button className="edit-btn" onClick={() => handleEdit(patient.id)}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(patient.id)}>
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