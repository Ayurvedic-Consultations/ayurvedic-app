const razorpay = require("../services/razorpayService");

exports.createOrder = async (req, res) => {
    console.log("KEY-----:", process.env.RAZORPAY_KEY_ID);
    console.log("SECRET--------:", process.env.RAZORPAY_KEY_SECRET);
    try {
        const { amount } = req.body;

        console.log("KEY:", process.env.RAZORPAY_KEY_ID);
        console.log("SECRET:", process.env.RAZORPAY_KEY_SECRET);
        
        const order = await razorpay.orders.create({
            // amount: amount * 100, // rupees → paise
            amount: 1 * 100, // rupees → paise
            currency: "INR",
            receipt: "receipt_" + Date.now(),
        });

        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Order creation failed" });
    }
};