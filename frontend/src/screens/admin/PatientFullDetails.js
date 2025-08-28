// PatientFullDetails.js
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import patientsData from "./Patientdata";
import "./PatientFullDetails.css"; // import CSS

function PatientFullDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const patient = patientsData.find((p) => p._id === id);

  if (!patient) {
    return (
      <div className="not-found">
        <h2>Patient not found</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="patient-details-container">
      <h2 className="page-title">Patient Full Details</h2>

      <div className="details-card">
        <table className="details-table">
          <tbody>
            <tr>
              <td><b>Name</b></td>
              <td>{patient.firstName} {patient.lastName}</td>
            </tr>
            <tr>
              <td><b>Email</b></td>
              <td>{patient.email}</td>
            </tr>
            <tr>
              <td><b>Phone</b></td>
              <td>{patient.phone}</td>
            </tr>
            <tr>
              <td><b>Gender</b></td>
              <td>{patient.gender}</td>
            </tr>
            <tr>
              <td><b>Age</b></td>
              <td>{patient.age}</td>
            </tr>
            <tr>
              <td><b>Zip Code</b></td>
              <td>{patient.zipCode}</td>
            </tr>
            <tr>
              <td><b>Address</b></td>
              <td>{patient.address}</td>
            </tr>
            <tr>
              <td><b>Medical History</b></td>
              <td>{(patient.medicalHistory || []).join(", ") || "None"}</td>
            </tr>
            <tr>
              <td><b>Allergies</b></td>
              <td>{(patient.allergies || []).join(", ") || "None"}</td>
            </tr>
            <tr>
              <td><b>Prescriptions</b></td>
              <td>{(patient.prescriptions || []).join(", ") || "None"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <button className="back-btn" onClick={() => navigate(-1)}>
        ⬅ Back to Patients
      </button>
    </div>
  );
}

export default PatientFullDetails;
