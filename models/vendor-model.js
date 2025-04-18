const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    requests: [
        {
            productName: String,
            productPrice: Number,
            discount: {
                type: Number,
                default: 0
            },
            bgcolor: String,
            panelcolor: String,
            textcolor: String,
            status: {
                type: String,
                enum: ["Pending", "Approved", "Rejected"],
                default: "Pending"
            },
            responseMessage: String, // optional message from admin
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
});

module.exports = mongoose.model("Vendor", vendorSchema);
