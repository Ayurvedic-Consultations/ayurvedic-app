import React from 'react';
import './Precription.css';
import { Pill } from 'lucide-react';

const patient = {
  prescriptions: [
    {
      id: 1,
      medicine: 'Amoxicillin',
      dosage: '500 mg',
      frequency: 'Twice daily',
      duration: '7 days',
      instruction: 'Take with food.',
      doctorName: 'Dr. Evelyn Reed',
      prescribedDate: '2025-08-20',
    },
    {
      id: 2,
      medicine: 'Ibuprofen',
      dosage: '200 mg',
      frequency: 'As needed',
      duration: '1 week',
      instruction: 'after lunch',
      doctorName: 'Dr. Michael Chen',
      prescribedDate: '2025-08-15',
    },
    {
      id: 3,
      medicine: 'Loratadine',
      dosage: '10 mg',
      frequency: 'Once daily',
      duration: '30 days',
      instruction: 'Take in the morning.',
      doctorName: 'Dr. Evelyn Reed',
      prescribedDate: '2025-07-10',
    },
  ],
};

const DoctorPrescriptions = () => {
  return (
    <div className="card prescriptions-card">
      <h3>
<Pill size={20} /> Medicines Prescribed         {/* <span className="badge">{patient.prescriptions.length}</span> */}
      </h3>
      {patient.prescriptions.length > 0 ? (
        patient.prescriptions.map((p) => (
          <div key={p.id} className="sub-card">
            <div className="sub-card-header">
              <h4>{p.medicine}</h4>
              <span className="dosage">{p.dosage}</span>
            </div>
            <div className="prescription-details">
              <div>
                <p className="label">Frequency</p>
                <p>{p.frequency}</p>
              </div>
              <div>
                <p className="label">Duration</p>
                <p>{p.duration}</p>
              </div>
              <div>
                <p className="label">Instruction</p>
                <p>{p.instruction}</p>
              </div>
              <div>
                <p className="label">Patient Name</p>
                <p>John Doe</p>
              </div>
            </div>
            <p className="prescribed-date">
              <span role="img" aria-label="clock">⏱</span> Prescribed on {new Date(p.prescribedDate).toLocaleDateString()}
            </p>
          </div>
        ))
      ) : (
        <p className="no-prescriptions">No prescriptions have been issued for this patient.</p>
      )}
    </div>
  );
};

export default DoctorPrescriptions;