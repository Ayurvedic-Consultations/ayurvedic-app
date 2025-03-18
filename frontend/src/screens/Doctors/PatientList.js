import React, { useState, useEffect } from "react";
import "./PatientList.css"; // Ensure this CSS file is linked

function PatientList() {
  const [activeTab, setActiveTab] = useState("Previous");
  const [previousAppointments, setPreviousAppointments] = useState([]);
  const [deniedAppointments, setDeniedAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // New state variables for supplements modal
  const [showSupplementsModal, setShowSupplementsModal] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [supplements, setSupplements] = useState([]);
  const [newMedicineName, setNewMedicineName] = useState("");
  const [newIllness, setNewIllness] = useState("");

  const email = localStorage.getItem("email"); // Assuming the doctor's email is stored in localStorage

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/bookings/bookings");
        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }

        const data = await response.json();
        const currentDate = new Date();

        // Filter appointments for the logged-in doctor
        const doctorAppointments = data.bookings.filter(
          (booking) => booking.doctorEmail === email
        );

        // Sort appointments into previous and denied
        const sortedAppointments = doctorAppointments.reduce(
          (acc, booking) => {
            const appointmentDate = new Date(booking.dateOfAppointment);
            const isPastAppointment = appointmentDate < currentDate;

            if (booking.requestAccept === "n") {
              acc.denied.push(booking);
            } else if (isPastAppointment) {
              acc.previous.push(booking);
            }

            return acc;
          },
          { previous: [], denied: [] }
        );

        setPreviousAppointments(sortedAppointments.previous);
        setDeniedAppointments(sortedAppointments.denied);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [email]);

  const handleDeleteAppointment = async (bookingId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/bookings/delete/${bookingId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete appointment");
      }

      // Remove the deleted appointment from the denied list
      setDeniedAppointments((prev) =>
        prev.filter((appointment) => appointment._id !== bookingId)
      );
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  // New function to open supplements modal
  const handleSuggestSupplements = async (appointmentId) => {
    try {
      // Fetch existing supplements for this appointment
      const response = await fetch(
        `http://localhost:8080/api/bookings/supplements/${appointmentId}`
      );
      
      const appointment = [...previousAppointments, ...deniedAppointments].find(app => app._id === appointmentId);
      setCurrentAppointment(appointment);
      
      if (response.ok) {
        const data = await response.json();
        setSupplements(data.supplements || []);
      } else {
        // If no supplements exist yet, start with empty array
        setSupplements([]);
      }
      
      setShowSupplementsModal(true);
    } catch (error) {
      console.error("Error fetching supplements:", error);
      // If error, still open modal but with empty supplements array
      setSupplements([]);
      setShowSupplementsModal(true);
    }
  };

  // Function to add a new supplement to the list
  const handleAddSupplement = () => {
    if (!newMedicineName.trim() || !newIllness.trim()) {
      alert("Please enter both medicine name and illness");
      return;
    }
    
    const newSupplement = {
      medicineName: newMedicineName,
      forIllness: newIllness
    };
    
    setSupplements([...supplements, newSupplement]);
    setNewMedicineName("");
    setNewIllness("");
  };

  // Function to remove a supplement from the list
  const handleRemoveSupplement = (index) => {
    const updatedSupplements = [...supplements];
    updatedSupplements.splice(index, 1);
    setSupplements(updatedSupplements);
  };

  // Function to save supplements to the backend
  const handleSaveSupplements = async () => {
    if (!currentAppointment) return;
    
    try {
      const response = await fetch(
        `http://localhost:8080/api/bookings/supplements/${currentAppointment._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ supplements }),
        }
      );

      if (response.ok) {
        alert("Supplements updated successfully!");
        setShowSupplementsModal(false);
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert("Failed to save supplements.");
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="patient-list-container">
      <h1>Patient List</h1>

      {/* Tabs for Previous Appointments and Denied Requests */}
      <div className="tabs">
        <button
          onClick={() => setActiveTab("Previous")}
          className={`tab ${activeTab === "Previous" ? "active" : ""}`}
        >
          Previous Appointments
        </button>
        <button
          onClick={() => setActiveTab("Denied")}
          className={`tab ${activeTab === "Denied" ? "active" : ""}`}
        >
          Denied Requests
        </button>
      </div>

      {/* Previous Appointments Section */}
      {activeTab === "Previous" && (
        <div className="appointment-list">
          {previousAppointments.length === 0 ? (
            <p>No previous appointments found.</p>
          ) : (
            previousAppointments.map((appointment) => (
              <div key={appointment._id} className="appointment-card-patient-list">
                <h3>{appointment.patientName}</h3>
                <p><strong>Date:</strong> {formatDate(appointment.dateOfAppointment)}</p>
                <p><strong>Time Slot:</strong> {appointment.timeSlot}</p>
                <p><strong>Gender:</strong> {appointment.patientGender}</p>
                <p><strong>Age:</strong> {appointment.patientAge}</p>
                <p><strong>Illness described:</strong> {appointment.patientIllness}</p>
                <button
                  className="action-button suggest-button"
                  onClick={() => handleSuggestSupplements(appointment._id)}
                >
                  Suggest Supplements
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Denied Requests Section */}
      {activeTab === "Denied" && (
        <div className="appointment-list">
          {deniedAppointments.length === 0 ? (
            <p>No denied requests found.</p>
          ) : (
            deniedAppointments.map((appointment) => (
              <div key={appointment._id} className="appointment-card-patient-list">
                <h3>{appointment.patientName}</h3>
                <p><strong>Date:</strong> {formatDate(appointment.dateOfAppointment)}</p>
                <p><strong>Time Slot:</strong> {appointment.timeSlot}</p>
                <p><strong>Gender:</strong> {appointment.patientGender}</p>
                <p><strong>Age:</strong> {appointment.patientAge}</p>
                <p><strong>Illness described:</strong> {appointment.patientIllness}</p>
                <p><strong>Message:</strong> {appointment.doctorsMessage || "No message provided"}</p>
                <button
                  className="delete-button"
                  onClick={() => handleDeleteAppointment(appointment._id)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Supplements Modal */}
      {showSupplementsModal && currentAppointment && (
        <div className="modal-overlay">
          <div className="supplements-modal">
            <h2>Recommend Supplements for {currentAppointment.patientName}</h2>
            <p>Patient Illness: {currentAppointment.patientIllness}</p>
            
            <div className="supplements-list">
              <h3>Current Recommendations</h3>
              {supplements.length === 0 ? (
                <p>No supplements recommended yet.</p>
              ) : (
                <ul>
                  {supplements.map((supplement, index) => (
                    <li key={index} className="supplement-item">
                      <div>
                        <strong>{supplement.medicineName}</strong> - For: {supplement.forIllness}
                      </div>
                      <button 
                        className="remove-button"
                        onClick={() => handleRemoveSupplement(index)}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="add-supplement-form">
              <h3>Add New Supplement</h3>
              <div className="form-group-patient-list">
                <label>Medicine Name:</label>
                <input
                  type="text"
                  value={newMedicineName}
                  onChange={(e) => setNewMedicineName(e.target.value)}
                  placeholder="Enter medicine name"
                />
              </div>
              <div className="form-group-patient-list">
                <label>For Illness:</label>
                <input
                  type="text"
                  value={newIllness}
                  onChange={(e) => setNewIllness(e.target.value)}
                  placeholder="Enter illness it treats"
                />
              </div>
              <button 
                className="add-button"
                onClick={handleAddSupplement}
              >
                Add Supplement
              </button>
            </div>
            
            <div className="modal-buttons">
              <button 
                className="save-button"
                onClick={handleSaveSupplements}
              >
                Save Recommendations
              </button>
              <button 
                className="cancel-button"
                onClick={() => setShowSupplementsModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientList;
