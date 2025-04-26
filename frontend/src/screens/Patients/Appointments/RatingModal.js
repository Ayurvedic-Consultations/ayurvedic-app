import React from "react";

const RatingModal = ({ isOpen, onClose, onSubmit, rating, setRating, review, setReview }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Rate Your Experience</h2>
        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${star <= rating ? "filled" : ""}`}
              onClick={() => setRating(star)}
            >
              ★
            </span>
          ))}
        </div>
        <textarea
          placeholder="Write your review (optional)"
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />
        <div className="modal-actions">
          <button onClick={onSubmit} disabled={!rating}>
            Submit
          </button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
