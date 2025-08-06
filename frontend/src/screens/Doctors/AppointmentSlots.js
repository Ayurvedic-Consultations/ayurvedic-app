import React, { useState, useEffect } from "react";
import "./AppointmentSlots.css"; // Ensure CSS is correctly linked

function AppointmentSlots() {
	const [appointments, setAppointments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showInput, setShowInput] = useState({});
	const [meetLink, setMeetLink] = useState({});
	const [linkSent, setLinkSent] = useState({});

	const email = localStorage.getItem("email");

	useEffect(() => {
		const fetchAppointments = async () => {
			try {
				const response = await fetch(
					`${process.env.AYURVEDA_BACKEND_URL}/api/bookings/bookings`
				);
				if (!response.ok) {
					throw new Error("Failed to fetch appointments");
				}

        const data = await response.json();
        const currentTime = new Date();
        
        // Calculate the cutoff time (30 minutes ago)
        const cutoffTime = new Date(currentTime);
        cutoffTime.setMinutes(cutoffTime.getMinutes() - 30);
        
        const filteredAppointments = data.bookings.filter((appointment) => {
          // Check if the appointment is accepted by the doctor
          if (appointment.doctorEmail !== email || appointment.requestAccept !== "y") {
            return false;
          }
          
          // Parse the appointment date and time
          const appointmentDate = new Date(appointment.dateOfAppointment);
          const timeParts = appointment.timeSlot.split(" - ")[0].split(":");
          const hours = parseInt(timeParts[0], 10);
          const minutes = parseInt(timeParts[1], 10);
          
          // Set the appointment time
          appointmentDate.setHours(hours, minutes, 0, 0);
          
          // Show appointments that are in the future or within the last 30 minutes
          return appointmentDate >= cutoffTime;
        });

        // Sort appointments by date and time
        filteredAppointments.sort((a, b) => {
          const dateA = new Date(a.dateOfAppointment);
          const dateB = new Date(b.dateOfAppointment);
          
          const timeA = a.timeSlot.split(" - ")[0].split(":");
          const timeB = b.timeSlot.split(" - ")[0].split(":");
          
          dateA.setHours(parseInt(timeA[0], 10), parseInt(timeA[1], 10), 0, 0);
          dateB.setHours(parseInt(timeB[0], 10), parseInt(timeB[1], 10), 0, 0);
          
          return dateA - dateB;
        });

				const meetLinks = {};
				filteredAppointments.forEach((appointment) => {
					if (appointment.meetLink && appointment.meetLink !== "no") {
						meetLinks[appointment._id] = appointment.meetLink;
					}
				});

				setMeetLink(meetLinks);
				setAppointments(filteredAppointments);
				setLoading(false);
			} catch (error) {
				setError(error.message);
				setLoading(false);
			}
		};

		fetchAppointments();
    
    // Set up a timer to refresh the appointments every minute
    // to keep the list updated without needing a page refresh
    const intervalId = setInterval(fetchAppointments, 60000);
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
	}, [email]);

	const handleCreateMeetLink = (id) => {
		window.open("https://meet.google.com", "_blank");
		setShowInput((prev) => ({ ...prev, [id]: true }));
	};

	const handleSendMeetLink = async (id) => {
		if (!meetLink[id] || meetLink[id].trim() === "") {
			alert("Please enter a valid Meet link.");
			return;
		}

		try {
			const response = await fetch(
				`${process.env.AYURVEDA_BACKEND_URL}/api/bookings/update/meet-link/${id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ meetLink: meetLink[id] }),
				}
			);

			const data = await response.json();

			if (response.ok) {
				alert("Meet link sent successfully!");
				setLinkSent((prev) => ({ ...prev, [id]: true }));
			} else {
				alert(`Error: ${data.error}`);
			}
		} catch (error) {
			alert("Failed to send the meet link.");
		}
	};

	const handleInputChange = (id, value) => {
		setMeetLink((prev) => ({ ...prev, [id]: value }));
	};
  // Helper function to determine if an appointment is currently active
  const isAppointmentActive = (appointment) => {
    const now = new Date();
    const appointmentDate = new Date(appointment.dateOfAppointment);
    const timeParts = appointment.timeSlot.split(" - ")[0].split(":");
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    
    appointmentDate.setHours(hours, minutes, 0, 0);
    
    // Calculate end time based on appointment duration (assuming 30 minutes)
    const endTime = new Date(appointmentDate);
    endTime.setMinutes(endTime.getMinutes() + 30);
    
    return now >= appointmentDate && now <= endTime;
  };

	if (loading) {
		return <p>Loading...</p>;
	}

	if (error) {
		return <p>Error: {error}</p>;
	}

  return (
    <div className="appointments-container">
      <h1>My Appointment Slots</h1>
      <p>Showing upcoming appointments and those from the past 30 minutes.</p>
      {appointments.length === 0 ? (
        <p>No upcoming appointments found.</p>
      ) : (
        appointments.map((appointment) => {
          const isActive = isAppointmentActive(appointment);
          
          return (
            <div 
              key={appointment._id} 
              className={`appointment-card ${isActive ? 'active-appointment' : ''}`}
            >
              <div className="appointment-timing">
                <h2 className="date-time">
                  {new Date(appointment.dateOfAppointment).toLocaleDateString(
                    "en-GB"
                  )}
                </h2>
                <h2 className="date-time">{appointment.timeSlot}</h2>
                {isActive && <span className="active-badge">Active Now</span>}
              </div>
              <div className="appointment-details">
                <p>
                  <strong>Name of the Patient:</strong> {appointment.patientName}
                </p>
                <p>
                  <strong>Patient Email:</strong>{" "}
                  {appointment.patientEmail || "No email available"}
                </p>
                <p>
                  <strong>Illness:</strong>{" "}
                  {appointment.patientIllness || "No illness information"}
                </p>
              </div>
              <div className="appointment-details">
                <p>
                  <strong>Gender:</strong> {appointment.patientGender}
                </p>
                <p>
                  <strong>Age:</strong>{" "}
                  {appointment.patientAge || "No age information"}
                </p>
              </div>
              <div className="appointment-actions">
                <div className="button-group">
                  {meetLink[appointment._id] && meetLink[appointment._id] !== "no" ? (
                    <button
                      className="action-button"
                      onClick={() => window.open(meetLink[appointment._id], "_blank")}
                    >
                      Join Meet
                    </button>
                  ) : showInput[appointment._id] ? (
                    <>
                      <input
                        type="text"
                        placeholder="Enter Meet link"
                        value={meetLink[appointment._id] || ""}
                        onChange={(e) =>
                          handleInputChange(appointment._id, e.target.value)
                        }
                        className="meet-link-input"
                      />
                      <button
                        className="action-button"
                        onClick={() => handleSendMeetLink(appointment._id)}
                      >
                        Send Meet Link
                      </button>
                    </>
                  ) : (
                    <button
                      className="action-button"
                      onClick={() => handleCreateMeetLink(appointment._id)}
                    >
                      Create Meet Link
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default AppointmentSlots;
