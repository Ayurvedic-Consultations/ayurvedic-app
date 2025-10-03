// Utility functions for AppointedDoctor component
import { jwtDecode } from 'jwt-decode';

// Fetch all booking data
export const fetchDoctorData = async () => {
	const token = localStorage.getItem('token');
	if (!token) {
		throw new Error("No token found in localStorage");
	}

	let userId;
	try {
		const decoded = jwtDecode(token);
		const { id, role } = decoded;

		if (role !== "patient") {
			throw new Error("Invalid role for this request");
		}

		userId = id;
	} catch (error) {
		console.error("❌ Failed to decode token:", error);
		throw error;
	}

	const response = await fetch(
		`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/bookings/patient/${userId}`,
		{
			headers: {
				Authorization: `Bearer ${token}`, 
			},
		}
	);

	if (!response.ok) {
		throw new Error("Failed to fetch doctor data");
	}

	console.log("✅ Fetched doctor data successfully");
	return await response.json();
};

// Fetch supplements for a specific appointment
export const fetchSupplements = async (appointmentId) => {
	try {
		const response = await fetch(
			`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/bookings/supplements/${appointmentId}`
		);

		if (!response.ok) {
			throw new Error("Failed to fetch supplements");
		}

		const data = await response.json();
		return data.supplements || [];
	} catch (error) {
		console.error("Error fetching supplements:", error);
		return [];
	}
};

// Delete a booking request
//export const handleDeleteRequest = async (bookingId) => {
//  // Ask for confirmation before proceeding
//  const confirmed = window.confirm(
//    "Are you sure you want to delete this request?"
//  );
//
//  if (!confirmed) {
//    return false; // If the user clicks "Cancel", do nothing
//  }
//
//  try {
//    const response = await fetch(
//      `${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/bookings/delete/${bookingId}`,
//      { method: "DELETE" }
//    );
//
//    if (!response.ok) {
//      throw new Error("Failed to delete the request");
//    }
//
//    return true; // Deletion successful
//  } catch (error) {
//    console.error("Error deleting the request:", error);
//    alert("Failed to delete the request");
//    return false; // Deletion failed
//  }
//};
