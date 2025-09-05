import React, { useState, useEffect } from "react";
import "./PatientList.css"; 

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

  // New state variables for diet and yoga modal
  const [showDietYogaModal, setShowDietYogaModal] = useState(false);
  const [diet, setDiet] = useState({
    daily: {
      breakfast: "",
      lunch: "",
      dinner: "",
      juices: ""
    },
    weekly: {
      monday: { breakfast: "", lunch: "", dinner: "", juices: "" },
      tuesday: { breakfast: "", lunch: "", dinner: "", juices: "" },
      wednesday: { breakfast: "", lunch: "", dinner: "", juices: "" },
      thursday: { breakfast: "", lunch: "", dinner: "", juices: "" },
      friday: { breakfast: "", lunch: "", dinner: "", juices: "" },
      saturday: { breakfast: "", lunch: "", dinner: "", juices: "" },
      sunday: { breakfast: "", lunch: "", dinner: "", juices: "" }
    },
    herbs: []
  });
  const [yoga, setYoga] = useState({
    morningPlan: "",
    eveningPlan: ""
  });

  const email = localStorage.getItem("email"); // Assuming the doctor's email is stored in localStorage

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/bookings/bookings`
        );
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

  // New function to open supplements modal
  const handleSuggestSupplements = async (appointmentId) => {
    try {
      // Fetch existing supplements for this appointment
      const response = await fetch(
        `${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/bookings/supplements/${appointmentId}`
      );

      const appointment = [...previousAppointments, ...deniedAppointments].find(
        (app) => app._id === appointmentId
      );
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
      forIllness: newIllness,
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
        `${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/bookings/supplements/${currentAppointment._id}`,
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

  // New function to open diet and yoga modal
  const handleSuggestDietYoga = async (appointmentId) => {
    const appointment = [...previousAppointments, ...deniedAppointments].find(app => app._id === appointmentId);
    setCurrentAppointment(appointment);

    try {
      const response = await fetch(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/diet-yoga/booking/${appointmentId}`);
      if (response.ok) {
        const data = await response.json();
        setDiet(data.diet || {
          daily: { breakfast: "", lunch: "", dinner: "", juices: "" },
          weekly: {
            monday: { breakfast: "", lunch: "", dinner: "", juices: "" },
            tuesday: { breakfast: "", lunch: "", dinner: "", juices: "" },
            wednesday: { breakfast: "", lunch: "", dinner: "", juices: "" },
            thursday: { breakfast: "", lunch: "", dinner: "", juices: "" },
            friday: { breakfast: "", lunch: "", dinner: "", juices: "" },
            saturday: { breakfast: "", lunch: "", dinner: "", juices: "" },
            sunday: { breakfast: "", lunch: "", dinner: "", juices: "" }
          },
          herbs: []
        });
        setYoga(data.yoga || { morningPlan: "", eveningPlan: "" });
      } else {
        setDiet({
          daily: { breakfast: "", lunch: "", dinner: "", juices: "" },
          weekly: {
            monday: { breakfast: "", lunch: "", dinner: "", juices: "" },
            tuesday: { breakfast: "", lunch: "", dinner: "", juices: "" },
            wednesday: { breakfast: "", lunch: "", dinner: "", juices: "" },
            thursday: { breakfast: "", lunch: "", dinner: "", juices: "" },
            friday: { breakfast: "", lunch: "", dinner: "", juices: "" },
            saturday: { breakfast: "", lunch: "", dinner: "", juices: "" },
            sunday: { breakfast: "", lunch: "", dinner: "", juices: "" }
          },
          herbs: []
        });
        setYoga({ morningPlan: "", eveningPlan: "" });
      }
    } catch (error) {
      console.error("Error fetching diet and yoga plan:", error);
    }

    setShowDietYogaModal(true);
  };

  const handleSaveDietYoga = async () => {
    if (!currentAppointment) return;

    try {
      // Get the token from localStorage (assuming it's stored there after login)
      const token = localStorage.getItem("token");

      if (!token) {
        alert("You are not authenticated. Please log in again.");
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/diet-yoga`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
        body: JSON.stringify({
          bookingId: currentAppointment._id,
          patientEmail: currentAppointment.patientEmail,
          patientName: currentAppointment.patientName,
          doctorEmail: currentAppointment.doctorEmail,
          doctorName: currentAppointment.doctorName,
          diet,
          yoga,
        }),
      });

      const data = await response.json(); // Parse the response JSON

      if (response.ok) {
        alert("Diet and yoga plan saved successfully!");
        setShowDietYogaModal(false);
      } else {
        // If the response is not OK, show the error message from the backend
        alert(`Error: ${data.message || "Failed to save diet and yoga plan."}`);
      }
    } catch (error) {
      console.error("Error saving diet and yoga plan:", error);
      alert("Failed to save diet and yoga plan. Please check the console for details.");
    }
  };

  if (loading) {
    return <p style={{marginTop:"150px",padding:"15px", background:"white", width:"max-content", borderRadius:"15px", marginLeft:"50px"}}>Loading...</p>;
  }

  if (error) {
    return <p style={{marginTop:"150px",padding:"15px", background:"white", width:"max-content", borderRadius:"15px", marginLeft:"50px"}}>Error: {error}</p>;
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
              <div
                key={appointment._id}
                className="appointment-card-patient-list"
              >
                <h3>{appointment.patientName}</h3>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(appointment.dateOfAppointment).toLocaleDateString()}
                </p>
                <p>
                  <strong>Time Slot:</strong> {appointment.timeSlot}
                </p>
                <p>
                  <strong>Gender:</strong> {appointment.patientGender}
                </p>
                <p>
                  <strong>Age:</strong> {appointment.patientAge}
                </p>
                <p>
                  <strong>Illness described:</strong>{" "}
                  {appointment.patientIllness}
                </p>
                <button
                  className="action-button suggest-button"
                  onClick={() => handleSuggestSupplements(appointment._id)}
                >
                  Suggest Supplements
                </button>
                <button
                  className="action-button suggest-button"
                  onClick={() => handleSuggestDietYoga(appointment._id)}
                >
                  Suggest Diet and Yoga Plan
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
                <p><strong>Date:</strong> {new Date(appointment.dateOfAppointment).toLocaleDateString()}</p>
                <p><strong>Time Slot:</strong> {appointment.timeSlot}</p>
                <p><strong>Gender:</strong> {appointment.patientGender}</p>
                <p><strong>Age:</strong> {appointment.patientAge}</p>
                <p><strong>Illness described:</strong> {appointment.patientIllness}</p>
                <p><strong>Message:</strong> {appointment.doctorsMessage || "No message provided"}</p>
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
                        <strong>{supplement.medicineName}</strong> - For:{" "}
                        {supplement.forIllness}
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
              <button className="add-button" onClick={handleAddSupplement}>
                Add Supplement
              </button>
            </div>

            <div className="modal-buttons">
              <button className="save-button" onClick={handleSaveSupplements}>
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

      {/* Diet and Yoga Modal */}
      {showDietYogaModal && currentAppointment && (
        <div className="modal-overlay">
          <div className="supplements-modal">
            <h2>Diet and Yoga Plan for {currentAppointment.patientName}</h2>
            <p>Patient Illness: {currentAppointment.patientIllness}</p>

            <div className="diet-yoga-form">
              <h3>Daily Diet Plan</h3>
              <div className="form-group-patient-list">
                <label>Breakfast:</label>
                <input
                  type="text"
                  value={diet.daily.breakfast}
                  onChange={(e) => setDiet({ ...diet, daily: { ...diet.daily, breakfast: e.target.value } })}
                  placeholder="Enter breakfast plan"
                />
              </div>
              <div className="form-group-patient-list">
                <label>Lunch:</label>
                <input
                  type="text"
                  value={diet.daily.lunch}
                  onChange={(e) => setDiet({ ...diet, daily: { ...diet.daily, lunch: e.target.value } })}
                  placeholder="Enter lunch plan"
                />
              </div>
              <div className="form-group-patient-list">
                <label>Dinner:</label>
                <input
                  type="text"
                  value={diet.daily.dinner}
                  onChange={(e) => setDiet({ ...diet, daily: { ...diet.daily, dinner: e.target.value } })}
                  placeholder="Enter dinner plan"
                />
              </div>
              <div className="form-group-patient-list">
                <label>Juices:</label>
                <input
                  type="text"
                  value={diet.daily.juices}
                  onChange={(e) => setDiet({ ...diet, daily: { ...diet.daily, juices: e.target.value } })}
                  placeholder="Enter juice recommendations"
                />
              </div>

              <h3>Weekly Diet Plan</h3>
              {Object.entries(diet.weekly).map(([day, plan]) => (
                <div key={day} className="weekly-plan">
                  <h4>{day.charAt(0).toUpperCase() + day.slice(1)}</h4>
                  <div className="form-group-patient-list">
                    <label>Breakfast:</label>
                    <input
                      type="text"
                      value={plan.breakfast}
                      onChange={(e) => setDiet({
                        ...diet,
                        weekly: {
                          ...diet.weekly,
                          [day]: { ...plan, breakfast: e.target.value }
                        }
                      })}
                      placeholder="Enter breakfast plan"
                    />
                  </div>
                  <div className="form-group-patient-list">
                    <label>Lunch:</label>
                    <input
                      type="text"
                      value={plan.lunch}
                      onChange={(e) => setDiet({
                        ...diet,
                        weekly: {
                          ...diet.weekly,
                          [day]: { ...plan, lunch: e.target.value }
                        }
                      })}
                      placeholder="Enter lunch plan"
                    />
                  </div>
                  <div className="form-group-patient-list">
                    <label>Dinner:</label>
                    <input
                      type="text"
                      value={plan.dinner}
                      onChange={(e) => setDiet({
                        ...diet,
                        weekly: {
                          ...diet.weekly,
                          [day]: { ...plan, dinner: e.target.value }
                        }
                      })}
                      placeholder="Enter dinner plan"
                    />
                  </div>
                  <div className="form-group-patient-list">
                    <label>Juices:</label>
                    <input
                      type="text"
                      value={plan.juices}
                      onChange={(e) => setDiet({
                        ...diet,
                        weekly: {
                          ...diet.weekly,
                          [day]: { ...plan, juices: e.target.value }
                        }
                      })}
                      placeholder="Enter juice recommendations"
                    />
                  </div>
                </div>
              ))}

              <h3>Herbs</h3>
              <div className="form-group-patient-list">
                <label>Herbs (comma-separated):</label>
                <input
                  type="text"
                  value={diet.herbs.join(", ")}
                  onChange={(e) => setDiet({ ...diet, herbs: e.target.value.split(", ") })}
                  placeholder="Enter herbs"
                />
              </div>

              <h3>Yoga Plan</h3>
              <div className="form-group-patient-list">
                <label>Morning Plan:</label>
                <input
                  type="text"
                  value={yoga.morningPlan}
                  onChange={(e) => setYoga({ ...yoga, morningPlan: e.target.value })}
                  placeholder="Enter morning yoga plan"
                />
              </div>
              <div className="form-group-patient-list">
                <label>Evening Plan:</label>
                <input
                  type="text"
                  value={yoga.eveningPlan}
                  onChange={(e) => setYoga({ ...yoga, eveningPlan: e.target.value })}
                  placeholder="Enter evening yoga plan"
                />
              </div>
            </div>

            <div className="modal-buttons">
              <button
                className="save-button"
                onClick={handleSaveDietYoga}
              >
                Save Plan
              </button>
              <button
                className="cancel-button"
                onClick={() => setShowDietYogaModal(false)}
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
