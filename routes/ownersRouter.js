const express = require("express");
const router = express.Router();
const ownerModel = require("../models/owner-model");  //used.. here to move out from this folder so that it can search models folder

if(process.env.NODE_ENV=="development"){
    router.post("/create",async function(req,res){
      let owners = await ownerModel.find();
      if(owners.length>0){
          return res.status(500).send("Owner already exists");
    }
    let {fullname,email,password} = req.body;
      let createdOwner=await ownerModel.create({
        fullname ,
       email ,
       password ,
      })
      .then(function(owner){
          res.send(owner);
      })    
    });
}


router.get("/",function(req,res){
    res.send("hello its working");
})

//setting environment variable to development  
//    $env:NODE_ENV=(press enter)>> "development"






module.exports= router;