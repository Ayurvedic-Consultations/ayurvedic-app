import React from 'react';
import './PatientFeedback.css'; // Make sure the CSS file is named correctly
import { MessageSquareText, Star } from 'lucide-react';

// Dummy data for previously submitted feedback
// Dummy data for previously submitted feedback
const pastFeedback = [
{
 id: 1,
 date: '2025-08-15',
 doctorName: 'Dr. Jane Reed', // Added doctorName
 rating: 5,
 comment: 'Dr. Reed was extremely attentive and answered all of my questions thoroughly. I felt very well-cared for.',
 },
{
 id: 2,
 date: '2025-06-02',
 doctorName: 'Dr. Michael Chen',
 rating: 4,
 comment: 'Booking the appointment online was easy, but I had to wait about 20 minutes past my scheduled time.',
 },
 {
 id: 3,
 date: '2025-02-10',
 doctorName: 'Dr. Emily Carter',
 rating: 5, comment: 'The clinic is very clean and modern. A comfortable and professional environment.',
 },
  {
 id: 4,
  date: '2025-08-15',
  doctorName: 'Dr. Jane Reed',
  rating: 5,
 comment: 'Dr. Reed was extremely attentive and answered all of my questions thoroughly. I felt very well-cared for.',
 },
 {
 id: 5,
 date: '2025-06-02',
 doctorName: 'Dr. Michael Chen',
 rating: 4,
 comment: 'Booking the appointment online was easy, but I had to wait about 20 minutes past my scheduled time.',
 },
 {
id: 6,
 date: '2025-02-10',
 doctorName: 'Dr. Emily Carter',
 rating: 5,
 comment: 'The clinic is very clean and modern. A comfortable and professional environment.',
 }
];
 // Dummy data for previously submitted feedback


// A helper component to render the read-only stars
const StarRating = ({ rating }) => {
  return (
    <div className="star-display">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          size={18}
          className={index < rating ? 'star filled' : 'star'}
        />
      ))}
    </div>
  );
};

const Feedback = () => {
  return (
    <div className="card feedback-display-card">
      <h3>
        <MessageSquareText size={20} /> Feedback History
      </h3>

      <div className="feedback-list">
        {pastFeedback.length > 0 ? (
          pastFeedback.map((fb) => (
            <div key={fb.id} className="feedback-item-card">
              <div className="feedback-item-header">
                <span className="feedback-category">{fb.doctorName}</span>
                <span className="feedback-date">
                  {new Date(fb.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="feedback-item-rating">
                <StarRating rating={fb.rating} />
              </div>
              <p className="feedback-item-comment">"{fb.comment}"</p>
            </div>
          ))
        ) : (
          <p className="no-feedback">No feedback has been submitted yet.</p>
        )}
      </div>
    </div>
  );
};

export default Feedback;