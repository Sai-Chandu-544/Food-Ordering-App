const razorpay=require("razorpay")

require("dotenv").config();



const razorpayInstance=()=>{
    return new razorpay({    
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

}     