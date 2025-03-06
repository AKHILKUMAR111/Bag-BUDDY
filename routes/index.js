const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedin");
const productModel = require("../models/product-model"); // Import Product model
const userModel = require("../models/user-model");

router.get("/",function(req,res){
    let error = req.flash("error");
    res.render("index",{error ,loggedin: false});
})

router.get("/shop",isLoggedIn,async function(req,res){
    
            // Fetch products before rendering the shop page
    const products = await productModel.find();
     let success = req.flash("success");
    res.render("shop",{products,success,loggedin: true});
})  


router.get("/cart",isLoggedIn,async function(req,res){  
    
    // Fetch products before rendering the shop page
    let user = await userModel.findOne({email:req.user.email}).populate("cart");
   
    const bill =Number(user.cart[0].price+20)-Number(user.cart[0].discount);
    res.render("cart",{user,bill});
})

router.get("/addtocart/:productid",isLoggedIn,async function(req,res){
    
    // Fetch products before rendering the shop page
    let user = await userModel.findOne({email: req.user.email});
    user.cart.push(req.params.productid);
    await user.save();
    req.flash("success","Product added to cart");
    res.redirect("/shop");
})  


module.exports = router




