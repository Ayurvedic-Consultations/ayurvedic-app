// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const multer = require('multer');

// Configure storage for payment proof screenshots
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const dir = 'uploads/payment-proofs';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    cb(null, `payment-${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Routes with authentication middleware
router.post('/', auth, orderController.createOrder);
router.get('/', auth, orderController.getOrders);
router.get('/:id', auth, orderController.getOrderById);
router.post('/status', auth, orderController.updateOrderStatus);
router.post('/retailer-status', auth, orderController.updateRetailerStatus);
router.post('/:orderId/payment-proof', auth, upload.single('paymentProof'), orderController.uploadPaymentProof);
router.get('/reviews/:buyerId', orderController.getReviewedOrdersByBuyerId);

router.get('/getOrdersByBuyerId/:buyerId', orderController.getOrdersByBuyerId);

module.exports = router;