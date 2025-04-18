const express = require("express");
const router = express.Router();
const {
    registerVendor,
    loginVendor,
    logout,
}= require("../controllers/authController");

