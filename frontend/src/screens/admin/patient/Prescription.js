// Prescription.js
import React from "react";
import { Pill } from "lucide-react";

const Prescription = ({ patientBookings }) => {
  return (
    <div className="card">
      <h3>
        <Pill size={20} /> Medicines Prescribed{" "}
        <span className="badge">
          {patientBookings.reduce(
            (total, booking) =>
              total + (booking.recommendedSupplements?.length || 0),
            0
          )}
        </span>
      </h3>

      {patientBookings.length > 0 &&
        patientBookings.map((booking, bIdx) =>
          booking.recommendedSupplements.map((supp, sIdx) => (
            <div
              key={`${bIdx}-${sIdx}`}
              className="sub-card"
              style={{ width: "100%" }}
            >
              <div className="sub-card-header">
                <h4>{supp.medicineName}</h4>
                <span className="dosage">{supp.dosage}</span>
              </div>

              <div className="prescription-details">
                <div>
                  <p className="label">For</p>
                  <p>{supp.forIllness}</p>
                </div>
                <div>
                  <p className="label">Duration</p>
                  <p>{supp.duration}</p>
                </div>
                <div>
                  <p className="label">Instruction</p>
                  <p>{supp.instructions}</p>
                </div>
                <div>
                  <p className="label">Prescribed by</p>
                  <p>{booking.doctorName}</p>
                </div>
              </div>

              <p className="prescribed-date">
                ⏱ Prescribed on{" "}
                {new Date(booking.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
    </div>
  );
};

export default Prescription;
