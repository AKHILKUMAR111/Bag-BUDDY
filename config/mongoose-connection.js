const mongoose = require("mongoose");
const config = require("config");

const dbgr = require("debug")("development:mongoose");
// anyname can be written above not necessarily development or mongoose
// but it should be same in app.js

// Enable mongoose debug mode to see queries
mongoose.set("debug", true);

mongoose
  .connect(config.get("MONGODB_URI"), {
    dbName: "Clusters" // Specify the database name explicitly
  })    // using ``(backtick) and $ to put dynamic values
  .then(function () {
    console.log("Connected to MongoDB Atlas ✅"); // Ensure a clear success message
    dbgr("Connected to database");      // this debug msg will not be shown until you set environment variable to show it 
    // setting environment variable:
    // 1.  $env:DEBUG="development:*"  // for windows if in powershell
    //     prints detailed log for namespace development   for any specific debug you can use the name in place of *   like development:mongoose
    // 2.  export DEBUG="development:*"  // for linux
    // removing the environment variable to stop receiving these debug logs
    // $env:DEBUG="" 
  })
  .catch(function (err) {
    console.error("Database connection error ❌", err); // Log the full error
    dbgr("Database connection error:", err);
  });


module.exports = mongoose.connection;
