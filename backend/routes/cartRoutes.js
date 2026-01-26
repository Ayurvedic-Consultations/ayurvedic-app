const express = require('express');
const router = express.Router();
const { getCartByPatientID, updateCartItemQuantity, removeFromCart, addToCart } = require('../controllers/cartController');

// Route to get cart items by patient ID
router.get('/:patientId', getCartByPatientID);

// Route to update cart item quantity
router.put('/update-quantity', updateCartItemQuantity);

// Route to remove item
router.delete("/remove", removeFromCart);

// Route to add item to cart
router.post("/add", addToCart);

module.exports = router;