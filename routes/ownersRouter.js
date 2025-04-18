const express = require("express");
const router = express.Router();
const isLoggedInadmin = require("../middlewares/isLoggedinadmin");
const ownerModel = require("../models/owner-model");  //used.. here to move out from this folder so that it can search models folder

const vendorModel = require("../models/vendor-model");  //for vendor verification

const {
  loginadmin,logoutadmin
}= require("../controllers/authController");

console.log(process.env.NODE_ENV);
const bcrypt = require("bcrypt");




if(process.env.NODE_ENV=="development"){
    router.post("/create",async function(req,res){
      let owners = await ownerModel.find();
      if(owners.length>0){
          return res.status(500).send("Owner already exists");
      }
      let {fullname,email,password} = req.body;
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      let createdOwner=await ownerModel.create({
        fullname ,
       email ,
       password:hash,
      })
      .then(function(owner){
          res.send(owner);
      })    
    });
}




router.get("/admin",function(req,res){


     let success = req.flash("success")
    res.render("owner-login",{success,loggedin:false,admin:false,create:false,user:true});
})

router.post("/adminlogin",loginadmin);

router.get("/adminlogin",isLoggedInadmin,function(req,res){
  //send owner with it
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");

  // Check if the user is authenticated
  if (!req.cookies.admintoken) {
      return res.redirect("/owners/admin");
  }
                let success = req.flash("success","welcome to cart")
                res.render("admin",{loggedin:false,admin:true,success,create:false});
   
})

router.get("/logout",logoutadmin);

//setting environment variable to development  
//    $env:NODE_ENV=(press enter)>> "development"


//vendor creation request approval
router.get("/vendors", isLoggedInadmin, async (req, res) => {
  const vendors = await vendorModel.find({ isApproved: false });

  res.render("pending-vendors", { vendors });
});

router.post("/vendors/approve/:id", isLoggedInadmin, async (req, res) => {
  try {
    const vendor = await vendorModel.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found." });
    }

    vendor.isApproved = true;
    
    await vendor.save();

    res.status(200).json({ message: "Vendor approved successfully." });

  } catch (err) {
    console.error("Error approving vendor:", err);
    res.status(500).json({ error: "Something went wrong while approving vendor." });
  }
});

//vendor product request
// Route to view all product requests for admin
router.get('/product-requests', isLoggedInadmin, async (req, res) => {
  try {
    const vendors = await vendorModel.find();
    const requests = [];

    // Loop through each vendor to get their pending requests
    vendors.forEach(vendor => {
      vendor.requests.forEach(request => {
        // Only push requests with status "Pending"
        if (request.status === "Pending") {
          requests.push({
            vendorName: vendor.name,
            vendorEmail: vendor.email,
            requestId: request._id,
            productName: request.productName,
            productPrice: request.productPrice,
            discount: request.discount,
            bgcolor: request.bgcolor,
            panelcolor: request.panelcolor,
            textcolor: request.textcolor,
          });
        }
      });
    });

    // Pass only the pending requests to the view
    res.render('requests', { requests });
  } catch (err) {
    console.error('Error fetching requests:', err);
    res.status(500).send('Server error');
  }
});

  // Route to handle request approval
  router.get('/approve-request/:requestId', isLoggedInadmin, async (req, res) => {
    try {
      // Find the vendor and their request
      const vendor = await vendorModel.findOne({ "requests._id": req.params.requestId });
      const request = vendor.requests.id(req.params.requestId);
      let success = req.flash("Product approved");
      // Render the product creation page with the request data pre-filled
      res.render('vendorCreateproducts', {
        productName: request.productName,
        productPrice: request.productPrice,
        discount: request.discount,
        bgcolor: request.bgcolor,
        panelcolor: request.panelcolor,
        textcolor: request.textcolor,
        vendorName: vendor.name, // Optional: If you want to show the vendor name
        vendorEmail: vendor.email, // Optional: If you want to show the vendor email
        success: success, loggedin: false, create: true, admin: true, vendorId: vendor._id, requestId: request._id  ,
      });
    } catch (err) {
      console.error('Error approving request:', err);
      res.status(500).send('Server error');
    }
  });





module.exports= router;