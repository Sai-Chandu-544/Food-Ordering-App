const mongoose=require("mongoose")
const user_reg=new mongoose.Schema({
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
    }

})
 const user_registration_model=mongoose.model("users",user_reg);
 module.exports=user_registration_model;