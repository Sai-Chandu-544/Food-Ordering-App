const express=require("express");
const app=express();
const cors=require("cors")

require("dotenv").config();
const admin_model=require("../models/admin_model.js")
const data=require("./../models/data.js");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const user_registration_model = require("../models/user_registration.js");


app.use(express.json());







module.exports.admin_register=async (req,res)=>{
    
    try{
        
    const {name,email,password}=req.body;
    if(!name){
        return res.send("name Field is Required")
    }if(!email){
        return res.send("email Field is Required")
    }
    if(!password){
        return res.send("password Field is Required")
    }
    const admin= await admin_model.findOne({email:email})
    if(admin){
        return res.send("Admin already registered")
    }
     const gen_salt=await bcrypt.genSalt(10)
     const gen_hash= await bcrypt.hash(password,gen_salt)
     const admin_info=  new admin_model({
        name,
        email,
        password:gen_hash
    })
    const admin_saved= await admin_info.save();
    // console.log(admin_saved)
    res.status(200).send("Data Saved")

    }catch(err){
        console.error("Admin Registration Error:", err);
        res.status(500).send("Internal server error");

    }
   
}
module.exports.admin_login=async (req,res)=>{
   
    try{
    const {email,password}=req.body;
    if(!email || !password){
        return res.send("Feild is Required")
    }
    const admin=await admin_model.findOne({email:email})
        if(!admin){
            return res.send("Please Register!")
        }
       const result= await bcrypt.compare(password,admin.password)
       if(result){
        const token=jwt.sign({email:admin.email},process.env.SECRET_KEY,{expiresIn:"1h"})
    

      console.log("Login Successfull")
        res.json({ token }); // Send token in response body to client and then client set in localstorage and client set according to it
    
  
       


      
    

      }
    }catch(err){
        console.log("Login Error",err)
        res.status(400).send("Login Failed!")
    }
}
module.exports.admin_logout=(req,res,next)=>{
    res.cookie("token","")
    res.send("You are logged Out")
    console.log("You are logged Out")
    next()

}
module.exports.admin_result=async (req,res)=>{
    try{
        const {Recipe_ID,Title,Description,Cuisine_Type,image_url,Discount,Price, Category}=req.body;
        if(Recipe_ID===undefined || Price===undefined|| !Title || !Description || !Cuisine_Type ||!image_url||!Discount || !Category){ 
//             console.log("Request body:");
// console.log("Recipe_ID:", Recipe_ID);
// console.log("Title:", Title);
// console.log("Description:", Description);
// console.log("Cuisine_Type:", Cuisine_Type);
// console.log("image_url:", image_url);
// console.log("Discount:", Discount);
// console.log("Price:", Price);
// console.log("Category:", Category);
             //Recipe_Id and Price is a number, you should not use a simple truthy check, as 0 would be considered falsy. Instead, you should explicitly check for undefined.
            return res.send("Field is Required")
        }
        const product= await data.findOne({Recipe_ID:Recipe_ID})
        if(product){
            console.log("Recipe_id should not be Duplicate")
            return res.send("Recipe_id should not be Duplicate")
        }
        const details= new data({
            Recipe_ID,
            Title,
            Description,
            Cuisine_Type,
            image_url,
            Discount,
            Price, 
            Category

        })
        const data_saved= await details.save();
        // console.log(data_saved)
        res.status(200).send("Product Added Successfully")
   

    }catch (error) {
        if (error.name === 'ValidationError') {
          return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Server error' });
      }


    

}
module.exports.admin_update= async (req,res)=>{
    try{
        const {Title}=req.params;
        // console.log(Title)
        const update_item=req.body;
        const response=await data.findOneAndUpdate({Title:Title},update_item,{
        new:true,
        runvalidator:true
    })
    // console.log(response)
    res.status(200).send("Record Updated Successfully")

    if (!response) {
        return res.status(404).send("No record found with that email"); //Accepts only one argument.
    }

    }catch(err){
        res.status(400).json({message:"Internal Server Error",
            err:err.message})

    }
    
    
                                                  
}
module.exports.admin_delete= async (req,res)=>{
    try{
        const {foodName}=req.params;
        console.log(foodName)
        if(!foodName){
            return res.send("Value is Undefined!")
        }
        const delete_item= await data.findOneAndDelete({Title:foodName})
        // console.log(delete_item)
        res.status(200).send("Record Deleted Successfully")
       if(!delete_item){
        return res.send("Record not Found!")
       }
    }catch(err){
        res.status(400).json({message:"Internal Server Error",err:err.message})

    }
    

}
module.exports.admin_itemName= async (req,res)=>{
     try{ 
       const { menu_name} = req.params;  
    //    console.log(menu_name)
    
        const get_details=await data.find({Title:menu_name})
        if (get_details.length === 0) {
            
            return res.status(404).json({ err: "Menu not found" });
          }
        res.status(200).send(get_details)
        // console.log(get_details)

        

      
       
       
    }catch(err){
        console.log("Get Item Failed!")
        res.status(400).json({err:err.message})
    }
   

} 
module.exports.admin_items= async (req,res)=>{
    
        try {
            const { item_type } = req.params; 
    
            const response = await data.find({ Category: item_type });
    
            if (response.length === 0) {
                console.log("no response")
                return res.status(404).json({ error: `No items found for item type '${item_type}'` });
            }
    
            console.log("Data Fetched Successfully!");
            res.status(200).json(response);
        } catch (err) {
            console.error("Database fetch failed:", err);
            res.status(500).json({ error: "Internal server error", message: err.message });
        }
    };
    


module.exports.admin_itemlist=async (req,res)=>{
    try{
        const result= await data.find();
            console.log("Data Fetched Successfully")
            // console.log(result)
            return  res.status(200).send(result)

        }
       
        
catch(err){
        console.log(err.message)
        res.status(400).send("Internal Server Error")
    }
   


}

module.exports.admin_cusine= async (req,res)=>{
    try{
        const {cusine}=req.params;
        // console.log(cusine)   
            const response= await data.find({Cuisine_Type:cusine})
            if(response.length===0){
                return res.status(400).send(`No Cuisine is Found with name "${cusine}"`)
            }
            console.log("Data Fetched Successfully!")
            res.status(200).send(response) 

        }
        
    catch(err){
        res.status(400).send(err)
    }

}

module.exports.get_users=async (req,res)=>{
    try{
        const user_details= await user_registration_model.find();
        console.log("Users Fetched Successfully")
        res.status(200).send(user_details)

    }catch(err){
        res.status(400).send(err)

    }
}
// console.log("from logic")