import React from "react";
import "./Appointment.css"; // The new CSS file for this component
import { CalendarClock, History as HistoryIcon } from "lucide-react";

// Dummy data for a doctor's appointments
const upcomingAppointments = [
  {
    id: 1,
    date: "2025-09-10",
    time: "11:30 AM",
    patient: "John Doe",
    reason: "Follow-up Consultation",
  },
  {
    id: 2,
    date: "2025-09-10",
    time: "02:00 PM",
    patient: "Jane Smith",
    reason: "New Patient Visit",
  },
];

const pastAppointments = [
  {
    id: 3,
    date: "2025-09-02",
    patient: "Michael Brown",
    reason: "Routine Check-up",
    diagnosis: "All vitals normal. Recommended increasing Vitamin D intake.",
  },
  {
    id: 4,
    date: "2025-08-28",
    patient: "Emily White",
    reason: "General Consultation",
    diagnosis: "Diagnosed with seasonal flu. Prescribed antiviral medication.",
  },
  {
    id: 5,
    date: "2025-08-25",
    patient: "David Green",
    reason: "Persistent Cough",
    diagnosis:
      "Minor bronchial irritation due to allergies. Advised rest and allergy medication.",
  },
];

const Appointments = () => {
  return (
    <div className="card appointments-card">
      <h3>
        <CalendarClock size={20} /> My Appointments
      </h3>

      {/* Upcoming Appointments Section */}
      <div className="appointments-section">
        <h4>
          <CalendarClock size={18} /> Upcoming Schedule
        </h4>
        <div className="upcoming-list">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appt) => (
              <div key={appt.id} className="upcoming-appointment-card">
                <div className="upcoming-date">
                  <span>
                    {new Date(appt.date).toLocaleDateString("en-US", {
                      day: "numeric",
                    })}
                  </span>
                  <span>
                    {new Date(appt.date).toLocaleDateString("en-US", {
                      month: "short",
                    })}
                  </span>
                </div>
                <div className="upcoming-details">
                  <p className="patient-name">Patient: {appt.patient}</p>
                  <p className="appointment-reason">Reason: {appt.reason}</p>
                </div>
                <div className="upcoming-time">{appt.time}</div>
              </div>
            ))
          ) : (
            <p className="no-appointments">
              No upcoming appointments scheduled.
            </p>
          )}
        </div>
      </div>

      {/* Past Appointments Section - Timeline */}
      <div className="appointments-section">
        <h4>
          <HistoryIcon size={18} /> Past Visits
        </h4>
        <div className="timeline">
          {pastAppointments.map((visit) => (
            <div key={visit.id} className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <p className="timeline-patient">Patient: {visit.patient}</p>
                  <p className="timeline-date">
                    {new Date(visit.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="timeline-details">
                  <p>
                    <strong>Reason:</strong> {visit.reason}
                  </p>
                  <p>
                    {/* <strong>Diagnosis:</strong> {visit.diagnosis} */}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
