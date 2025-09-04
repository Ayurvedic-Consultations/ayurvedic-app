
import React from 'react';
import './PatientHistory.css'; // Make sure you create this new CSS file
import { History as HistoryIcon, CalendarClock, FileText } from 'lucide-react';

// Dummy data for the patient's medical history
const upcomingAppointments = [
  {
    id: 1,
    date: '2025-09-10',
    time: '11:30 AM',
    doctor: 'Dr. Evelyn Reed',
    reason: 'Follow-up Consultation',
  },
  {
    id: 2,
    date: '2025-09-25',
    time: '02:00 PM',
    doctor: 'Dr. Samuel Chen',
    reason: 'Dental Check-up',
  },
];

const pastAppointments = [
  {
    id: 3,
    date: '2025-08-28',
    doctor: 'Dr. Evelyn Reed',
    reason: 'General Consultation',
    // diagnosis: 'Diagnosed with seasonal flu. Prescribed antiviral medication.',
    // reportUrl: '#',
  },
  {
    id: 4,
    date: '2025-07-15',
    doctor: 'Dr. Marcus Thorne',
    reason: 'Annual Health Check-up',
    // diagnosis: 'All vitals normal. Recommended increasing Vitamin D intake.',
    // reportUrl: '#',
  },
  {
    id: 5,
    date: '2025-05-20',
    doctor: 'Dr. Evelyn Reed',
    reason: 'Persistent Cough',
    // diagnosis: 'Minor bronchial irritation due to allergies. Advised rest and allergy medication.',
    // reportUrl: '#',
  },
];

const History = () => {
  return (
    <div className="card history-card">
      <h3>
        <HistoryIcon size={20} /> Medical History & Appointments
      </h3>

      {/* Upcoming Appointments Section */}
      <div className="history-section">
        <h4>
          <CalendarClock size={18} /> Upcoming Schedule
        </h4>
        <div className="upcoming-list">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appt) => (
              <div key={appt.id} className="upcoming-appointment-card">
                <div className="upcoming-date">
                  <span>{new Date(appt.date).toLocaleDateString('en-US', { day: 'numeric' })}</span>
                  <span>{new Date(appt.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                </div>
                <div className="upcoming-details">
                  <p className="doctor-name">{appt.doctor}</p>
                  <p className="appointment-reason">{appt.reason}</p>
                </div>
                <div className="upcoming-time">{appt.time}</div>
              </div>
            ))
          ) : (
            <p className="no-history">No upcoming appointments scheduled.</p>
          )}
        </div>
      </div>

      {/* Past Visits Section - Timeline */}
      <div className="history-section">
        <h4>
          <HistoryIcon size={18} /> Past Visits
        </h4>
        <div className="timeline">
          {pastAppointments.map((visit) => (
            <div key={visit.id} className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <p className="timeline-doctor">{visit.doctor}</p>
                  <p className="timeline-date">
                    {new Date(visit.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="timeline-details">
                  <p><strong>Reason:</strong> {visit.reason}</p>
                  {/* <p><strong>Diagnosis / Outcome:</strong> {visit.diagnosis}</p> */}
                </div>
                {/* <a href={visit.reportUrl} className="report-btn">
                  <FileText size={16} /> View Report
                </a> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;