const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");

module.exports = async function (req, res, next) {
    // Check if token is missing or empty
    if (!req.cookies.token || req.cookies.token === "") {
        req.flash("error", "Please login to access this page");
        return res.redirect("/");
    }
    try {
        const decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
        const user = await userModel.findById(decoded.id).select("-password");

        if (!user) {
            req.flash("error", "Unauthorized access");
            return res.redirect("/");
        }

        req.user = user;
        next();
    } catch (err) {
        req.flash("error", "Something went wrong");
        return res.redirect("/");
    }
};
