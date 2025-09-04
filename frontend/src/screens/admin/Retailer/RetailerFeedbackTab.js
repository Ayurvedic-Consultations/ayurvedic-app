import React from 'react';
// Make sure this import path is correct for your project
import './RetailerFeedbackTab.css'; 
import { MessageSquareText, Star } from 'lucide-react';

// A helper component to render read-only stars
const StarRating = ({ rating }) => {
  return (
    <div className="star-display">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          size={16}
          className={index < rating ? 'star filled' : 'star'}
        />
      ))}
    </div>
  );
};

const RetailerFeedbackTab = ({ feedback = [] }) => {
  return (
    <div className="card feedback-display-card">
      <h3>
        <MessageSquareText size={22} /> Customer Feedback & Reviews
      </h3>

      <div className="feedback-list">
        {feedback.length > 0 ? (
          feedback.map((fb) => (
            <div key={fb.id} className="feedback-item-card">
              <div className="feedback-avatar">
                {fb.customerName.charAt(0)}
              </div>
              <div className="feedback-content">
                <div className="feedback-item-header">
                  <span className="customer-name">{fb.customerName}</span>
                  <span className="feedback-date">
                    {new Date(fb.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <StarRating rating={fb.rating} />
                <p className="feedback-item-comment">"{fb.comment}"</p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-feedback">
            <MessageSquareText size={40} />
            <p>No feedback has been submitted yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RetailerFeedbackTab;

