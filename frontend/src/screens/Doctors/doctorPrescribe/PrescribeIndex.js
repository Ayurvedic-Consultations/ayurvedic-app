import React, { useState, useEffect } from 'react';
import { PatientHeader } from './PatientHeader';
import { PrescriptionHistory } from './PrescriptionHistory';
import { PrescriptionTabs } from './PrescriptionTabs';
import { useLocation } from 'react-router-dom';
import './PrescribeIndex.css';

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
	const location = useLocation();
	const { patientId, doctorId, bookingId } = location.state || {};
	const [patientData, setPatientData] = useState(samplePatient);
	const [loading, setLoading] = useState(true);

	const [prescriptions, setPrescriptions] = useState(samplePrescriptions);
	const [loadingPrescriptions, setLoadingPrescriptions] = useState(true);

	// Fetch patient details
	useEffect(() => {
		const fetchPatientDetails = async () => {
			if (!patientId) {
				setLoading(false);
				console.error("Patient ID is missing from navigation state.");
				return;
			}

			setLoading(true);
			try {
				const response = await fetch(
					`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/patients/getPatient/${patientId}`
				);

				if (!response.ok) {
					throw new Error("Failed to fetch patient details.");
				}

				const data = await response.json();
				setPatientData(data);
			} catch (error) {
				console.error("Error fetching patient data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchPatientDetails();
	}, [patientId]);

	// Fetch booking details
	useEffect(() => {
		const fetchPrescriptions = async () => {
			if (!patientId) {
				setLoadingPrescriptions(false);
				console.error("Patient ID is missing from navigation state.");
				return;
			}

			setLoadingPrescriptions(true);
			try {
				const response = await fetch(
					`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/bookings/patient/${patientId}`
				);

				if (!response.ok) {
					throw new Error("Failed to fetch prescriptions.");
				}

				const data = await response.json();
				setPrescriptions(data.bookings);
			}
			catch (error) {
				console.error("Error fetching prescriptions:", error);
			} finally {
				setLoadingPrescriptions(false);
			}
		};

		fetchPrescriptions();

	}, [bookingId, patientId])

	return (
		<div className="container">
			<main className="main">
				{/* Patient Information */}
				<PatientHeader patient={patientData} loading={loading} />
				<PrescriptionHistory prescriptions={prescriptions} loading={loadingPrescriptions} />
				<PrescriptionTabs />
				{/* Two Column Layout */}
				<div className="grid-container">
				</div>
			</main>
		</div>
	);
};

export default PrescribeIndex;