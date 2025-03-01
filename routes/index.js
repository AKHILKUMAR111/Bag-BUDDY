const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedin");
const productModel = require("../models/product-model"); // Import Product model

router.get("/",function(req,res){
    let error = req.flash("error");
    res.render("index",{error});
})

router.get("/shop",isLoggedIn,async function(req,res){
    
            // Fetch products before rendering the shop page
    const products = await productModel.find();
    res.render("shop",{products});
})  



module.exports = router




