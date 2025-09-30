import React, { useState } from "react";
import { Star, Calendar, MessageSquare, ShoppingBag } from "lucide-react";
import { Frown, Meh, Smile, Laugh } from "lucide-react";

import "./BuyerFeedback.css";

const BuyerFeedback = () => {
  // ✅ Demo data (replace this with your API/backend data later)
  const retailerName = "MediCare Pharmacy";
  const orderNumber = "ORD-20250928";
  const orderPlacedOn = "28 Sept 2025";
  const orderItems = [
    {
      medicineName: "Paracetamol 500mg",
      quantity: 2,
      unitPrice: 25,
      totalPrice: 50,
    },
    {
      medicineName: "Vitamin C Tablets",
      quantity: 1,
      unitPrice: 120,
      totalPrice: 120,
    },
    { medicineName: "Cough Syrup", quantity: 1, unitPrice: 85, totalPrice: 85 },
  ];
  const totalAmount = 255;

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [receivingDate, setReceivingDate] = useState("");

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating > 0) {
      const feedbackData = { rating, comment, receivingDate };
      console.log("✅ Feedback Submitted:", feedbackData);

      // Reset form
      setRating(0);
      setComment("");
      setReceivingDate("");
    }
  };

  return (
    <div className="bf-containerr">
      <div className="bf-card">
        {/* Header */}
        <div className="bf-header">
          <h2 className="bf-title">Rate Your Experience</h2>
          <div className="bf-order-info">
            <p>
              <ShoppingBag size={16} /> <strong>Retailer:</strong>{" "}
              <span>{retailerName}</span>
            </p>
            <p>Order #{orderNumber}</p>
            <p>Order Placed: {orderPlacedOn}</p>
          </div>

          {/* Order items */}
          <div className="bf-order-items">
            <h4>Order Items:</h4>
            {orderItems.map((item, i) => (
              <div key={i} className="bf-item">
                <div>
                  <p className="bf-item-name">{item.medicineName}</p>
                  <p className="bf-item-price">
                    {formatCurrency(item.unitPrice)} × {item.quantity}
                  </p>
                </div>
                <p className="bf-item-total">
                  {formatCurrency(item.totalPrice)}
                </p>
              </div>
            ))}
            <div className="bf-total">
              <p>Total Amount:</p>
              <p className="bf-total-amount">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        <form className="bf-form" onSubmit={handleSubmit}>
          {/* Rating */}
          <div className="bf-rating-section">
            <label>How would you rate this retailer?</label>
            <div className="bf-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="bf-star-btn"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`bf-star ${
                      star <= (hoveredRating || rating)
                        ? "bf-star-filled"
                        : "bf-star-empty"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              // Inside your component return:
              <p className="bf-rating-text">
                {rating === 1 && (
                  <span className="bf-rating-item">
                    <Frown className="bf-rating-icon bf-icon-poor" />
                    Poor - Not satisfied with the service
                  </span>
                )}
                {rating === 2 && (
                  <span className="bf-rating-item">
                    <Meh className="bf-rating-icon bf-icon-fair" />
                    Fair - Below expectations
                  </span>
                )}
                {rating === 3 && (
                  <span className="bf-rating-item">
                    <Smile className="bf-rating-icon bf-icon-good" />
                    Good - Met expectations
                  </span>
                )}
                {rating === 4 && (
                  <span className="bf-rating-item">
                    <Laugh className="bf-rating-icon bf-icon-verygood" />
                    Very Good - Exceeded expectations
                  </span>
                )}
                {rating === 5 && (
                  <span className="bf-rating-item">
                    <Star className="bf-rating-icon bf-icon-excellent" />
                    Excellent - Outstanding service
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Receiving Date */}
          <div>
            <label>
              <Calendar size={16} /> When did you receive the order?
            </label>
            <input
              type="date"
              className="bf-input"
              value={receivingDate}
              onChange={(e) => setReceivingDate(e.target.value)}
            />
          </div>

          {/* Comment */}
          <div>
            <label>
              <MessageSquare size={16} /> Share your experience (optional)
            </label>
            <textarea
              className="bf-textarea"
              placeholder="Tell us about packaging, delivery, etc."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="bf-actions">
            <button
              type="submit"
              className="bf-btn-primary"
              disabled={rating === 0}
            >
              Submit Feedback
            </button>
            <button
              type="button"
              className="bf-btn-outline"
              onClick={() => {
                setRating(0);
                setComment("");
                setReceivingDate("");
              }}
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuyerFeedback;
