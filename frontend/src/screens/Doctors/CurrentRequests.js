import React, { useState, useEffect, useContext } from "react";
import "./CurrentRequests.css"; // Ensure this CSS file is linked
import { AuthContext } from "../../context/AuthContext";

function CurrentRequests() {
  const [requests, setRequests] = useState([]); // Initialize state to hold the requests as an array
  const [loading, setLoading] = useState(true); // State to manage loading status
  const [error, setError] = useState(null); // State to manage any potential errors

  const [denyingRequest, setDenyingRequest] = useState(null); // Track which request is being denied
  const [doctorsMessage, setDoctorsMessage] = useState(""); // Track the doctor's message for denial

  const { auth } = useContext(AuthContext);
  const firstName = auth.user?.firstName || "Doctor";

  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");

  console.log(`User Email: ${email}`);
  console.log(`User Role: ${role}`);

  // Fetch data from API when component mounts
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(
          `${process.env.AYURVEDA_BACKEND_URL}/api/bookings/bookings`
        ); // Adjust API URL as needed
        if (!response.ok) {
          throw new Error("Failed to fetch requests");
        }

        const data = await response.json();

        // Log the response data to check its structure
        console.log("Fetched data:", data);

        // Ensure that we are accessing the bookings array
        const requestsArray = Array.isArray(data.bookings) ? data.bookings : [];

        // Filter the requests based on the logged-in doctor's email
        const filteredRequests = requestsArray.filter(
          (request) =>
            request.doctorEmail === email && request.requestAccept === "o" // Assuming doctorName is the doctor's email
        );

        setRequests(filteredRequests); // Set the fetched requests to state
        setLoading(false); // Set loading to false once data is fetched
      } catch (error) {
        setError(error.message); // Capture any error that occurs during the fetch
        setLoading(false);
      }
    };

    fetchRequests();
  }, [email]); // Empty dependency array ensures this runs once when the component mounts

  // Function to accept request
  const acceptRequest = async (id) => {
    try {
      const response = await fetch(
        `${process.env.AYURVEDA_BACKEND_URL}/api/bookings/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ requestAccept: "y" }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to accept request");
      }

      // Remove the request from the state after accepting
      setRequests((prevRequests) =>
        prevRequests.filter((request) => request._id !== id)
      );

      alert(`Request ${id} accepted!`);
    } catch (error) {
      console.error("Error accepting request:", error);
      alert("Error accepting the request.");
    }
  };

  const denyRequest = async (id) => {
    if (!doctorsMessage) {
      alert("Please provide a reason for denial.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.AYURVEDA_BACKEND_URL}/api/bookings/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ requestAccept: "n", doctorsMessage }), // Send doctorsMessage with the denial
        }
      );

      if (!response.ok) {
        throw new Error("Failed to deny request");
      }

      // Remove the request from the state after denying
      setRequests((prevRequests) =>
        prevRequests.filter((request) => request._id !== id)
      );

      setDoctorsMessage(""); // Reset the message
      setDenyingRequest(null); // Clear the denying state

      alert(`Request ${id} denied!`);
    } catch (error) {
      console.error("Error denying request:", error);
      alert("Error denying the request.");
    }
  };

  if (loading) {
    return <p>Loading...</p>; // Display loading indicator
  }

  if (error) {
    return <p>Error: {error}</p>; // Display error message if any
  }

  return (
    <div className="requests-container">
      <h1>Current Requests for Dr. {firstName}</h1>
      {console.log(requests)}
      {requests.length > 0 ? (
        requests.map((request) => (
          <div key={request._id} className="request-card">
            <div className="line">
              <p>
                <strong>Date:</strong>{" "}
                {new Date(request.dateOfAppointment).toLocaleDateString(
                  "en-GB"
                )}{" "}
                (dd/mm/yyyy)
              </p>
              <p className="centered">
                <strong>Time Slot:</strong> {request.timeSlot}
              </p>
            </div>
            <div className="line">
              <p>
                <strong>Patient Name:</strong> {request.patientName}
              </p>
              <p className="centered">
                <strong>Patient Email:</strong> {request.patientEmail}
              </p>
            </div>
            <div className="line">
              <p>
                <strong>Patient Gender:</strong> {request.patientGender}
              </p>
              <p className="centered">
                <strong>Patient Age:</strong> {request.patientAge}
              </p>
            </div>
            <p>
              <strong>Patient's Illness:</strong> {request.patientIllness}
            </p>
            <div className="action-buttons">
              <button onClick={() => acceptRequest(request._id)}>
                Accept Request
              </button>

              {/* Show the deny button */}
              <button
                onClick={() => setDenyingRequest(request._id)} // Set the denying request state
                className="deny-button"
              >
                Deny Request
              </button>
            </div>

            {/* Show the input field if denyingRequest matches this request's ID */}
            {denyingRequest === request._id && (
              <div className="denial-reason">
                <input
                  type="text"
                  value={doctorsMessage}
                  onChange={(e) => setDoctorsMessage(e.target.value)} // Update the doctor's message state
                  placeholder="Provide reason for denial"
                />
                <button onClick={() => denyRequest(request._id)}>
                  Submit Denial
                </button>
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="noRequest">There are no current requests for you.</p>
      )}
    </div>
  );
}

export default CurrentRequests;
