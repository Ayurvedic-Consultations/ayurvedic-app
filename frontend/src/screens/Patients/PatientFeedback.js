import React, { useEffect } from "react";       
import { useState } from "react";
import "./PatientFeedback.css";
import { Star, Calendar, Clock, Pill } from "lucide-react";

const StarIcon = (props) => <Star {...props} />;
const CalendarIcon = (props) => <Calendar {...props} />;
const ClockIcon = (props) => <Clock {...props} />;
const PillIcon = (props) => <Pill {...props} />;





const PatientFeedback = ({ sessionDetails, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating > 0) {
      onSubmit({ rating, comment });
      setRating(0);
      setComment('');
    }
  };

  const ratingMessages = {
    1: "Poor - Not satisfied with the consultation",
    2: "Fair - Below expectations",
    3: "Good - Satisfactory consultation",
    4: "Very Good - Excellent care and advice",
    5: "Excellent - Outstanding medical care"
  };

  return (
    <div className="drbfi-container">
      <div className="drbfi-card">
        <div className="drbfi-header">
          <h2 className="drbfi-title">Rate Your Doctor's Session</h2>
        </div>
        
        <div className="drbfi-content">
          {/* Session Details */}
          <div className="drbfi-session-info">
            <h3 className="drbfi-session-title">Session Details</h3>
            
            <div className="drbfi-doctor-info">
              <div className="drbfi-doctor">
                <p className="drbfi-label">Doctor</p>
                <p className="drbfi-doctor-name">{sessionDetails.doctorName}</p>
              </div>
              <div className="drbfi-date">
                <CalendarIcon className="drbfi-icon" />
                <div>
                  <p className="drbfi-label">Date</p>
                  <p className="drbfi-value">{sessionDetails.appointmentDate}</p>
                </div>
              </div>
              <div className="drbfi-time">
                <ClockIcon className="drbfi-icon" />
                <div>
                  <p className="drbfi-label">Time</p>
                  <p className="drbfi-value">{sessionDetails.appointmentTime}</p>
                </div>
              </div>
            </div>

            {/* Prescriptions */}
            {sessionDetails.prescriptions.length > 0 && (
              <div className="drbfi-prescriptions">
                <h4 className="drbfi-prescriptions-title">
                  <PillIcon className="drbfi-icon-sm" />
                  Prescriptions Given
                </h4>
                <div className="drbfi-prescription-list">
                  {sessionDetails.prescriptions.map((prescription, index) => (
                    <div key={index} className="drbfi-prescription">
                      <div className="drbfi-prescription-header">
                        <div>
                          <p className="drbfi-med-name">{prescription.medName}</p>
                          <p className="drbfi-dosage">
                            Dosage: {prescription.dosage}
                          </p>
                        </div>
                        <div className="drbfi-duration">
                          <p>Duration: {prescription.startDate} to {prescription.endDate}</p>
                          <p className="drbfi-reason">Reason: {prescription.reason}</p>
                        </div>
                      </div>
                      <p className="drbfi-instructions">
                        <strong>Instructions:</strong> {prescription.instructions}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="drbfi-form">
            <div className="drbfi-rating-section">
              <label className="drbfi-main-label">
                How would you rate this doctor's consultation?
              </label>
              <div className="drbfi-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="drbfi-star-btn"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <StarIcon
                      className={`drbfi-star-icon ${
                        star <= (hoveredRating || rating) ? 'filled' : ''
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="drbfi-rating-text">
                  {ratingMessages[rating]}
                </p>
              )}
            </div>

            <div className="drbfi-comment-section">
              <label className="drbfi-main-label">
                Share your experience (optional)
              </label>
              <textarea
                className="drbfi-textarea"
                placeholder="Please share your experience with the doctor. How was the consultation? Were your concerns addressed? Any other feedback about the treatment or care received?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <div className="drbfi-actions">
              <button
                type="submit"
                disabled={rating === 0}
                className="drbfi-btn drbfi-submit"
              >
                Submit Feedback
              </button>
              <button
                type="button"
                className="drbfi-btn drbfi-cancel"
                onClick={() => {
                  setRating(0);
                  setComment('');
                }}
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Example App component to render the feedback form
const App = () => {
    const sessionDetails = {
        doctorName: 'Dr. Emily Carter',
        appointmentDate: '2023-10-27',
        appointmentTime: '10:30 AM',
        prescriptions: [
            {
                medName: 'Amoxicillin 500mg',
                instructions: 'Take one capsule every 8 hours with food for 7 days.',
                dosage: '500mg',
                startDate: '2023-10-27',
                endDate: '2023-11-03',
                reason: 'Bacterial Infection'
            },
            {
                medName: 'Ibuprofen 200mg',
                instructions: 'Take one tablet as needed for pain, up to 3 times a day.',
                dosage: '200mg',
                startDate: '2023-10-27',
                endDate: '2023-11-10',
                reason: 'Pain and Inflammation'
            }
        ]
    };

    const handleFeedbackSubmit = (feedback) => {
        console.log('Feedback Submitted:', feedback);
        // In a real app, you'd likely not use alert. This is for demonstration.
        alert(`Thank you for your feedback!\nRating: ${feedback.rating}\nComment: ${feedback.comment}`);
    };

    return (
        <>

            <PatientFeedback 
                sessionDetails={sessionDetails} 
                onSubmit={handleFeedbackSubmit} 
            />
        </>
    );
}

export default App;