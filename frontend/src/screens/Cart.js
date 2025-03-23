// src/components/CartScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Cart.css';
import { AuthContext } from '../context/AuthContext';

const CartScreen = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const { auth } = useContext(AuthContext); // Access auth context
  const userId = auth?.user?.id; // Get userId
  
  useEffect(() => {
    console.log("Cart Items:", cartItems);
  }, [cartItems]);
  
  // Handle proceeding to checkout
  const handleProceedToCheckout = () => {
    // Navigate to the new CheckoutScreen component
    navigate('/checkout');
  };
  
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);
  
  const handleQuantityChange = (id, delta) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item._id === id ? { ...item, quantity: Math.max(item.quantity + delta, 0) } : item
      );
      return updatedItems.filter((item) => item.quantity > 0);
    });
  };
  
  const handleRemoveItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item._id !== id));
  };
  
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  
  return (
    <div className="cart-page">
      <h1>Your Cart</h1>
      <div className="cart-items">
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          cartItems.map((item) => (
            <div key={item._id} className="cart-item">
              <img src={item.image ? `http://localhost:8080/${item.image}` : 'https://via.placeholder.com/100'} alt={item.name} />
              <div className="cart-details">
                <h3>{item.name}</h3>
                <p>Price: ₹{item.price.toFixed(2)}</p>
                <div className="quantity-controls">
                  <button onClick={() => handleQuantityChange(item._id, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleQuantityChange(item._id, 1)}>+</button>
                </div>
                <button onClick={() => handleRemoveItem(item._id)} className="remove-item-btn">Remove</button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="cart-summary">
        <h2>Total: ₹{totalPrice.toFixed(2)}</h2>
        <button 
          onClick={handleProceedToCheckout} 
          className="checkout-btn"
          disabled={cartItems.length === 0}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartScreen;