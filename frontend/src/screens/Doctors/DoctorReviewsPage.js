import React, { useEffect, useState } from "react";
import "./DoctorReviewsPage.css";

const DoctorReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const doctorEmail = localStorage.getItem("email");

  useEffect(() => {
    const fetchReviews = async () => {
      const res = await fetch(`http://localhost:8080/api/bookings/reviews/${doctorEmail}`);
      const data = await res.json();
      setReviews(data);
    };
    fetchReviews();
  }, [doctorEmail]);

  return (
    <div className="doctor-reviews-container">
      <h1>My Reviews</h1>
      {reviews.length > 0 ? (
        reviews.map((r, i) => (
          <div className="review-box" key={i}>
            <h3>{r.patientName}</h3>
            <p className="stars">Rating: {r.rating}★</p>
            <p className="review">{r.review}</p>
            <p className="date">Date: {new Date(r.dateOfAppointment).toLocaleDateString()}</p>
          </div>
        ))
      ) : (
        <p>No reviews yet.</p>
      )}
    </div>
  );
};

export default DoctorReviewsPage;

