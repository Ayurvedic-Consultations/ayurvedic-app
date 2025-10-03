const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const multer = require('multer');
const fs = require('fs'); // Added missing fs import
const mongoose = require('mongoose'); // Added missing mongoose import for validation

// Configure storage for payment proof screenshots
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const dir = 'uploads/payment-proofs';
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
		cb(null, dir);
	},
	filename: function (req, file, cb) {
		cb(null, `payment-${Date.now()}-${file.originalname}`);
	}
});

const upload = multer({ storage });

// Routes with authentication middleware
router.post('/', auth, orderController.createOrder);
router.get('/', auth, orderController.getOrders);

// ✅ Specific routes should be defined before generic ones.
router.get('/getAllTransactions', auth, orderController.getAllTransactions);
router.get('/getOrdersByBuyerId/:buyerId', orderController.getOrdersByBuyerId);
router.get('/getOrdersByRetailerId/:retailerId', orderController.getOrdersByRetailerId);
router.get('/getFeedbackByRetailerId/:retailerId', orderController.getFeedbackByRetailerId);
router.get('/reviews/:buyerId', orderController.getReviewedOrdersByBuyerId);

// ✅ This generic route should be last to avoid conflicts.
router.get('/:id', auth, orderController.getOrderById);

router.put("/updateOrderReview/:orderId", orderController.updateOrderReview);
router.post('/status', auth, orderController.updateOrderStatus);
router.post('/retailer-status', auth, orderController.updateRetailerStatus);
router.post('/:orderId/payment-proof', auth, upload.single('paymentProof'), orderController.uploadPaymentProof);


module.exports = router;
