const express=require("express");
const app=express();

require("dotenv").config();
const user_registration_model=require("./../models/user_registration.js")
const data=require("./../models/data.js")
const order=require("./../models/ordermodel.js")
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");

app.use(express.json());


module.exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if fields are provided
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if  the user already exists
        let user = await user_registration_model.findOne({ email: email });
        if (user) {
            return res.status(409).json({ message: "User Already Registered!" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // Create and save user
        const newUser = new user_registration_model({
            name,
            email,
            password: hash
        });

        await newUser.save();

        return res.status(201).json({ message: 'User Registered Successfully' });

    } catch (err) {
        console.error("User Registration Error:", err);
        return res.status(500).json({ message: "User Registration Error", error: err.message });
    }
};


module.exports.login=async (req,res)=>{

    try{
        const {email,password}=req.body;
        if(!email || !password){
            return res.json({message:"Feild is Required"})
        }
        
        const user=await user_registration_model.findOne({email:email})
        if(!user){
            return res.json({message:"Please Register!"})
        }
       const result= await bcrypt.compare(password,user.password)
       if(result){
        const token=jwt.sign({email:user.email},process.env.SECRET_KEY,{expiresIn:"1h"})
        
        
        // res.cookie("token",token)
        console.log("Login Successfull")
        // res.send("Your Login Successfull")
        res.json({token})

      }
      else{
        res.json({message:"something went wrong!"})
      }
          
          


    }catch(err){
        console.log("something went wrong",err)
        res.json({
            message: "Something went wrong",
            error: err
          });
          
    }


}

module.exports.logout=(req,res,next)=>{
    res.cookie("token","")
    res.send("You are logged Out")
    console.log("You are logged Out")
    next()

}

module.exports.user_menu=async (req,res)=>{
    try{
        const result= await data.find(); 
         // console.log(result)   
            res.status(200).json({result})

        

    }catch(err){
        console.log(err.message)
        res.status(400).json({message:"Internal Server Error"})
    }
   


}
module.exports.user_item=async (req,res)=>{
    try{ 
        const { item } = req.params;  // GET param from query string
        // console.log(Title)
        
         const get_details=await data.find({Title:item})
         res.status(200).json({get_details})
     }catch(err){
         console.log("Get Item Failed!")
         res.status(400).json({err:err.message})
     }
    
}

module.exports.item_category= async (req,res)=>{
    try{
        const {item_type}=req.params;
        console.log(item_type)
        
        if(item_type==="Veg" || item_type==="Non Veg"){
            const response= await data.find({Category:item_type})
            if(!response){
                return res.json({message:`There are no Food Items which match with ${item_type}`})
            }
            return res.status(200).json({response})

        }
        
    }catch(err){
        res.status(400).json({message:err})
    }
}
module.exports.user_cusine= async (req,res)=>{
    try{
        const {cusine}=req.params;
        // console.log(item_type)   
            const response= await data.find({Cuisine_Type:cusine})
            console.log("Data Fetched Successfully!")
            res.status(200).json({response}) 

        }
        
    catch(err){
        res.status(400).json({err})
    }

}
module.exports.place_orders=async (req, res) => {
  const { userId, items, totalAmount } = req.body;
  try {
    const newOrder = new order({ userId, items, totalAmount });
    await newOrder.save();
    res.json({ message: 'Order placed!', newOrder });
   
  } catch (err) {
    res.status(500).json({ error: 'Error placing order' });
  }
}
 