const mongoose = require("mongoose");
const config = require("config");
const dbgr = require("debug")("development:mongoose");

// Enable mongoose debug mode to see queries
mongoose.set("debug", true);

// Determine the MongoDB URI: prefer environment variable, fallback to config
let uri;
if (process.env.MONGODB_URI) {
  uri = process.env.MONGODB_URI;
} else {
  try {
    uri = config.get("MONGODB_URI");
  } catch (err) {
    console.error("❌ No MongoDB URI found in environment variables or config. Exiting.");
    process.exit(1);
  }
}

// Connect to MongoDB
mongoose
  .connect(uri, {
    dbName: "Clusters" // Specify the database name explicitly
  })
  .then(() => {
    console.log("Connected to MongoDB Atlas ✅");
    dbgr("Connected to database");
  })
  .catch((err) => {
    console.error("Database connection error ❌", err);
    dbgr("Database connection error:", err);
  });

module.exports = mongoose.connection;
