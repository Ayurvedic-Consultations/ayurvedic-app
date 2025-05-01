import React from "react";

const AppointmentTab = ({
  activeTab,
  upcomingAppointments,
  pendingDoctors,
  deniedDoctors,
  previousAppointments,
  supplements,
  handlePayFees,
  onRatingClick
}) => {
  // Render Upcoming Appointments
  const renderUpcomingAppointments = () => (
    <div className="doctor-info upcoming">
      {upcomingAppointments.length > 0 ? (
        <>
          <h1>Your Upcoming Appointments</h1>
          <p>Completed appointments will be displayed here for a period of 24 hours, after which they will be archived in the previous appointments section.</p>
          {upcomingAppointments
            .sort((a, b) => new Date(a.dateOfAppointment) - new Date(b.dateOfAppointment))
            .map((upcomingAppointment) => (
              <div key={upcomingAppointment._id} className="singled-doctor">
                <hr className="hr"></hr>
                <h2>with Dr. {upcomingAppointment.doctorName}</h2>
                <ul>
                  <li>
                    <strong>Date:</strong>{" "}
                    {new Date(upcomingAppointment.dateOfAppointment).toLocaleDateString("en-GB")}{" "}
                    (dd/mm/yyyy)
                  </li>
                  <li>
                    <strong>Timeslot:</strong> {upcomingAppointment.timeSlot}
                  </li>
                  <li>
                    <strong>Doctor's Email:</strong>{" "}
                    {upcomingAppointment.doctorEmail}
                  </li>
                  <li>
                    <strong>Illness:</strong> {upcomingAppointment.patientIllness}
                  </li>
                </ul>

                {/* Show "Join Meet" button if meetLink is available */}
                {upcomingAppointment.meetLink && upcomingAppointment.meetLink !== "no" ? (
                  <button
                    className="action-button"
                    onClick={() => window.open(upcomingAppointment.meetLink, "_blank")}
                  >
                    Join Meet
                  </button>
                ) : (
                  <button
                    className="action-button pay-fees"
                    onClick={() => handlePayFees(upcomingAppointment._id)}
                  >
                    Pay Fees
                  </button>
                )}

                {
                  new Date(upcomingAppointment.dateOfAppointment) < new Date() && (
                    <>
                      {upcomingAppointment.rating ? (
                        <p>Thank you for your opinion!</p>
                      ) : (
                        <button
                          className="action-button"
                          onClick={() => onRatingClick(upcomingAppointment._id)}
                        >
                          Give your Rating
                        </button>
                      )}
                    </>
                  )
                }

                {/* Recommended Supplements Section */}
                {supplements[upcomingAppointment._id] && supplements[upcomingAppointment._id].length > 0 && (
                  <div className="supplements">
                    <h2>Recommended Supplements</h2>
                    <div className="medicines">
                      {supplements[upcomingAppointment._id].map((supplement, index) => (
                        <div key={index} className="medicine">
                          <p>
                            <strong>Medicine:</strong> {supplement.medicineName}
                          </p>
                          <p>
                            <strong>For Illness:</strong> {supplement.forIllness}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
        </>
      ) : (
        <p>No upcoming doctor assigned.</p>
      )}
    </div>
  );

  // Render Pending Doctors
  const renderPendingDoctors = () => (
    <div className="doctor-info pending">
      {pendingDoctors.length > 0 ? (
        <>
          <h1>Your Pending Doctor Requests</h1>
          {pendingDoctors
            .sort((a, b) => new Date(a.dateOfAppointment) - new Date(b.dateOfAppointment))
            .map((pendingDoctor) => (
              <div key={pendingDoctor._id} className="singled-doctor">
                <hr className="hr"></hr>
                <h2>with Dr. {pendingDoctor.doctorName}</h2>
                <ul>
                  <li>
                    <strong>Status:</strong> Pending (Request not accepted yet)
                  </li>
                  <li>
                    <strong>Date:</strong>{" "}
                    {new Date(pendingDoctor.dateOfAppointment).toLocaleDateString("en-GB")}{" "}
                    (dd/mm/yyyy)
                  </li>
                  <li>
                    <strong>Timeslot:</strong> {pendingDoctor.timeSlot}
                  </li>
                  <li>
                    <strong>Doctor's Email:</strong>{" "}
                    {pendingDoctor.doctorEmail}
                  </li>
                  <li>
                    <strong>Illness:</strong> {pendingDoctor.patientIllness}
                  </li>
                </ul>
              </div>
            ))}
        </>
      ) : (
        <p>No pending doctor requests at the moment.</p>
      )}
    </div>
  );

  // Render Denied Doctors
  const renderDeniedDoctors = () => (
    <div className="doctor-info denied">
      {deniedDoctors.length > 0 ? (
        <>
          <h1>Your Denied Doctor Requests</h1>
          {deniedDoctors
            .sort((a, b) => new Date(b.dateOfAppointment) - new Date(a.dateOfAppointment))
            .map((deniedDoctor) => (
              <div key={deniedDoctor._id} className="singled-doctor">
                <hr className="hr"></hr>
                <h2>with Dr. {deniedDoctor.doctorName}</h2>
                <ul>
                  <li>
                    <strong>Status:</strong> Denied
                  </li>
                  <li>
                    <strong>Date:</strong>{" "}
                    {new Date(deniedDoctor.dateOfAppointment).toLocaleDateString("en-GB")}{" "}
                    (dd/mm/yyyy)
                  </li>
                  <li>
                    <strong>Timeslot:</strong> {deniedDoctor.timeSlot}
                  </li>
                  <li>
                    <strong>Doctor's Email:</strong>{" "}
                    {deniedDoctor.doctorEmail}
                  </li>
                  <li>
                    <strong>Illness:</strong> {deniedDoctor.patientIllness}
                  </li>
                  <li>
                    <strong>Doctor's Message:</strong>{" "}
                    {deniedDoctor.doctorsMessage}
                  </li>
                </ul>
              </div>
            ))}
        </>
      ) : (
        <p>No denied doctor requests at the moment.</p>
      )}
    </div>
  );

  // Render Previous Appointments
  const renderPreviousAppointments = () => (
    <div className="doctor-info previous">
      {previousAppointments.length > 0 ? (
        <>
          <h1>Your Previous Appointments</h1>
          {previousAppointments
            .sort((a, b) => new Date(b.dateOfAppointment) - new Date(a.dateOfAppointment))
            .map((previousAppointment) => (
              <div key={previousAppointment._id} className="singled-doctor">
                <hr className="hr"></hr>
                <h2>with Dr. {previousAppointment.doctorName}</h2>
                <ul>
                  <li>
                    <strong>Status:</strong> {previousAppointment.source}
                  </li>
                  <li>
                    <strong>Date:</strong>{" "}
                    {new Date(previousAppointment.dateOfAppointment).toLocaleDateString("en-GB")}{" "}
                    (dd/mm/yyyy)
                  </li>
                  <li>
                    <strong>Timeslot:</strong> {previousAppointment.timeSlot}
                  </li>
                  <li>
                    <strong>Doctor's Email:</strong>{" "}
                    {previousAppointment.doctorEmail}
                  </li>
                  <li>
                    <strong>Illness:</strong> {previousAppointment.patientIllness}
                  </li>
                  {previousAppointment.doctorsMessage && (
                    <li>
                      <strong>Doctor's Notes:</strong>{" "}
                      {previousAppointment.doctorsMessage}
                    </li>
                  )}
                  <li>
                    <strong>Request Type:</strong>{" "}
                    {previousAppointment.source === "Completed" ? "Accepted" : 
                     previousAppointment.source === "Denied" ? "Denied" : "Pending"}
                  </li>
                </ul>

                {/* Rating and Review Section */}
                {previousAppointment.source === "Completed" && (
                  <>
                    {previousAppointment.rating ? (
                      <p>Thank you for your opinion!</p>
                    ) : (
                      <button
                        className="action-button"
                        onClick={() => onRatingClick(previousAppointment._id)}
                      >
                        Give your Rating
                      </button>
                    )}
                  </>
                )}

                {/* Recommended Supplements Section */}
                {previousAppointment.source === "Completed" && (
                  <div className="supplements">
                    <h2>Recommended Supplements</h2>
                    {supplements[previousAppointment._id] &&
                    supplements[previousAppointment._id].length > 0 ? (
                      <div className="medicines">
                        {supplements[previousAppointment._id].map((supplement, index) => (
                          <div key={index} className="medicine">
                            <p>
                              <strong>Medicine:</strong> {supplement.medicineName}
                            </p>
                            <p>
                              <strong>For Illness:</strong> {supplement.forIllness}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No supplements recommended for this appointment.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
        </>
      ) : (
        <p>No previous appointments in your history.</p>
      )}
    </div>
  );

  // Render the appropriate content based on activeTab
  switch (activeTab) {
    case "Upcoming":
      return renderUpcomingAppointments();
    case "Pending":
      return renderPendingDoctors();
    case "Denied":
      return renderDeniedDoctors();
    case "Previous":
      return renderPreviousAppointments();
    default:
      return <p>Select a tab to view appointments</p>;
  }
};

export default AppointmentTab;
