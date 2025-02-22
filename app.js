const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");
const ownersRouter = require("./routes/ownersRouter");
const productsRouter = require("./routes/productsRouter");
const usersRouter = require("./routes/usersRouter");


const db = require("./config/mongoose-connection");
const user = require("./models/user-model");

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,"public")));
app.set("view engione","ejs");

app.use("/owners",ownersRouter);
app.use("/users",usersRouter);  
app.use("/products",productsRouter);









app.get("/",(req,res)=>{
    res.send("working");
})
app.get("/products",(req,res)=>{
    res.send("hey its working product");
})

app.get("/user",(req,res)=>{
    res.send("hey its working product");
})

app.listen(3000);