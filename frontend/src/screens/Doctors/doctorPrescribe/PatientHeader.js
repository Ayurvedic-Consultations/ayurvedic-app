import React from 'react';
import { Mail, Phone, User, MapPin, Calendar, Heart } from 'lucide-react';
import './PatientHeader.css';

// Helper function to calculate initials for the avatar fallback
const getInitials = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

// Helper function to calculate age from date of birth
const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};


// PatientHeader component using custom CSS and Lucide icons
export function PatientHeader({ patient }) {
  
  // Array of details for easy rendering in the grid
  const patientDetails = [
    { icon: Mail, label: patient.email },
    { icon: Phone, label: patient.phone },
    { icon: User, label: patient.gender },
    { icon: MapPin, label: patient.location },
    { icon: Calendar, label: `${calculateAge(patient.dateOfBirth)} years old` },
    patient.bloodGroup ? { icon: Heart, label: `Blood: ${patient.bloodGroup}` } : null,
  ].filter(Boolean); // Filter out null if bloodGroup is missing

  return (
    // Card container
    <div className="patient-header-cards">
      <div className="patient-header-contents">
        
        {/* Avatar Section */}
        <div className="patient-avatar-sections">
          <div className="patient-avatars">
            {patient.avatar ? (
              <img src={patient.avatar} alt={patient.name} className="patient-avatar-image" />
            ) : (
              <div className="patient-avatar-fallback">
                {getInitials(patient.name)}
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="patient-info-containers">
          
          {/* Name and ID Section */}
          <div className="patient-name-id-section">
            <h1 className="patient-name">{patient.name}</h1>
            <span className="patient-id-tag">
              ID: {patient.id}
            </span>
          </div>

          {/* Details Grid */}
          <div className="patient-details-grids">
            {patientDetails.map((item, index) => {
              const Icon = item.icon; // Component from lucide-react
              return (
                <div key={index} className="detail-item">
                  {/* Lucide Icon with blue color */}
                  <Icon className="detail-icon" />
                  {/* Detail text */}
                  <span className="detail-text" title={item.label}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App component to demonstrate the PatientHeader
export default function App() {
    // Mock data based on the image
    const mockPatientData = {
        name: "Sarah Johnson",
        id: "PT-2024-001",
        email: "sarah.johnson@email.com",
        phone: "+1-555-0123",
        gender: "Female",
        location: "New York, NY",
        dateOfBirth: "1985-06-15",
        bloodGroup: "A+",
        avatar: null, // Uses initials fallback
    };
    
    // Structure simulating the surrounding platform environment
    return (
        <div className="platform-container">
            {/* Mock Platform Header to match the image context */}
            <header className="platform-header">
                <h1 className="platform-title">MedCare Platform</h1>
                <p className="platform-subtitle">Doctor-Patient Consultation System</p>
                <div className="header-divider"></div>
            </header>

            {/* The main Patient Header component */}
            <PatientHeader patient={mockPatientData} />
            
            {/* Placeholder for content below the header */}
            <div className="content-placeholder">
                <p className="placeholder-text">Patient records and consultation notes will appear here...</p>
            </div>
        </div>
    );
}
