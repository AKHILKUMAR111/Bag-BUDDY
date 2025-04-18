const express = require("express");
const router = express.Router();
const isLoggedInadmin = require("../middlewares/isLoggedinadmin");
const ownerModel = require("../models/owner-model");  //used.. here to move out from this folder so that it can search models folder
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






module.exports= router;