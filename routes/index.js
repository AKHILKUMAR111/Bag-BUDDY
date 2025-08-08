const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedin");
const productModel = require("../models/product-model"); // Import Product model
const userModel = require("../models/user-model");
const isLoggedinVendor = require("../middlewares/isLoggedinvendor");
const vendorModel = require("../models/vendor-model");
router.get("/", function (req, res) {

    let error = req.flash("error");
    res.render("index", { error, loggedin: false, admin: false, create: false, user: false });
})

router.get("/shop", isLoggedIn, async function (req, res) {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    // Check if the user is authenticated
    if (!req.cookies.token) {
        return res.redirect("/");
    }

    // default params for sortBy
    const sortby = req.query.sortby || 'popular';
    const order = req.query.order || 'asc';

    // Get filter query values (default to empty if not set)
    const type = req.query.type || '';
    const color = req.query.color || '';
    const tag = req.query.tag || '';
    const minPrice = req.query.minPrice || '';
    const maxPrice = req.query.maxPrice || '';
    const availability = req.query.availability || '';

    // Fetch products before rendering the shop page
    const query = {};

    if (type) query.type = type;
    if (color) query.color = color;
    if (tag) query.tags = tag;
    if (availability) query.availability = availability;

    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Add sort logic
    let sortOption = {};
    if (sortby === 'price') {
        sortOption.price = order === 'asc' ? 1 : -1;
    } else if (sortby === 'name') {
        sortOption.name = order === 'asc' ? 1 : -1;
    } else {
        sortOption.createdAt = -1; // default to newest/popular
    }

    const products = await productModel.find(query).sort(sortOption);



    //  
    let success = req.flash("success");
    res.render("User/shop", {
        products,
        success,
        loggedin: true,
        cart: false,
        sortby,
        order,
        type,
        color,
        tag,
        minPrice,
        maxPrice,
        availability
    });
});

router.get("/vendorshop", isLoggedinVendor, async (req, res) => {
    try {
        res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
        res.set("Pragma", "no-cache");
        res.set("Expires", "0");

        // Check if the user is authenticated
        if (!req.cookies.vendorToken) {
            return res.redirect("/");
        }
        const vendor = await vendorModel.findById(req.vendor._id).lean();

        if (!vendor) {
            return res.status(404).send("Vendor not found");
        }

        const requests = vendor.requests || [];

        res.render("Vendor/vendorshop", { vendorName: vendor.name, requests });
    } catch (err) {
        console.error("Error loading vendor shop:", err);
        res.status(500).send("Something went wrong");
    }
});



//redirecting to cart after some calculations of bill 
router.get("/cart", isLoggedIn, async function (req, res) {
    try {
        // Fetch user and populate product details in cart
        let user = await userModel.findOne({ email: req.user.email }).populate("cart.product");

        if (!user || !user.cart.length) {
            return res.render("User/cart", { user, bill: 0, cart: true });
        }

        // Calculate total bill

        let bill = 0;
        for (const item of user.cart) {
            if (!item.product) {
                console.log("Product missing in cart");
                continue; // Skip this item
            }

            let price = item.product.price ?? 0;
            let discount = item.product.discount ?? 0;
            let quantity = item.quantity ?? 1;

            let itemTotal = (price + 20 - discount) * quantity;
            console.log(`Adding item: ${itemTotal}, Total so far: ${bill + itemTotal}`);

            bill += itemTotal;
        }

        console.log("Final Bill:", bill);


        res.render("User/cart", { user, bill, cart: true });
    } catch (err) {
        console.error("Cart Error:", err);
        req.flash("error", "Error fetching cart details");
        res.redirect("/shop");
    }
});

//increasing or decresing porduct quantity when in cart
router.get("/quantity/:IorD/:productid", isLoggedIn, async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email });
        if (!user) {
            console.error("User not found");
            req.flash("error", "User not found");
            return res.redirect("/shop");
        }

        if (!user.cart) {
            user.cart = []; // Initialize cart if it doesn't exist
        }

        let existingProduct = user.cart.find(item => item.product && item.product.toString() === req.params.productid);
        if (existingProduct) {
            console.log("Product already in cart, increasing quantity");
            if (req.params.IorD == "increase") {
                existingProduct.quantity += 1;
            }
            else {
                if (existingProduct.quantity <= 1) {


                    // Now update the database
                    await userModel.updateOne(
                        { _id: user._id },
                        { $pull: { cart: { product: req.params.productid } } }
                    );
                } else {
                    // Decrease the quantity in memory first
                    existingProduct.quantity -= 1;
                }
            }



        } else {
            console.log("Adding new product to cart");
            user.cart.push({ product: req.params.productid, quantity: 1 });
        }

        await user.save();
        console.log("Cart after adding:", user.cart);

        res.redirect("/cart");

    }
    catch (err) {
        console.error("Error adding to cart:", err);
        req.flash("error", "Could not add product to cart");
        res.redirect("/shop");
    }
});

//adding product to cart when in shop
router.get("/addtocart/:productid", isLoggedIn, async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email });

        if (!user) {
            console.error("User not found");
            req.flash("error", "User not found");
            return res.redirect("/shop");
        }

        if (!user.cart) {
            user.cart = []; // Initialize cart if it doesn't exist
        }

        console.log("Cart before adding:", user.cart);

        let existingProduct = user.cart.find(item => item.product && item.product.toString() === req.params.productid);

        if (existingProduct) {
            console.log("Product already in cart, increasing quantity");
            existingProduct.quantity += 1;
        } else {
            console.log("Adding new product to cart");
            user.cart.push({ product: req.params.productid, quantity: 1 });
        }

        await user.save();
        console.log("Cart after adding:", user.cart);

        req.flash("success", "Product added to cart");
        res.redirect("/shop");
    } catch (err) {
        console.error("Error adding to cart:", err);
        req.flash("error", "Could not add product to cart");
        res.redirect("/shop");
    }
});

//payment pag


//sorting route
router.get("/sort", isLoggedIn, async (req, res) => {
    let { sortby, order } = req.query;
    let error = req.flash("error");
    let success = req.flash("success");

    try {
        let user = req.user;
        if (!user) return res.redirect("/shop");

        // Default to ascending if not specified
        order = order === "desc" ? -1 : 1;

        // If sortby is empty or invalid, load normally
        if (!sortby) return res.redirect("/shop");

        const products = await productModel.find().sort({ [sortby]: order });

        res.render("shop", {
            products,
            success,
            error,
            loggedin: true,
            cart: false,
            sortby,
            order: order === 1 ? "asc" : "desc" // pass for keeping selection on reload
        });
    } catch (err) {
        console.log("Sorting Error:", err);
        req.flash("error", "Unable to sort products");
        res.redirect("/shop");
    }
});

module.exports = router




