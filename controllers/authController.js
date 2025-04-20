const userModel = require("../models/user-model");  
const productModel = require("../models/product-model"); // Import Product model
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/generatetoken");
const ownerModel = require("../models/owner-model");
const vendorModel = require("../models/vendor-model");

module.exports.registerUser = async function (req, res) {
    try {
        let { fullname, email, password } = req.body;

        // Check if user already exists
        let existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // Create and save user
        let user = new userModel({ fullname, email, password: hash });
        await user.save();

        // Generate JWT token
        let token = generateToken(user);
        res.cookie("token", token, { httpOnly: true });

        res.redirect("/shop"); // Pass products to shop.ejs.
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports.loginUser = async function (req, res) {
    try {
        let { email, password } = req.body;

        // Check if user exists
        let user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        bcrypt.compare(password, user.password, async function (err, result) {
            if (err) {
                return res.status(500).json({ error: "Internal Server Error" });
            }
            if (!result) {
                return res.status(400).json({ error: "Invalid credentials" });
            }

            let token = generateToken(user);
            res.cookie("token", token, { httpOnly: true });

            res.redirect("/shop"); // Pass products to shop.ejs
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports.logout = function(req,res){
    res.cookie("token", "");
    res.redirect("/");
}; 


//ADMIN
module.exports.loginadmin = async function(req, res) {
    try {
        let { email, password } = req.body;
        
        // Use await to ensure the admin is fetched correctly
        let admin = await ownerModel.findOne({ email });

        if (!admin) {
            return res.status(400).json({ error: "Invalid credentials 1" });
        }

        bcrypt.compare(password, admin.password, async function(err, result) {
            if (err) {
                return res.status(500).json({ error: "Internal server Error" });
            } else {
                if (!result) {
                    return res.status(400).json({ error: "Invalid credentials 2" });
                }
                let admintoken = generateToken(admin);
                res.cookie("admintoken", admintoken, { httpOnly: true });
    
                res.redirect("/owners/adminlogin"); // Pass products to shop.ejs
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports.logoutadmin = function(req,res){
    res.clearCookie("admintoken");
    res.redirect("/owners/admin");
}; 


//Vendor
module.exports.loginVendor = async function (req, res) {
    try {
      
       
        const { email, password } = req.body;

        const vendor = await vendorModel.findOne({ email });
        if (!vendor) {
            return res.status(400).send("Vendor does not exist.");
        }

        const isMatch = await bcrypt.compare(password, vendor.password);
        if (!isMatch) {
            return res.status(401).send("Invalid credentials.");
        }

        if (!vendor.isApproved) {
            return res.render("Vendor/not-approved", {
                message: "Your vendor request has not been approved by the admin yet.",
            });
        }

        // Vendor is verified, login successful
        const token = generateToken(vendor);
        res.cookie("vendorToken", token, { httpOnly: true });

        res.redirect("/vendorshop");
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error.");
    }
};

module.exports.registerVendor = async function (req, res) {
    try {
        const { fullname, email, password } = req.body;

        // Check if vendor already exists
        let existingVendor = await vendorModel.findOne({ email });
        if (existingVendor) {
            return res.status(400).json({ error: "Vendor already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create unverified vendor entry
        const vendor = new vendorModel({
            name: fullname,
            email,
            password: hashedPassword,
            isVerified: false, // default
            verificationCode: null // will be set after admin approves
        });

        await vendor.save();

        // Optional: notify admin by email (or handle request listing on admin panel)
        // await sendMail(adminEmail, "New Vendor Registration Request", `Vendor: ${fullname}, Email: ${email}`);

       res.render("Vendor/register-success",);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports.logoutVendor = function(req,res){
    res.cookie("vendorToken", "");
    res.redirect("/vendors/vendor");
}; 


