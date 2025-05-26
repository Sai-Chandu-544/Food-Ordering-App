const mongoose=require("mongoose");
const data=new mongoose.Schema({
    Recipe_ID:{
        type:Number,
        required:true
    },
    Title:{
        type:String,
        required:true
    },
    Description:{
        type:String,
        required:true
    },
    Cuisine_Type:{
        type:String,
        required:true,
        enum:["South Indian","North Indian","Italian","Japanese","American","Chinese",]
    },
    Image_Url:{
        type:String,
        required:true
    },
    Discount:{
        type:String,
        required:true
    },
    Price:{
        type:Number,
        required:true
    },
    Category:{
        type:String,
        required:true,
        enum:["Veg","Non-Veg"]
    }
   

});
const data_model=mongoose.model("data_model",data);
module.exports=data_model;