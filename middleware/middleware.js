const express=require("express");
const app=express();
require("dotenv").config();
const cookieparser=require("cookie-parser")
app.use(cookieparser())
const jwt=require("jsonwebtoken");

app.use(express.json())






const middleware=(req,res,next)=>{
    try{
    //    console.log("headers",req.headers)
    const authHeader=req.headers.authorization
    const token = authHeader.split(" ")[1];
    // console.log(token)
  
 

if (!token) {
  return res.status(401).send("Login First!");
}
    
        
            const check=jwt.verify(token,process.env.SECRET_KEY)
            // console.log(check)
            next();

        }catch(err){
            if(err.name==="TokenExpiredError"){
                res.send("Session Expired, Please Login Again")
            }else{
                res.send(err)
            }
        }
        
    }
    


module.exports=middleware;