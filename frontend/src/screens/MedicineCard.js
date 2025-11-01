// src/components/MedicineCard.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./MedicineCard.css";

const MedicineCard = ({ medicine, cart, addToCart, handleQuantityChange }) => {
  const navigate = useNavigate();
  const medicineId = medicine._id || medicine.id;

  const imageUrl =
    "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  const cartItem = cart.find((item) => item._id === medicine._id);

  // Stop propagation for any action inside the card
  const stopPropagation = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  // Handle Add to Cart
  const handleAddToCart = (e) => {
    stopPropagation(e);
    addToCart(medicine);
  };

  // Handle quantity change
  const handleQuantity = (e, delta) => {
    stopPropagation(e);
    handleQuantityChange(medicine._id, delta);
  };

  // Keyboard navigation support
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(`/medicines/${medicineId}`);
    }
  };

  return (
    <Link
      to={`/medicines/${medicineId}`}
      className="medicine-card-link"
      aria-label={`View details of ${medicine.name}`}
    >
      <article
        className="medicine-card"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="link"
      >
        {/* Image */}
        <div className="medicine-card__image-wrapper">
          <img
            src={imageUrl}
            alt={medicine.name}
            className="medicine-card__image"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="medicine-card__content">
          <h3 className="medicine-card__title">{medicine.name}</h3>
          <p className="medicine-card__price">₹{medicine.price}</p>

          {/* Prescription Badge */}
          <div className="medicine-card__prescription">
            {medicine.prescription ? (
              <span
                className="medicine-card__badge medicine-card__badge--required"
                aria-label="Prescription required"
              >
                Prescription Required
              </span>
            ) : (
              <span
                className="medicine-card__badge medicine-card__badge--optional"
                aria-label="No prescription required"
              >
                No Prescription
              </span>
            )}
          </div>

          {/* Cart Actions */}
          <div className="medicine-card__actions">
            {cartItem ? (
              <div className="medicine-card__quantity">
                <button
                  onClick={(e) => handleQuantity(e, -1)}
                  className="medicine-card__qty-btn"
                  aria-label="Decrease quantity"
                  type="button"
                >
                  −
                </button>
                <span className="medicine-card__qty-value">
                  {cartItem.quantity}
                </span>
                <button
                  onClick={(e) => handleQuantity(e, 1)}
                  className="medicine-card__qty-btn"
                  aria-label="Increase quantity"
                  type="button"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                className="medicine-card__add-btn"
                aria-label={`Add ${medicine.name} to cart`}
                type="button"
              >
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
};

export default MedicineCard;