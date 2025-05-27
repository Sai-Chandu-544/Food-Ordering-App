const express=require("express");
const app=express();

require("dotenv").config();
const user_registration_model=require("./../models/user_registration.js")
const data=require("./../models/data.js")
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");

app.use(express.json());


module.exports.register=async (req,res)=>{
    try{
        const {name,email,password}=req.body;
        if(!name|| !email || !password){
            return res.json({message:"Feild is Required"})
        }else{
        let user=await user_registration_model.findOne({email:email})
        if(user){
            res.json({message:"User Already Registered!"})
        }else{
        
        bcrypt.genSalt(20,(err,salt)=>{
            // console.log("Salt",salt)
            if(err){
                console.log("Salt Generation is Failed!")
            }
        bcrypt.hash(password,salt,(err,hash)=>{
            // console.log("hash",hash)
            if(err){
                console.log("Hash Error",err)

            }
            let create_user=  new user_registration_model({
                name,     
                email,
                password:hash
            })
            create_user.save();
            // console.log(create_user)
            res.status(200).json({message:"User Registered Successfully"})
        
        })
            
        })
    }


    }}catch(err){
        console.log("User Registration Error",err)
        res.status(500).json({message:"User Registration Error",err})


    }
}

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

 