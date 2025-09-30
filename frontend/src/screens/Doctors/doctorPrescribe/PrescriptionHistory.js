import React from 'react';
import { 
    Pill, 
    CheckCircle2, 
    XCircle, 
    CalendarDays, 
    Clock, 
    Info,
    ClipboardList,
    Stethoscope
} from 'lucide-react';
import './PrescriptionHistory.css';

// --- Helper Functions ---

// Formats a date string into a more readable format (e.g., "Sep 28, 2025")
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};


// --- Sub-components ---

// A reusable component for displaying a detail item with an icon
const DetailItem = ({ icon: Icon, text }) => (
    <div className="record-item">
        <Icon className="record-item-icon" />
        <span>{text}</span>
    </div>
);

// Renders a single prescription card
const RecordCard = ({ record }) => {
    const isActive = record.isActive;
    const badgeClassName = `record-badge ${isActive ? 'active' : 'completed'}`;
    const cardClassName = `record-card ${!isActive ? 'past-record' : ''}`;

    return (
        <div className={cardClassName}>
            <div className="record-content">
                <div className="record-header">
                    <div className="record-title-group">
                        <Pill className="pill-icon" />
                        <h4 className="record-title">{record.medicineName}</h4>
                    </div>
                    <span className={badgeClassName}>
                        {isActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {isActive ? 'Active' : 'Completed'}
                    </span>
                </div>

                <div className="record-details">
                    <DetailItem 
                        icon={CalendarDays} 
                        text={`${formatDate(record.startDate)} - ${formatDate(record.endDate)}`} 
                    />
                    <DetailItem 
                        icon={Clock} 
                        text={record.dosage} 
                    />
                    <div className="record-item-block">
                        <div className="record-item">
                           <Info className="record-item-icon" />
                           <p className="record-reason"><strong>Reason:</strong> {record.reason}</p>
                        </div>
                    </div>
                     <div className="record-item-block">
                        <div className="record-item">
                           <ClipboardList className="record-item-icon" />
                           <p className="record-instructions"><strong>Instructions:</strong> {record.instructions}</p>
                        </div>
                    </div>
                    <p className="record-prescribed-by">
                        <Stethoscope className="record-item-icon" />
                        Prescribed by {record.prescribedBy} on {formatDate(record.prescribedDate)}
                    </p>
                </div>
            </div>
        </div>
    );
};


// --- Main Component ---

export function PrescriptionHistory({ records = [] }) {
  const activeRecords = records.filter(record => record.isActive);
  const pastRecords = records.filter(record => !record.isActive);

  return (
    <div className="prescription-history-container">

      {/* Active Prescriptions Section */}
      <div className="history-section">
        <div className="section-header">
          <h3 className="section-title">
            <CheckCircle2 className="section-icon active-icon" />
            Active Prescriptions ({activeRecords.length})
          </h3>
        </div>
        <div className="record-list">
          {activeRecords.length > 0 ? (
            activeRecords.map((record) => (
              <RecordCard key={record.id} record={record} />
            ))
          ) : (
            <p className="empty-state">No active prescriptions found.</p>
          )}
        </div>
      </div>

      {/* Past Prescriptions Section */}
      <div className="history-section">
        <div className="section-header">
          <h3 className="section-title">
            <XCircle className="section-icon past-icon" />
            Past Prescriptions ({pastRecords.length})
          </h3>
        </div>
        <div className="record-list">
          {pastRecords.length > 0 ? (
            pastRecords.map((record) => (
              <RecordCard key={record.id} record={record} />
            ))
          ) : (
            <p className="empty-state">No past prescription records available.</p>
          )}
        </div>
      </div>
      
    </div>
  );
}