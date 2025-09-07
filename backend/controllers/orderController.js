// controllers/orderController.js
const Order = require('../models/Order');
const path = require('path');
const fs = require('fs');

exports.createOrder = async (req, res) => {
  try {
    const { items, totalPrice, buyer, shippingAddress, paymentMethod } = req.body;

    // Create new order with all the checkout details
    const newOrder = new Order({
      items,
      totalPrice,
      buyer,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cashOnDelivery' ? 'pending' : 'pending',
      orderStatus: 'pending'
    });

    // If online payment, generate QR code (In real app, fetch from payment gateway)
    if (paymentMethod === 'onlinePayment') {
      // This would be replaced with actual QR code generation or fetching from payment provider
      // For demo purposes, we're just setting a placeholder path
      newOrder.paymentQR = 'uploads/qr-codes/payment-qr.png';
    }

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadPaymentProof = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Payment proof image is required' });
    }

    // Update order with payment proof
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentProof: req.file.path,
        paymentStatus: 'paid',
        orderStatus: 'processing'
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { userId, retailerId } = req.query;
    let orders;

    if (userId) {
      // Fetch orders by userId for customer-specific views
      orders = await Order.find({ 'buyer.userId': userId }).sort({ createdAt: -1 });
    } else if (retailerId) {
      // Fetch orders containing items from the specific retailer
      orders = await Order.find({
        'items.retailerId': retailerId
      }).sort({ createdAt: -1 });
    } else {
      // Fetch all orders for admin or general views
      orders = await Order.find().sort({ createdAt: -1 });
    }

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRetailerStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const order = await Order.findByIdAndUpdate(
      orderId,
      { retailerStatus: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const order = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { retailerId } = req.query;
    let orders;

    if (retailerId) {
      orders = await Order.find({ 'items.retailerId': retailerId }).sort({ createdAt: -1 });
    } else {
      orders = await Order.find().sort({ createdAt: -1 });
    }

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get reviewed orders by buyerId (with retailer BusinessNames)
exports.getReviewedOrdersByBuyerId = async (req, res) => {
  const { buyerId } = req.params;

  if (!buyerId) {
    return res.status(400).json({ error: "Buyer ID is required" });
  }

  try {
    const orders = await Order.find({
      "buyer.buyerId": buyerId,
      "review.comment": { $exists: true, $ne: null, $ne: "" }
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "items.medicineId",
        populate: {
          path: "retailerId",
          select: "BusinessName",
        },
      })
      .populate("buyer.buyerId");

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        message: "No reviewed orders found for this buyer",
      });
    }

    // 🔥 Add retailer BusinessNames just like getOrdersByBuyerId
    const enrichedOrders = orders.map(order => ({
      ...order.toObject(),
      retailers: [
        ...new Set(
          order.items
            .map(item => item.medicineId?.retailerId?.BusinessName)
            .filter(Boolean) // strip null/undefined
        ),
      ],
    }));

    return res.status(200).json({
      message: "Reviewed orders retrieved successfully for buyer",
      orders: enrichedOrders,
    });

  } catch (error) {
    console.error("❌ Error fetching reviewed orders by buyer ID:", error);
    return res.status(500).json({ error: "Server error" });
  }
};


