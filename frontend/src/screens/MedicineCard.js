import React from "react";
import "./MedicineCard.css";

const MedicineCard = ({ medicine, cart, addToCart, handleQuantityChange }) => {
	const imageUrl = "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
	// const imageUrl = `${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/${medicine.image}`;
	const cartItem = cart.find((item) => item._id === medicine._id);

	return (
		<div className="medicine-card">
			<div className="medicine-image">
				{/* {medicine.image && (
					<img src={imageUrl} alt={medicine.name} width="160" />
				)} */}
				<img src={imageUrl} alt={medicine.name} width="160" />
			</div>

			<div className="medicine-info">
				<h4>{medicine.name}</h4>
				<p className="medicine-price">₹{medicine.price}</p>
				<div className="prescription-info">
					{medicine.prescription ? (
						<p>
							<span role="img" aria-label="required" >
								💊
							</span>{" "}
							Prescription Required
						</p>
					) : (
						<p>
							<span role="img" aria-label="not-required">
								🔓
							</span>{" "}
							Prescription Not Required
						</p>
					)}
				</div>
				{cartItem ? (
					<div className="quantity-controls">
						<button onClick={() => handleQuantityChange(medicine._id, -1)}>
							-
						</button>
						<span>{cartItem.quantity}</span>
						<button onClick={() => handleQuantityChange(medicine._id, 1)}>
							+
						</button>
					</div>
				) : (
					<button
						onClick={() => addToCart(medicine)}
						className="add-to-cart-btn"
					>
						Add to Cart
					</button>
				)}
			</div>
		</div>
	);
};

export default MedicineCard;
