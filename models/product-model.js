const mongoose =require("mongoose")


const productSchema = mongoose.Schema({
  image: String,
  name: String, // e.g., "Urban Pro Duffle Bag"
  price: Number,
  discount: {
    type: Number,
    default: 0
  },
  bgcolor: String,
  panelcolor: String,
  textcolor: String,

  //  New fields for Search
  brand: String,      // e.g., "Nike", "Puma"
  color: String,      // e.g., "Black", "Red"
  category: String,   // e.g., "Gym Bag", "Travel Bag", "Sling Bag"
  tags: [String],     // e.g., ["duffle", "nike", "gym", "urban", "pro"]
  details: String     // A full description like: "Spacious waterproof duffle for gym, travel, and sports"
});



module.exports = mongoose.model("product",productSchema);
