// routes/payment.js
const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedin");
const Razorpay = require("razorpay");
const userModel = require("../models/user-model");
require("dotenv").config();

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


//first route after cart(by clicking on proceed to pay)
router.get("/paymentsMethod", isLoggedIn, async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email }).populate("cart.product");

        if (!user || !user.cart.length) {
            return res.render("User/payment", { user, bill: 0 });
        }

        // Calculate total bill
        let bill = 0;
        for (const item of user.cart) {
            if (!item.product) {
                console.log("Product missing in cart");
                continue; // Skip this item
            }

            let price = item.product.price ?? 0;
            let discount = item.product.discount ?? 0;
            let quantity = item.quantity ?? 1;

            let itemTotal = (price + 20 - discount) * quantity;
            bill += itemTotal;
        }

        res.render("Payment/payment", { user, bill });
    } catch (err) {
        console.error("Payment Error:", err);
        req.flash("error", "Error fetching payment details");
        res.redirect("/shop");
    }
});


//second route when we click on oay with razorpay
router.post("/process-payment", async (req, res) => {
    const { paymentMethod, amount } = req.body;

    // Convert amount from rupees to paise (Razorpay needs paisa)
    const finalAmount = Number(amount) * 100;

    if (paymentMethod === "Cash on Delivery") {
        // Just redirect to a success page
        return res.redirect("/payment-success?method=cod");
    }

    // For UPI/Card (Online payment) create Razorpay order
    const options = {
        amount: finalAmount,
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`
    };

    try {
        const order = await instance.orders.create(options);
        // Pass order details to frontend for Razorpay checkout
        res.render("Payment/Razorpay_checkout", {
            orderId: order.id,
            amount: finalAmount,
            keyId: process.env.RAZORPAY_KEY_ID,
            paymentMethod
        });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).send("Payment initialization failed.");
    }
});

//third route invoked afted successful payment
router.get('/payment-success',isLoggedIn, async  (req, res) => {
    const method = req.query.method || "online";
     let user = await userModel.findOne({ email: req.user.email });
     // Clear the user's cart after successful payment
    await userModel.updateOne({ _id: user._id }, { cart: [] });
    res.render('Payment/payment_success', { method });
});









module.exports = router;
