// Utility functions for AppointedDoctor component

// Fetch all booking data
export const fetchDoctorData = async () => {
  const response = await fetch(`http://localhost:8080/api/bookings/bookings`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch doctor data");
  }
  
  return await response.json();
};

// Fetch supplements for a specific appointment
export const fetchSupplements = async (appointmentId) => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/bookings/supplements/${appointmentId}`
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
export const handleDeleteRequest = async (bookingId) => {
  // Ask for confirmation before proceeding
  const confirmed = window.confirm(
    "Are you sure you want to delete this request?"
  );

  if (!confirmed) {
    return false; // If the user clicks "Cancel", do nothing
  }

  try {
    const response = await fetch(
      `http://localhost:8080/api/bookings/delete/${bookingId}`,
      { method: "DELETE" }
    );

    if (!response.ok) {
      throw new Error("Failed to delete the request");
    }
    
    return true; // Deletion successful
  } catch (error) {
    console.error("Error deleting the request:", error);
    alert("Failed to delete the request");
    return false; // Deletion failed
  }
};
