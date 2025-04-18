const jwt = require("jsonwebtoken");
const vendorModel = require("../models/vendor-model");



module.exports = async function (req, res, next) {
    // Check if token is missing or empty
    if (!req.cookies.vendorToken || req.cookies.vendorToken === "") {
        req.flash("error", "Please login to access this page");
        return res.redirect("/vendors/vendor");
    }
    try {
        const decoded = jwt.verify(req.cookies.vendorToken, process.env.JWT_KEY);
        const vendor = await vendorModel.findById(decoded.id).select("-password");

        if (!vendor) {
            req.flash("error", "Unauthorized access");
            return res.redirect("/vendors/vendor");
        }

        req.vendor = vendor;
        next();
    } catch (err) {
        req.flash("error", "Something went wrong");
        return res.redirect("/vendors/vendor");
    }
};