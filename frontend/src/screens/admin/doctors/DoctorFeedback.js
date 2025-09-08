import React, { useState, useEffect } from 'react';
import './DoctorFeedback.css';
import { MessageSquareText, Star } from 'lucide-react';

// ⭐ Read-only stars
const StarRating = ({ rating }) => (
	<div className="star-display">
		{[...Array(5)].map((_, index) => (
			<Star
				key={index}
				size={18}
				className={index < (rating || 0) ? 'star filled' : 'star'}
			/>
		))}
	</div>
);

const Feedback = ({ doctorId }) => {
	const [reviewedBookings, setReviewedBookings] = useState([]);
	const [loadingReviewedBookings, setLoadingReviewedBookings] = useState(true);

	const [reviewedOrders, setReviewedOrders] = useState([]);
	const [loadingReviewedOrders, setLoadingReviewedOrders] = useState(true);

	const [feedbackList, setFeedbackList] = useState([]);

	// ✅ Fetch reviewed bookings for doctor
	useEffect(() => {
		const fetchReviewedBookings = async () => {
			try {
				const res = await fetch(
					`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/bookings/doctor/reviews/${doctorId}`
				);

				if (!res.ok) {
					if (res.status === 404) {
						setReviewedBookings([]);
						return;
					}
					throw new Error("Failed to fetch reviewed bookings");
				}

				const data = await res.json();
				setReviewedBookings(data.bookings || []);
			} catch (error) {
				console.error("❌ Error fetching reviewed bookings:", error);
			} finally {
				setLoadingReviewedBookings(false);
			}
		};

		if (doctorId) fetchReviewedBookings();
	}, [doctorId]);

	// ✅ Fetch reviewed orders for doctor
	useEffect(() => {
		const fetchReviewedOrders = async () => {
			try {
				const res = await fetch(
					`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/orders/reviews/${doctorId}`
				);

				if (!res.ok) {
					if (res.status === 404) {
						setReviewedOrders([]);
						return;
					}
					throw new Error("Failed to fetch reviewed orders");
				}

				const data = await res.json();
				setReviewedOrders(data.orders || []);
			} catch (error) {
				console.error("❌ Error fetching reviewed orders:", error);
			} finally {
				setLoadingReviewedOrders(false);
			}
		};

		if (doctorId) fetchReviewedOrders();
	}, [doctorId]);

	// ✅ Merge both
	useEffect(() => {
		if (!loadingReviewedBookings && !loadingReviewedOrders) {
			const bookingsFeedback = reviewedBookings.map((b) => ({
				id: b._id,
				reviewerName: b.patientName, // patient gave feedback
				date: b.dateOfAppointment || b.createdAt,
				rating: b.rating,
				comment: b.review,
				type: "Patient's Review",
			}));

			const ordersFeedback = reviewedOrders.map((o) => ({
				id: o._id,
				reviewerName: o.retailers?.join(", ") || "Unknown Retailer",
				date: o.review?.createdAt || o.createdAt,
				rating: o.review?.rating,
				comment: o.review?.comment,
				type: "Order",
			}));

			const merged = [...bookingsFeedback, ...ordersFeedback].sort(
				(a, b) => new Date(b.date) - new Date(a.date)
			);

			setFeedbackList(merged);
		}
	}, [reviewedBookings, reviewedOrders, loadingReviewedBookings, loadingReviewedOrders]);

	return (
		<div className="card feedback-display-card">
			<h3>
				<MessageSquareText size={20} /> Feedback History
			</h3>

			<div className="feedback-list">
				{feedbackList.length > 0 ? (
					feedbackList.map((fb) => (
						<div key={fb.id} className="feedback-item-card">
							<div className="feedback-item-header">
								<span className="feedback-category">{fb.reviewerName}</span>
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
							<span className="feedback-type">({fb.type})</span>
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
