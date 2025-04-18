const jwt = require("jsonwebtoken");
const ownerModel = require("../models/owner-model");

module.exports = async function (req, res, next) {
    // Check if token is missing or empty
    if (!req.cookies.admintoken || req.cookies.admintoken === "") {
        req.flash("error", "Please login to access this page");
        return res.redirect("/owners/admin");
    }
    try {
        const decoded = jwt.verify(req.cookies.admintoken, process.env.JWT_KEY);
        const admin = await ownerModel.findById(decoded.id).select("-password");

        if (!admin) {
            req.flash("error", "Unauthorized access");
            return res.redirect("/owners/admin");
        }

        req.admin = admin;
        next();
    } catch (err) {
        req.flash("error", "Something went wrong");
        return res.redirect("/owners/admin");
    }
};
