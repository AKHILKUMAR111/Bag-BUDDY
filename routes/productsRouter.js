const express = require("express");
const router = express.Router();
const upload = require("../config/multer-config");
const productModel = require("../models/product-model");
const isLoggedInadmin = require("../middlewares/isLoggedinadmin");
const isLoggedin = require("../middlewares/isLoggedin");
const vendorModel = require("../models/vendor-model"); //for vendor verification
// Create Product Route
router.post("/createproduct/admin", upload.single("image"), async function (req, res) {
  try {
    const { name, price, discount, bgcolor, panelcolor, textcolor } = req.body;

    await productModel.create({
      image: req.file.buffer,
      name,
      price,
      discount,
      bgcolor,
      panelcolor,
      textcolor,
    });

    req.flash("success", "Product created successfully by admin");
    res.redirect("/products/create");
  } catch (err) {
    res.send(err.message);
  }
});

router.post("/createproduct/vendor", upload.single("image"), async function (req, res) {
  try {
    const { name, price, discount, bgcolor, panelcolor, textcolor, vendorId, requestId } = req.body;

    // Create the product
    await productModel.create({
      image: req.file.buffer,
      name,
      price,
      discount,
      bgcolor,
      panelcolor,
      textcolor,
    });

    // ✅ Update vendor request status to "Approved"
    if (vendorId && requestId) {
      const vendor = await vendorModel.findById(vendorId);
      if (vendor) {
        const request = vendor.requests.id(requestId);
        if (request) {
          request.status = "Approved"; // ✅ Capitalized to match enum
          await vendor.save();
        }
      }
    }

    req.flash("success", "Vendor product created and request approved");
    res.redirect("/products/create");
  } catch (err) {
    res.send(err.message);
  }
});




// Render Create Product Page
router.get("/create", isLoggedInadmin, function (req, res) {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");

  // Check if the user is authenticated
  if (!req.cookies.admintoken) {
    return res.redirect("/owners/admin");
  }


  let success = req.flash("success"); //only retrives success if came from differnt route like her in first vist ir will display welcome to cart that was set in owner/adminlogin route and when i came here from there this success message is retrived and sent to ejs 
  //but when i come here from createproducts route it will display the message set on that route that is " product created "
  //conclusion:  flsh messaeges set on current route are used in next route and it have two arguments first: type of message and second: message  
  //why use this 
    //if i want a message to be displayed when i first visit this route from other route but not ehn i reload it again
  res.render("adminCreateproducts", { success: success, loggedin: false, create: true, admin: true });
});

// **SEARCH FUNCTIONALITY**
router.get("/search",isLoggedin, async (req, res) => {

  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
  
    // Check if the user is authenticated
    if (!req.cookies.token) {
        return res.redirect("/");
    }
  let query = req.query.query || req.query.q; // Handle both "query" and "q"
  query = query ? query.trim() : ""; // Remove extra spaces and newlines

  console.log("Final extracted query:", JSON.stringify(query)); // Debugging log

  if (!query) return res.status(400).send("Search query is required.");

  try {
      let searchProducts = await productModel.aggregate([
        {
          $search: {
              index: "search", // Make sure this matches the correct index name
              text: {
                  query: query,
                  path: "name", // Ensure "name" is indexed
                  fuzzy: { maxEdits: 2, prefixLength: 1 } // Allow typos
              }
          }
        },
        {
          $addFields: { score: { $meta: "searchScore" } } // Extract search relevance score
        },
        {
          $sort: { score: -1 } // Sort by highest similarity first
        }
      ]);

      console.log("Search Results:", searchProducts);
      let success = req.flash("success");


      //default params
      // default params for sortBy
    const sortby = req.query.sortby || 'popular';
    const order = req.query.order || 'asc';

    // Get filter query values (default to empty if not set)
    const type = req.query.type || '';
    const color = req.query.color || '';
    const material = req.query.material || '';
    const minPrice = req.query.minPrice || '';
    const maxPrice = req.query.maxPrice || '';
    const availability = req.query.availability || '';

    
      res.render("shop", { products: searchProducts,       success,
        loggedin: true,
        cart: false,
        sortby,
        order,
        type,
        color,
        material,
        minPrice,
        maxPrice,
        availability});

  } catch (err) {
      console.error("Search error:", err);
      res.status(500).send("Error searching products.");
  }
});




module.exports = router;
