const express=require("express");
const app=express();
require("dotenv").config();
const port=process.env.PORT || 5000
const Database=require("./config/mongoose_connection.js");
const user_router=require("./routes/user_router.js")
const admin_router=require("./routes/admin_router.js")
const cors=require("cors")
app.use(cors())
const ejs=require("ejs")
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.json());

const cookieparser = require("cookie-parser");
app.use(cookieparser());

 

app.use(express.urlencoded({ extended: true }));

Database();

app.use("/user",user_router)
app.use("/admin",admin_router)
// console.log("main file")

app.listen(port,()=>{
    console.log(`Server Running on ${port}`)
})

