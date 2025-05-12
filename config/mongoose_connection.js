const mongoose=require("mongoose")
require("dotenv").config();
//  console.log(process.env.DB_URL)

const connectDB=async()=>{
    try{
        mongoose.connect(process.env.DB_URL)
        console.log("Database Connected Successfully")
    }catch(err){
        console.log("Database Connection Failed",err)
    }
}
module.exports=connectDB;