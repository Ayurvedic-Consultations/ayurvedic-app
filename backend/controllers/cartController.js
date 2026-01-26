const Cart = require("../models/Cart");
const Medicine = require("../models/Medicine");

exports.getCartByPatientID = async (req, res) => {
    const { patientId } = req.params;

    try {
        if (!patientId) {
            return res.status(400).json({ message: "Patient ID is requried" });
        }

        const cartItems = await Cart.findOne({ patientId: patientId }).populate({
            path: 'items.medicineId',
            select: 'name price image retailerId',
            populate: {
                path: 'retailerId',
                select: 'BusinessName firstName lastName'
            }
        });

        if (!cartItems) {
            return res.status(200).json({
                items: [],
                totalPrice: 0,
                message: "Cart is empty"
            });
        }

        return res.status(200).json({ cartItems: cartItems });
    }
    catch (error) {
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};

exports.updateCartItemQuantity = async (req, res) => {
    const { patientId, medicineId, action } = req.body;

    try {
        if (!patientId || !medicineId || !action) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // 2. Use 'Cart' (Model) to find, and assign to 'cart' (Variable)
        const cart = await Cart.findOne({ patientId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // 3. Now use 'cart' everywhere below (it holds the database document)
        const itemIndex = cart.items.findIndex(item => item.medicineId.toString() === medicineId);

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        // This line caused your error before. Now it works because 'cart' is the document.
        let currentItem = cart.items[itemIndex];
        let newQuantity = currentItem.quantity;

        // --- Logic Remains the Same ---
        if (action === "increment") {
            newQuantity += 1;
        } else if (action === "decrement") {
            newQuantity -= 1;
        } else {
            return res.status(400).json({ message: "Invalid action" });
        }

        if (newQuantity < 1) {
            return res.status(400).json({ message: "Quantity cannot be less than 1" });
        }

        const medicineInStock = await Medicine.findById(medicineId);
        if (!medicineInStock) {
            return res.status(404).json({ message: "Medicine details not found" });
        }

        if (newQuantity > medicineInStock.quantity) {
            return res.status(400).json({
                message: `Only ${medicineInStock.quantity} units available in stock`
            });
        }

        // Apply changes to the 'cart' variable
        cart.items[itemIndex].quantity = newQuantity;

        cart.totalPrice = cart.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);

        cart.updatedAt = Date.now();

        await cart.save();

        const populatedCart = await Cart.findById(cart._id).populate({
            path: 'items.medicineId',
            select: 'name price image retailerId',
            populate: {
                path: 'retailerId',
                select: 'BusinessName firstName lastName'
            }
        });

        return res.status(200).json({
            message: "Cart updated successfully",
            cartItems: populatedCart
        });

    } catch (error) {
        console.error("Update Cart Error:", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};

exports.removeFromCart = async (req, res) => {
    const { patientId, medicineId } = req.body;

    try {
        if (!patientId || !medicineId) {
            return res.status(400).json({ message: "Patient ID and Medicine ID are required" });
        }

        // 1. Find the Cart
        const cart = await Cart.findOne({ patientId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // 2. Check if item exists (Optional, but good for validation)
        const itemExists = cart.items.some(item => item.medicineId.toString() === medicineId);
        if (!itemExists) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        // 3. Filter out the item to remove it
        cart.items = cart.items.filter(item => item.medicineId.toString() !== medicineId);

        // 4. Recalculate Total Price
        // If cart is empty, reduce returns initial value (0)
        cart.totalPrice = cart.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);

        cart.updatedAt = Date.now();

        // 5. Save Changes
        await cart.save();

        // 6. Return the updated cart (Populated)
        // We populate so the frontend receives the full object structure immediately
        const populatedCart = await Cart.findById(cart._id).populate({
            path: 'items.medicineId',
            select: 'name price image retailerId',
            populate: {
                path: 'retailerId',
                select: 'BusinessName firstName lastName'
            }
        });

        return res.status(200).json({
            message: "Item removed successfully",
            cartItems: populatedCart
        });

    } catch (error) {
        console.error("Remove Item Error:", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};

exports.addToCart = async (req, res) => {
    const { patientId, medicineId, quantity } = req.body;

    try {
        if (!patientId || !medicineId || !quantity) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // 1. Fetch medicine to check price and validity
        const medicine = await Medicine.findById(medicineId);
        if (!medicine) {
            return res.status(404).json({ message: "Medicine not found" });
        }

        // 2. Find existing cart or create new one
        let cart = await Cart.findOne({ patientId });

        if (!cart) {
            // Create new cart
            cart = new Cart({
                patientId,
                items: [{ medicineId, quantity, price: medicine.price }],
                totalPrice: 0 // Will be calculated below
            });
        } else {
            // Check if item exists
            const itemIndex = cart.items.findIndex(p => p.medicineId.toString() === medicineId);

            if (itemIndex > -1) {
                // Update quantity
                cart.items[itemIndex].quantity += quantity;
            } else {
                // Add new item
                cart.items.push({ medicineId, quantity, price: medicine.price });
            }
        }

        // 3. Recalculate Total Price
        cart.totalPrice = cart.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);

        cart.updatedAt = Date.now();
        await cart.save();

        // 4. Return populated cart
        const populatedCart = await Cart.findById(cart._id).populate({
            path: 'items.medicineId',
            select: 'name price image retailerId',
            populate: {
                path: 'retailerId',
                select: 'BusinessName firstName lastName'
            }
        });

        return res.status(200).json({
            message: "Added to cart",
            cartItems: populatedCart
        });

    } catch (error) {
        console.error("Add to Cart Error:", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};