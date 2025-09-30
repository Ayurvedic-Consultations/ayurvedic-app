import React from 'react';
import { PatientHeader } from './PatientHeader';
import { PrescriptionHistory } from './PrescriptionHistory';
import { PrescriptionTabs } from './PrescriptionTabs';
import './PrescribeIndex.css';


// Sample data for demonstration
const samplePatient = {
  id: "PT-2024-001",
  name: "Sarah Johnson",
  email: "sarah.johnson@email.com",
  phone: "+1-555-0123",
  gender: "Female",
  location: "New York, NY",
  dateOfBirth: "1985-03-15",
  bloodGroup: "A+",
  avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
};

const samplePrescriptions = [
  {
    id: "RX-001",
    medicineName: "Ibuprofen 400mg",
    startDate: "2024-01-15",
    endDate: "2024-01-25",
    dosage: "1 tablet twice daily",
    instructions: "Take with food to avoid stomach upset",
    reason: "Back pain and inflammation",
    isActive: true,
    prescribedBy: "Dr. Michael Chen",
    prescribedDate: "2024-01-15"
  },
  {
    id: "RX-002",
    medicineName: "Omeprazole 20mg",
    startDate: "2024-01-10",
    endDate: "2024-02-10",
    dosage: "1 capsule daily",
    instructions: "Take 30 minutes before breakfast",
    reason: "Acid reflux",
    isActive: true,
    prescribedBy: "Dr. Emily Rodriguez",
    prescribedDate: "2024-01-10"
  },
  {
    id: "RX-003",
    medicineName: "Amoxicillin 500mg",
    startDate: "2023-12-01",
    endDate: "2023-12-08",
    dosage: "1 capsule three times daily",
    instructions: "Complete the full course even if feeling better",
    reason: "Throat infection",
    isActive: false,
    prescribedBy: "Dr. Sarah Williams",
    prescribedDate: "2023-12-01"
  },
  {
    id: "RX-004",
    medicineName: "Metformin 500mg",
    startDate: "2023-11-01",
    endDate: "2024-11-01",
    dosage: "1 tablet twice daily",
    instructions: "Take with meals",
    reason: "Type 2 Diabetes management",
    isActive: false,
    prescribedBy: "Dr. James Thompson",
    prescribedDate: "2023-11-01"
  }
];

const PrescribeIndex = () => {
  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="inner-header">
          <h1 className="title">MedCare Platform</h1>
          <p className="subtitle">Doctor-Patient Consultation System</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        {/* Patient Information */}
        <PatientHeader patient={samplePatient} />
         <PrescriptionHistory records={samplePrescriptions} />

          <PrescriptionTabs />

        {/* Two Column Layout */}
        <div className="grid-container">
      
        </div>
      </main>
    </div>
  );
};

export default PrescribeIndex;