const mongoose=require("mongoose");
const admin_data=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
})
const admin_model=mongoose.model("admin_model",admin_data)
module.exports=admin_model;