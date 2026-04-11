import React, { useState, useEffect } from "react";
import "./PatientFullDetails.css";
import { useNavigate } from "react-router-dom";

const PatientManagement = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await fetch(
                    `${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/patients/getAllPatients`
                );
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

    const filteredPatients = patients.filter(
        (p) =>
            p.firstName?.toLowerCase().includes(search.toLowerCase()) ||
            p.lastName?.toLowerCase().includes(search.toLowerCase()) ||
            p.email?.toLowerCase().includes(search.toLowerCase()) ||
            p.phone?.toLowerCase().includes(search.toLowerCase())
    );

    const handleRowClick = (id) => {
        navigate(`/patients/${id}`);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Prevents navigating to details page
        if (!window.confirm("Are you sure you want to delete this patient?")) return;

        try {
            const res = await fetch(
                `${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/patients/deletePatient/${id}`,
                { method: "DELETE" }
            );

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to delete patient");
            }

            setPatients((prev) => prev.filter((p) => p._id !== id));
            alert("Patient deleted successfully!");
        } catch (error) {
            alert("Error deleting patient: " + error.message);
        }
    };

    const handleEdit = (e, id) => {
        e.stopPropagation(); // Prevents navigating to details page
        alert(`Editing patient with ID: ${id}`);
    };

    if (loading) {
        return <div className="patfull-loader">Loading patients...</div>;
    }

    return (
        <div className="patfull-container">
            <div className="patfull-header">
                <button onClick={() => navigate(-1)} className="patfull-back-btn">
                    ← Back
                </button>
                <h2>Patient Management</h2>
            </div>

            <div className="patfull-search-bar">
                <input
                    type="text"
                    placeholder="Search patients by name, email, or contact..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="patfull-table-wrapper">
                <table className="patfull-table">
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
                                <tr
                                    key={patient._id}
                                    onClick={() => handleRowClick(patient._id)}
                                >
                                    <td>{`${patient.firstName} ${patient.lastName}`}</td>
                                    <td>{patient.email}</td>
                                    <td>{patient.phone}</td>
                                    <td>{patient.gender}</td>
                                    <td>{typeof patient.zipCode === "object" && patient.zipCode !== null ? (patient.zipCode.specific || patient.zipCode.pincode || "Not specified") : (patient.zipCode || "Not specified")}</td>
                                    <td>{patient.age || "N/A"}</td>
                                    <td className="patfull-action-buttons">
                                        <button
                                            className="patfull-edit-btn"
                                            onClick={(e) => handleEdit(e, patient._id)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="patfull-delete-btn"
                                            onClick={(e) => handleDelete(e, patient._id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="patfull-no-patients">
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