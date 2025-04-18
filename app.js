const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");
const expressSession = require("express-session");
const flash = require("connect-flash");

require("dotenv").config();  //to load environment variables from .env file


const ownersRouter = require("./routes/ownersRouter");
const productsRouter = require("./routes/productsRouter");
const usersRouter = require("./routes/usersRouter");
const index =require("./routes/index");
const vendorsRouter = require("./routes/vendorsRouter");  

const db = require("./config/mongoose-connection");
const user = require("./models/user-model");
const product = require("./models/product-model");
const owner = require("./models/owner-model");

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(expressSession({
    secret: process.env.EXPRESS_SESSION_SECRET || "defaultSecretKey123",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,         // Prevents client-side JS from accessing the cookie
        maxAge: 1000 * 60 * 60, // 1 hour session duration
        secure: false           // Set to true if using HTTPS in production
    }
}));

app.use(flash());
app.use(express.static(path.join(__dirname,"public")));
app.set("view engine","ejs");

app.use("/owners",ownersRouter);
app.use("/users",usersRouter);  
app.use("/products",productsRouter); 
app.use("/",index);
app.use("/vendors",vendorsRouter)


app.listen(3000);