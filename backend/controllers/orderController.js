// controllers/orderController.js
const Order = require('../models/Order');
const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');
const Booking = require('../models/Booking');
const Retailer = require('../models/Retailer');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const path = require('path');
const fs = require('fs');


exports.updateOrderReview = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { rating, comment, receivingDate } = req.body;


        // Validate required fields
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        // Build review object
        const reviewData = {
            rating,
            comment,
            createdAt: new Date(), // when review submitted
        };

        // Update the order
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
                $set: {
                    review: reviewData,
                    deliveredAt: receivingDate ? new Date(receivingDate) : undefined,
                    orderStatus: "delivered", 
                },
            },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({
            message: "Feedback updated successfully",
            order: updatedOrder,
        });
    } catch (error) {
        console.error("Error updating feedback:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.createOrder = async (req, res) => {
    try {
        const { items, totalPrice, buyer, shippingAddress, paymentMethod } = req.body;

        // Map frontend items to schema-required fields only
        const formattedItems = items.map(item => ({
            medicineId: item.medicineId,   // required
            quantity: item.quantity,       // required
            subTotal: item.subtotal        // required
        }));

        // Map buyer to schema-required fields
        const formattedBuyer = {
            firstName: buyer.firstName,
            lastName: buyer.lastName,
            type: buyer.type === 'patient' ? 'Patient' : 'Doctor', // ensure enum matches
            buyerId: buyer.userId           // schema expects buyerId as ObjectId
        };

        const newOrder = new Order({
            items: formattedItems,
            totalPrice,
            buyer: formattedBuyer,
            shippingAddress,
            paymentMethod,
            paymentStatus: 'pending',
            orderStatus: 'pending'
        });

        // Online payment QR code placeholder
        if (paymentMethod === 'onlinePayment') {
            newOrder.paymentQR = 'uploads/qr-codes/payment-qr.png';
        }

        await newOrder.save();

        res.status(201).json(newOrder);
    } catch (error) {
        console.error('Error creating order:', error);
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
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> update order status called");
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
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> get all orders by a given retailer id called");
        const { retailerId } = req.query;
        let orders;

        if (retailerId) {
            orders = await Order.find()
                .populate({
                    path: 'items.medicineId',
                    model: 'Medicine',
                    select: 'name retailerId price',
                    populate: {
                        path: 'retailerId',
                        model: 'Retailer',
                        select: 'firstName lastName BusinessName'
                    }
                })
                .sort({ createdAt: -1 });

            // Filter orders to include only those that contain at least one medicine with this retailerId
            orders = orders.filter(order =>
                order.items.some(item =>
                    item.medicineId?.retailerId?._id?.toString() === retailerId
                )
            );
        } else {
            orders = await Order.find()
                .populate({
                    path: 'items.medicineId',
                    model: 'Medicine',
                    select: 'name retailerId price',
                    populate: {
                        path: 'retailerId',
                        model: 'Retailer',
                        select: 'firstName lastName BusinessName'
                    }
                })
                .sort({ createdAt: -1 });
        }

        // 🔥 Add retailer + review in response (without removing anything else)
        const formattedOrders = orders.map(order => {
            const retailer =
                order.items.length > 0 && order.items[0].medicineId?.retailerId
                    ? order.items[0].medicineId.retailerId
                    : null;

            return {
                ...order.toObject(),
                retailer: retailer
                    ? {
                          firstName: retailer.firstName,
                          lastName: retailer.lastName,
                          BusinessName: retailer.BusinessName
                      }
                    : null,
                review: order.review // full review (rating, comment, createdAt, deliveredAt)
            };
        });

        res.status(200).json(formattedOrders);
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

// ✅ Get orders by buyerId (with retailer BusinessNames)
exports.getOrdersByBuyerId = async (req, res) => {
    const { buyerId } = req.params;

    if (!buyerId) {
        return res.status(400).json({ error: "Buyer ID is required" });
    }

    try {
        const orders = await Order.find({
            "buyer.buyerId": buyerId
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
                message: "No orders found for this buyer",
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
            message: "Orders retrieved successfully for buyer",
            orders: enrichedOrders,
        });

    } catch (error) {
        console.error("❌ Error fetching orders by buyer ID:", error);
        return res.status(500).json({ error: "Server error" });
    }
};

// get orders by retailerID
exports.getOrdersByRetailerId = async (req, res) => {
    const { retailerId } = req.params;

    if (!retailerId || !mongoose.Types.ObjectId.isValid(retailerId)) {
        return res.status(400).json({ error: "Invalid or missing retailer ID" });
    }

    try {
        // get all medicine ids for this retailer
        const medicines = await Medicine.find({ retailerId }).select('_id').lean();
        const medicineIds = medicines.map(m => m._id);

        if (medicineIds.length === 0) {
            return res.status(404).json({
                message: "No products found for this retailer, so no orders could be found.",
            });
        }

        const orders = await Order.find({
            'items.medicineId': { $in: medicineIds },
        })
            .sort({ createdAt: -1 })
            .populate({
                path: 'items.medicineId',
                model: 'Medicine',
                select: 'name price retailerId',
            })
            .populate({
                path: 'buyer.buyerId',
                select: 'firstName lastName email',
            })
            .lean();

        if (!orders || orders.length === 0) {
            return res.status(404).json({
                message: "No orders found for this retailer.",
            });
        }

        const ordersForRetailer = orders.reduce((acc, order) => {
            const retailerItems = (order.items || []).filter(item =>
                item.medicineId &&
                item.medicineId.retailerId &&
                item.medicineId.retailerId.toString() === retailerId
            );

            if (retailerItems.length === 0) return acc;

            const items = retailerItems.map(item => ({
                medicineId: item.medicineId._id,
                medicineName: item.medicineId.name,
                unitPrice: item.medicineId.price,
                quantity: item.quantity,
                subTotal: item.subTotal
            }));

            const retailerTotal = items.reduce((sum, it) => sum + (it.subTotal || 0), 0);

            const customerName = order.buyer?.firstName
                ? `${order.buyer.firstName} ${order.buyer.lastName || ''}`.trim()
                : (order.buyer?.buyerId?.firstName
                    ? `${order.buyer.buyerId.firstName} ${order.buyer.buyerId.lastName || ''}`.trim()
                    : 'Unknown Customer');

            acc.push({
                _id: order._id,
                customerName,
                items,
                retailerTotal,
                orderTotal: order.totalPrice,
                date: new Date(order.createdAt).toISOString(),
                status: order.orderStatus,
                shippingAddress: order.shippingAddress || null
            });

            return acc;
        }, []);

        if (ordersForRetailer.length === 0) {
            return res.status(404).json({
                message: "No orders found for this retailer.",
            });
        }

        return res.status(200).json({
            message: "Orders retrieved successfully for retailer",
            orders: ordersForRetailer,
        });
    } catch (error) {
        console.error("❌ Error fetching orders by retailer ID:", error);
        return res.status(500).json({ error: "Server error" });
    }
};



// ✅ Get feedback for a specific retailer (by retailerId)
exports.getFeedbackByRetailerId = async (req, res) => {
    const { retailerId } = req.params;

    if (!retailerId || !mongoose.Types.ObjectId.isValid(retailerId)) {
        return res.status(400).json({ error: "Invalid or missing retailer ID" });
    }

    try {
        // Find all medicine IDs associated with the given retailer
        const medicines = await Medicine.find({ retailerId }).select('_id');
        const medicineIds = medicines.map(med => med._id);

        if (medicineIds.length === 0) {
            return res.status(404).json({
                message: "No products found for this retailer.",
            });
        }

        const ordersWithFeedback = await Order.find({
            'items.medicineId': { $in: medicineIds },
            'review.comment': { $exists: true, $ne: null, $ne: '' }
        })
            .sort({ 'review.createdAt': -1 })
            .populate({
                path: 'buyer.buyerId',
                select: 'firstName lastName',
            });

        if (!ordersWithFeedback || ordersWithFeedback.length === 0) {
            return res.status(404).json({
                message: "No feedback found for this retailer.",
            });
        }

        const flattenedFeedback = ordersWithFeedback.map(order => ({
            id: order._id,
            customerName: `${order.buyer.firstName} ${order.buyer.lastName}`,
            rating: order.review.rating,
            comment: order.review.comment,
            date: order.review.createdAt,
        }));

        return res.status(200).json({
            message: "Feedback retrieved successfully for retailer",
            feedback: flattenedFeedback,
        });
    } catch (error) {
        console.error("❌ Error fetching feedback by retailer ID:", error);
        return res.status(500).json({ error: "Server error" });
    }
};

// ✅ Get all transactions
exports.getAllTransactions = async (req, res) => {
    try {
        // Fetch all orders from the database
        const orders = await Order.find({})
            .sort({ createdAt: -1 })
            .populate({
                path: 'buyer.buyerId',
                select: 'firstName lastName',
            })
            .populate({
                path: 'items.medicineId',
                select: 'retailerId',
                populate: {
                    path: 'retailerId',
                    model: 'Retailer',
                    select: 'BusinessName',
                },
            });

        // Fetch all patient-doctor bookings
        const bookings = await Booking.find({})
            .sort({ createdAt: -1 })
            .populate('patientId', 'firstName lastName')
            .populate('doctorId', 'firstName lastName');

        // Process and flatten the orders to match the frontend table structure
        const orderTransactions = orders.map((order) => {
            const fromName = `${order.buyer.firstName} ${order.buyer.lastName} (${order.buyer.type})`;
            const toName = order.items[0]?.medicineId?.retailerId?.BusinessName
                ? `${order.items[0].medicineId.retailerId.BusinessName} (Retailer)`
                : 'Unknown Retailer';

            let transactionType = 'General';
            if (order.buyer.type === 'Patient') {
                transactionType = 'Patient-Retailer';
            } else if (order.buyer.type === 'Doctor') {
                transactionType = 'Doctor-Retailer';
            }

            return {
                id: order._id,
                type: transactionType,
                date: new Date(order.createdAt).toLocaleDateString(),
                amount: order.totalPrice,
                from: fromName,
                to: toName,
            };
        });

        // Process and flatten the bookings to match the frontend table structure
        const bookingTransactions = bookings.map((booking) => {
            const fromName = `${booking.patientId?.firstName} ${booking.patientId?.lastName} (Patient)`;
            const toName = `${booking.doctorId?.firstName} ${booking.doctorId?.lastName} (Doctor)`;

            return {
                id: booking._id,
                type: 'Patient-Doctor',
                date: new Date(booking.createdAt).toLocaleDateString(),
                amount: booking.amountPaid,
                from: fromName,
                to: toName,
            };
        });

        // Combine both sets of transactions
        const allTransactions = [...orderTransactions, ...bookingTransactions];

        // Sort the combined list by date
        allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (allTransactions.length === 0) {
            return res.status(404).json({
                message: "No transactions found in the database.",
            });
        }

        res.status(200).json({ transactions: allTransactions });

    } catch (error) {
        console.error("❌ Error fetching transactions:", error);
        res.status(500).json({ error: "Server error" });
    }
};
