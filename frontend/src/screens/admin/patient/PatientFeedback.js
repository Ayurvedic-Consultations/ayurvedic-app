import React, { useState, useEffect } from 'react';
import './PatientFeedback.css';
import { MessageSquareText, Star } from 'lucide-react';

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

const Feedback = ({ patientId }) => {
	const [reviewedBookings, setReviewedBookings] = useState([]);
	const [loadingReviewedBookings, setLoadingReviewedBookings] = useState(true);
	const [reviewedOrders, setReviewedOrders] = useState([]);
	const [loadingReviewedOrders, setLoadingReviewedOrders] = useState(true);
	const [feedbackList, setFeedbackList] = useState([]);

	// ✅ Fetch reviewed bookings for a patient
	useEffect(() => {
		const fetchReviewedBookings = async () => {
			try {
				const res = await fetch(
					`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/bookings/patient/reviews/${patientId}`
				);

				if (!res.ok) {
					if (res.status === 404) {
						setReviewedBookings([]);
						return;
					}
					throw new Error("Failed to fetch reviewed bookings");
				}

				const data = await res.json();
				setReviewedBookings(data.bookings);
				console.log("Reviewed Bookings:", data.bookings);
			} catch (error) {
				console.error("❌ Error fetching reviewed bookings:", error);
			} finally {
				setLoadingReviewedBookings(false);
			}
		};

		if (patientId) fetchReviewedBookings();
	}, [patientId]);

	// ✅ Fetch reviewed orders for a buyer
	useEffect(() => {
		const fetchReviewedOrders = async () => {
			try {
				const res = await fetch(
					`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/orders/reviews/${patientId}`
				);

				if (!res.ok) {
					if (res.status === 404) {
						setReviewedOrders([]);
						return;
					}
					throw new Error("Failed to fetch reviewed orders");
				}

				const data = await res.json();
				setReviewedOrders(data.orders);
				console.log("Reviewed Orders:", data.orders);
			} catch (error) {
				console.error("❌ Error fetching reviewed orders:", error);
			} finally {
				setLoadingReviewedOrders(false);
			}
		};

		if (patientId) fetchReviewedOrders();
	}, [patientId]);

	// ✅ Merge both into one list
	useEffect(() => {
		if (!loadingReviewedBookings && !loadingReviewedOrders) {
			const bookingsFeedback = reviewedBookings.map((b) => ({
				id: b._id,
				doctorName: b.doctorName,
				date: b.dateOfAppointment || b.createdAt,
				rating: b.rating,
				comment: b.review,
				type: "Booking",
			}));

			const ordersFeedback = reviewedOrders.map((o) => ({
				id: o._id,
				doctorName: o.retailers.map(r => r).join(", "),
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