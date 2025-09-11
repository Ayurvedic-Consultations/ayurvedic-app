import React, { useState, useEffect } from 'react';
import './RetailerFeedbackTab.css';
import { MessageSquareText, Star, Package } from 'lucide-react';

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

const fetchFeedbackByRetailerId = async (retailerId, setFeedback, setLoading, setError) => {
	setLoading(true);
	setError(null);
	try {
		const response = await fetch(
			`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/orders/getFeedbackByRetailerId/${retailerId}`
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || 'Failed to fetch feedback.');
		}

		const data = await response.json();
		setFeedback(data.feedback);
	} catch (error) {
		console.error("❌ Error fetching retailer's feedback:", error);
		setError(error.message);
	} finally {
		setLoading(false);
	}
};

const RetailerFeedbackTab = ({ retailerId }) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [feedback, setFeedback] = useState([]);

	useEffect(() => {
		if (retailerId) {
			fetchFeedbackByRetailerId(retailerId, setFeedback, setLoading, setError);
		}
	}, [retailerId]);

	if (error) {
		return (
			<div className="no-orders-container">
				<Package size={48} className="no-orders-icon" />
				<p>{error}</p>
			</div>
		);
	}

	if (!feedback || feedback.length === 0) {
		return (
			<div className="no-orders-container">
				<Package size={48} className="no-orders-icon" />
				<h3>No Feedback Found</h3>
				<p>This retailer does not have any Feedback history yet.</p>
			</div>
		);
	}

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

