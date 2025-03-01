const express = require("express");
const router = express.Router();
const {
    registerUser,
    loginUser,
    logout,
}= require("../controllers/authController");



router.get("/",function(req,res){
    res.send("hey its working");
})


//checkout joy for below route as it will not let us to create user if any field is missing
router.post("/register",registerUser);

router.post("/login",loginUser);

router.get("/logout",logout);
module.exports= router;