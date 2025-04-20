const express = require("express");
const router = express.Router();
const isLoggedinVendor = require("../middlewares/isLoggedinvendor");
const vendorModel = require("../models/vendor-model");
const {
    registerVendor,
    loginVendor,
    logoutVendor,
}= require("../controllers/authController");




router.post("/login",loginVendor);
router.post("/register",registerVendor);
router.get("/logout",logoutVendor);

router.get("/vendor",function(req,res){

  let error = req.flash("error");
  let success = req.flash("success")
 res.render("Vendor/vender-login",{error,success,loggedin:false,admin:false,create:false,user:true});
});

router.post("/requestProduct", isLoggedinVendor, async (req, res) => {
    try {
      // Find the vendor based on their ID
      const vendor = await vendorModel.findById(req.vendor._id);
  
      // Create the new product request object
      const newRequest = {
        productName: req.body.name,
        productPrice: req.body.price,
        discount: req.body.discount,
        bgcolor: req.body.bgColor,
        panelcolor: req.body.panelColor,
        textcolor: req.body.textColor,
      };
  
      // Add the new request to the vendor's requests
      vendor.requests.push(newRequest);
      await vendor.save();
  
      // Redirect to the confirmation page with the request details
      res.redirect(`/vendors/request-confirmation/${vendor._id}`);
    } catch (err) {
      console.error("Error adding request:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });
  
  
router.get('/request-confirmation/:vendorId', async (req, res) => {
    try {
      // Find the vendor by their ID
      const vendor = await vendorModel.findById(req.params.vendorId);
  
      // Get the latest request (assuming the last one is the most recent)
      const latestRequest = vendor.requests[vendor.requests.length - 1];
  
      // Render the confirmation page with the latest request details
      res.render('Vendor/request-confirmation', { request: latestRequest });
    } catch (err) {
      console.error("Error retrieving request:", err);
      res.status(500).send("Server error");
    }
  });
  

  
  





module.exports= router;