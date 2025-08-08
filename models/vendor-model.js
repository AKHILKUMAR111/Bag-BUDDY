const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  isApproved: {
    type: Boolean,
    default: false
  },

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
      imageUrl: String,
      imagePublicId: String,

      // ✅ Newly added fields
      category: String,
      description: String,
      tags: [String],
      brand: String,

      status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending"
      },
      responseMessage: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

module.exports = mongoose.model("Vendor", vendorSchema);
