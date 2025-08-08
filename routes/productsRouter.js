const express = require("express");
const router = express.Router();

const productModel = require("../models/product-model");
const isLoggedInadmin = require("../middlewares/isLoggedinadmin");
const isLoggedin = require("../middlewares/isLoggedin");
const vendorModel = require("../models/vendor-model"); //for vendor verification
const multer = require("multer");
const path = require("path");

// Temporary storage before sending to Cloudinary
const cloudinary = require("../utils/cloudinary");
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});

const upload = multer({ storage });

// Create Product Route
router.post("/createproduct/admin", upload.single("image"), async function (req, res) {
 try {

   const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "vendorRequests",
      });
  
      // Split tags by comma and trim spaces
      const tagsArray = req.body.tags
        ? req.body.tags.split(",").map(tag => tag.trim()).filter(tag => tag !== "")
        : [];
  
      const newRequest = {
        name: req.body.name,
        price: req.body.price,
        discount: req.body.discount,
        bgcolor: req.body.bgColor,
        panelcolor: req.body.panelColor,
        image: result.secure_url,
        imagePublicId: result.public_id,
        textcolor: req.body.textColor,
  
        // ✅ New fields
        category: req.body.category || "",             // Category of bag (e.g., travel, laptop, etc.)
        details: req.body.description || "",       // Detailed product description
        tags: req.body.tags
          ? req.body.tags.split(",").map(tag => tag.trim()).filter(tag => tag !== "")
          : [],                                        // Tag array
        brand: req.body.brand || "",                   // Optional brand
      };
  
    // Parse tags if sent as string
  

    // Create the product
    await productModel.create(newRequest);

   


    req.flash("success", "Vendor product created and request approved");
    res.redirect("/products/create");

  } catch (err) {
    res.send(err.message);
  }
});


router.post("/createproduct/vendor", upload.single("image"), async function (req, res) {
  try {
    const {
      name,
      price,
      discount,
      bgcolor,
      panelcolor,
      textcolor,
      vendorId,
      requestId,
      imageUrl,
      imagePublicId,
      brand,
      category,
      description,
      tags
    } = req.body;

    // Parse tags if sent as string
    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
        ? tags.split(",").map(t => t.trim()).filter(t => t)
        : [];

    // Create the product
    await productModel.create({
      image: imageUrl,
      imagePublicId: imagePublicId || "",
      name,
      price,
      discount,
      bgcolor,
      panelcolor,
      textcolor,
      brand,
      category,
      details:description,
      tags: parsedTags
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
  res.render("Admin/adminCreateproducts", { success: success, loggedin: false, create: true, admin: true });
});

// **SEARCH FUNCTIONALITY**
router.get("/search", isLoggedin, async (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");

  if (!req.cookies.token) return res.redirect("/");

  let query = req.query.query || req.query.q;
  query = query ? query.trim() : "";

  if (!query) return res.status(400).send("Search query is required.");

  try {
    const searchResults = await productModel.aggregate([
      {
        $search: {
          index: "Search",
          compound: {
            should: [
              {
                text: {
                  query: query,
                  path: ["name", "description", "tags", "brand", "category"],
                  fuzzy: {
                    maxEdits: 2,
                    prefixLength: 1,
                  },
                },
              },
            ],
          },
        },
      },
      {
        $addFields: {
          score: { $meta: "searchScore" },
        },
      },
      {
        $sort: {
          score: -1, // Highest match first
        },
      },
      {
        $project: {
          name: 1,
          price: 1,
          image: 1,
          brand: 1,
          category: 1,
          tags: 1,
          description: 1,
          discount: 1,
          bgcolor: 1,
          panelcolor: 1,
          textcolor: 1,
          score: 1,
        },
      },
      {
        $limit: 20,
      },
    ]);

    const success = req.flash("success");

    // Filter/sort options
    const sortby = req.query.sortby || "popular";
    const order = req.query.order || "asc";
    const type = req.query.type || "";
    const color = req.query.color || "";
      const material = req.query.material || ""; //  FIXED: define material
    const availability = req.query.availability || ""; //  FIXED: define availability
    const minPrice = req.query.minPrice || "";
    const maxPrice = req.query.maxPrice || "";

    res.render("User/shop", {
      products: searchResults,
      success,
      loggedin: true,
      cart: false,
      sortby,
        order,
        type,
        color,
        material,
        minPrice,
        maxPrice,
        availability
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).send("Error searching products.");
  }
});

//autocomplete
router.get("/autocomplete", async (req, res) => {
  const query = req.query.q;

  if (!query || query.trim() === "") {
    return res.status(400).json({ suggestions: [] });
  }

  try {
    const results = await productModel.aggregate([
      {
        $search: {
          index: "autocomplete", // 👈 Use the index you created
          autocomplete: {
            query: query,
            path: "name",
            fuzzy: {
              maxEdits: 1,
              prefixLength: 1,
            },
          },
        },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          _id: 0,
          name: 1,
        },
      },
    ]);

    const suggestions = results.map(product => product.name);
    res.json({ suggestions });
  } catch (err) {
    console.error("Autocomplete error:", err);
    res.status(500).json({ suggestions: [] });
  }
});

router.post("/filter",async(req,res)=>{
  
});

module.exports = router;
