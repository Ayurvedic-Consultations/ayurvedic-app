// import React, { useState } from 'react';
// import { useLocation } from 'react-router-dom';
// import './Doctor-Prescribe.css';
// import { PatientHeader } from './PatientHeader';
// import { PrescriptionTabs } from './PrescriptionTabs';
// import { PrescriptionHistory } from './PrescriptionHistory';

// // --- Sample Data ---
// const SAMPLE_PATIENT = {
// 	id: "PT-2024-001",
// 	name: "Sarah Johnson",
// 	email: "sarah.johnson@email.com",
// 	phone: "+1-555-0123",
// 	gender: "Female",
// 	location: "New York, NY",
// 	dateOfBirth: "1985-03-15",
// 	bloodGroup: "A+",
// 	avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
// };

// const SAMPLE_PRESCRIPTIONS = [
// 	{
// 		id: "RX-001",
// 		medicineName: "Ibuprofen 400mg",
// 		startDate: "2024-01-15",
// 		endDate: "2024-01-25",
// 		dosage: "1 tablet twice daily",
// 		instructions: "Take with food to avoid stomach upset",
// 		reason: "Back pain and inflammation",
// 		isActive: true,
// 		prescribedBy: "Dr. Michael Chen",
// 		prescribedDate: "2024-01-15"
// 	},
// 	{
// 		id: "RX-002",
// 		medicineName: "Omeprazole 20mg",
// 		startDate: "2024-01-10",
// 		endDate: "2024-02-10",
// 		dosage: "1 capsule daily",
// 		instructions: "Take 30 minutes before breakfast",
// 		reason: "Acid reflux",
// 		isActive: true,
// 		prescribedBy: "Dr. Emily Rodriguez",
// 		prescribedDate: "2024-01-10"
// 	},
// 	{
// 		id: "RX-003",
// 		medicineName: "Amoxicillin 500mg",
// 		startDate: "2023-12-01",
// 		endDate: "2023-12-08",
// 		dosage: "1 capsule three times daily",
// 		instructions: "Complete the full course even if feeling better",
// 		reason: "Throat infection",
// 		isActive: false,
// 		prescribedBy: "Dr. Sarah Williams",
// 		prescribedDate: "2023-12-01"
// 	},
// ];

// // --- Utility Functions ---

// const formatDate = (dateString) => {
// 	if (!dateString) return 'N/A';
// 	return new Date(dateString).toLocaleDateString('en-US', {
// 		year: 'numeric',
// 		month: 'short',
// 		day: 'numeric'
// 	});
// };

// // --- Main Exported Component ---
// const DoctorPrescribe = () => {
// 	const location = useLocation();
// 	const { bookingId, patientId, doctorId } = location.state || {};

// 	console.log('Booking ID:', bookingId);
// 	console.log('Patient ID:', patientId);
// 	console.log('Doctor ID:', doctorId);
	
// 	return (
// 		<div className="app-container">
// 			<main className="main-content">
// 				<PatientHeader patient={SAMPLE_PATIENT} />
// 				<div className="main-layout">
// 					<div className="history-column">
// 						<PrescriptionHistory records={SAMPLE_PRESCRIPTIONS} />
// 					</div>
// 					<div className="prescription-column">
// 						<PrescriptionTabs />
// 					</div>
// 				</div>
// 			</main>
// 		</div>
// 	);
// };

// export default DoctorPrescribe;