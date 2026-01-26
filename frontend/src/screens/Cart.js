import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ShoppingCart, AlertCircle } from "lucide-react";
import "./Cart.css";
import { AuthContext } from "../context/AuthContext";

const CartScreen = () => {
	const navigate = useNavigate();
	const { auth } = useContext(AuthContext);

	const [cartItems, setCartItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const patientId = auth?.user?.id;
	const token = localStorage.getItem('token');

	// --- 1. Fetch Cart from Backend ---
	useEffect(() => {
		const fetchCart = async () => {
			if (!patientId) {
				setLoading(false);
				return;
			}

			try {
				const response = await fetch(
					`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/cart/${patientId}`,
					{
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${token}`
						}
					}
				);

				if (!response.ok) {
					const errData = await response.json().catch(() => ({}));
					throw new Error(errData.message || "Failed to fetch cart");
				}

				const data = await response.json();

				// Check structure and set items
				const items = data.cartItems ? data.cartItems.items : [];
				setCartItems(items);

			} catch (err) {
				console.error("Fetch Error:", err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchCart();
	}, [patientId, token]);


	// --- 2. Handlers ---
	const handleQuantityChange = async (itemMedicineIdStr, delta) => {
		// Prevent updates if no patient ID
		if (!patientId) return;

		// Determine action string for backend
		const action = delta > 0 ? "increment" : "decrement";

		try {
			const response = await fetch(
				`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/cart/update-quantity`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`
					},
					body: JSON.stringify({
						patientId: patientId,
						medicineId: itemMedicineIdStr,
						action: action
					})
				}
			);

			const data = await response.json();

			if (!response.ok) {
				alert(data.message || "Failed to update quantity");
				return;
			}

			if (data.cartItems && data.cartItems.items) {
				setCartItems(data.cartItems.items);
			}

		} catch (err) {
			console.error("Update Error:", err);
			alert("Network error updating cart");
		}
	};

	const handleRemoveItem = async (medicineId) => {
		if (!patientId) return;

		try {
			const response = await fetch(
				`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/cart/remove`,
				{
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`
					},
					body: JSON.stringify({
						patientId: patientId,
						medicineId: medicineId
					})
				}
			);

			const data = await response.json();

			if (!response.ok) {
				alert(data.message || "Failed to remove item");
				return;
			}

			if (data.cartItems && data.cartItems.items) {
				setCartItems(data.cartItems.items);
			} else {
				// If cart is empty now
				setCartItems([]);
			}

		} catch (err) {
			console.error("Remove Error:", err);
			alert("Error removing item");
		}
	};

	const handleProceedToCheckout = () => {
		navigate('/checkout');
	};

	// Calculate Total Price
	const totalPrice = cartItems.reduce((total, item) => {
		const price = item.medicineId?.price || 0;
		return total + (price * item.quantity);
	}, 0);

	// --- 3. Render Helpers ---
	if (loading) {
		return (
			<div className="cart-page loading-container">
				<Loader2 className="animate-spin" size={48} color="#2E7D32" />
				<p>Loading your prescriptions...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="cart-page error-container">
				<AlertCircle size={48} color="#d32f2f" />
				<p>Error: {error}</p>
				<button onClick={() => window.location.reload()} className="retry-btn">Retry</button>
			</div>
		);
	}

	// Helper to get image URL safely
	const getImageUrl = (imagePath) => {
		if (!imagePath) return 'https://via.placeholder.com/100';
		if (imagePath.startsWith('http')) return imagePath;
		return `${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/${imagePath}`;
	};

	return (
		<div className="cart-page">
			<div className="cart-header">
				<h1><ShoppingCart size={32} style={{ marginRight: '10px' }} /> Your Cart</h1>
			</div>

			<div className="cart-items">
				{cartItems.length === 0 ? (
					<div className="empty-cart">
						<p>Your cart is empty.</p>
						<button onClick={() => navigate('/')} className="continue-shopping-btn">
							Browse Medicines
						</button>
					</div>
				) : (
					cartItems.map((item) => (
						<div key={item._id} className="cart-item">
							<img
								src={getImageUrl(item.medicineId?.image)}
								alt={item.medicineId?.name || "Medicine"}
							/>

							<div className="cart-details">
								<h3>{item.medicineId?.name || "Unknown Medicine"}</h3>
								<p className="item-price">Price: ₹{item.medicineId?.price?.toFixed(2)}</p>

								{item.medicineId?.retailerId?.BusinessName && (
									<p className="retailer-name">
										Sold by: {item.medicineId.retailerId.BusinessName}
									</p>
								)}

								<div className="quantity-controls">
									{/* Pass medicineId._id instead of item._id because the controller matches by medicineId */}
									<button onClick={() => handleQuantityChange(item.medicineId._id, -1)}>-</button>
									<span>{item.quantity}</span>
									<button onClick={() => handleQuantityChange(item.medicineId._id, 1)}>+</button>
								</div>

								<button
									onClick={() => handleRemoveItem(item.medicineId._id)}
									className="remove-item-btn"
								>
									Remove
								</button>
							</div>
						</div>
					))
				)}
			</div>

			{cartItems.length > 0 && (
				<div className="cart-summary">
					<div className="summary-row">
						<span>Subtotal:</span>
						<span>₹{totalPrice.toFixed(2)}</span>
					</div>
					<div className="summary-total">
						<h2>Total: ₹{totalPrice.toFixed(2)}</h2>
					</div>
					<button
						onClick={handleProceedToCheckout}
						className="checkout-btn"
					>
						Proceed to Checkout
					</button>
				</div>
			)}
		</div>
	);
};

export default CartScreen;