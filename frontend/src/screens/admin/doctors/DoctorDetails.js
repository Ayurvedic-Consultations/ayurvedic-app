import React from "react";
import { Briefcase, GraduationCap, CheckCircle2 } from 'lucide-react';
import './DoctorDetails.css'; // Create this CSS file for styling

const DetailsTab = ({ doctor }) => {
  if (!doctor) return null;
  return (
    <div className="card">
      <h3><Briefcase size={20} /> Professional Details</h3>
      <div className="profile-details">
        <div className="detail-item">
          <h4><GraduationCap size={16} /> Education & Certifications</h4>
          <ul>
            {doctor.certifications.length > 0 ? (
              doctor.certifications.map((cert, index) => (
                <li key={index}>• {cert}</li>
              ))
            ) : (
              <li>No certifications listed.</li>
            )}
          </ul>
        </div>
        <div className="detail-item">
          <h4><Briefcase size={16} /> Professional Info</h4>
          <p>
            <span className="label">Specialization:</span> {doctor.specialization}
          </p>
          <p>
            <span className="label">Experience:</span> {doctor.experience} years
          </p>
          <p>
            <span className="label">Location:</span> {doctor.location}
          </p>
          <p>
            {/* <span className="label">License Status:</span>
            <span className="license-status">
              <CheckCircle2 size={16} color="#28a745" /> Active
            </span> */}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DetailsTab;
