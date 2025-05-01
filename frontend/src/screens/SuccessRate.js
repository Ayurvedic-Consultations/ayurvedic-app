import React from "react";
import "./SuccessRate.css"; // Ensure your CSS file is properly linked

const SuccessRate = () => {
	return (
		<div className="success-rate-wrapper">
			<div className="success-rate-container">
				<div className="success-rate-content">
					<h2 className="success-rate-title">
						Trusted by Many, Proven Results
					</h2>
					<p className="success-rate-description">
						Experience the benefits of holistic healing. Many of our users have
						noticed positive changes in just a few months. Start your journey to
						better health today!
					</p>
				</div>
				<div className="image-wrapper">
					<img
						src="https://images.unsplash.com/photo-1499728603263-13726abce5fd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDQxfF9oYi1kbDRRLTRVfHxlbnwwfHx8fHw%3D"
						alt="Holistic Healing Success"
						className="success-rate-image"
					/>
				</div>
			</div>
		</div>
	);
};

export default SuccessRate;
