const express = require("express");
const app = express();

require("dotenv").config()
const user_registration_model = require("./../models/user_registration.js")
const data = require("./../models/data.js")
const order = require("./../models/ordermodel.js")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const razorpay = require("razorpay");
const crypto = require("crypto");
const { clerkClient } = require("@clerk/clerk-sdk-node");

app.use(express.json());



module.exports.register = async (req, res) => {

  try {

    const clerkId = req.auth.userId;

    const existingUser = await user_registration_model.findOne({ clerkId });

    if (existingUser) {
      return res.json({
        message: "User already exists",
        user: existingUser
      });
    }

    // get user details from clerk
    const clerkUser = await clerkClient.users.getUser(clerkId);

    const newUser = await user_registration_model.create({
      clerkId: clerkId,
      name: clerkUser.firstName || "",
      email: clerkUser.emailAddresses[0].emailAddress
    });

    res.json({
      message: "User saved in database",
      user: newUser
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server error",
      error: err.message
    });

  }
};

module.exports.login = async (req, res) => {

  try {

    const clerkId = req.auth.userId;

    const user = await user_registration_model.findOne({ clerkId });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      message: "Login successful",
      user
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server error"
    });

  }
};


module.exports.logout = (req, res, next) => {
  res.cookie("token", "")
  res.send("You are logged Out")
  console.log("You are logged Out")
  next()

}

module.exports.user_menu = async (req, res) => {
  try {
    const result = await data.find();
    // console.log(result)   
    res.status(200).json({ result })



  } catch (err) {
    console.log(err.message)
    res.status(400).json({ message: "Internal Server Error" })
  }



}
module.exports.user_item = async (req, res) => {
  try {
    const { item } = req.params;  // GET param from query string
    // console.log(Title)

    const get_details = await data.find({ Title: item })
    res.status(200).json({ get_details })
  } catch (err) {
    console.log("Get Item Failed!")
    res.status(400).json({ err: err.message })
  }

}

module.exports.item_category = async (req, res) => {
  try {
    const { item_type } = req.params;
    console.log(item_type)

    if (item_type === "Veg" || item_type === "Non Veg") {
      const response = await data.find({ Category: item_type })
      if (!response) {
        return res.json({ message: `There are no Food Items which match with ${item_type}` })
      }
      return res.status(200).json({ response })

    }

  } catch (err) {
    res.status(400).json({ message: err })
  }
}
module.exports.user_cusine = async (req, res) => {
  try {
    const { cusine } = req.params;
    // console.log(item_type)   
    const response = await data.find({ Cuisine_Type: cusine })
    console.log("Data Fetched Successfully!")
    res.status(200).json({ response })

  }

  catch (err) {
    res.status(400).json({ err })
  }

}
// module.exports.place_orders = async (req, res) => {
//   // routes/orders.js


//   try {
//     const { userId, items, totalAmount } = req.body;
   

//     // Optional: recompute to be safe
//     const verifiedTotal = items.reduce(
//       (sum, item) => sum + item.price * item.quantity,
//       0
//     );

//     if (verifiedTotal !== totalAmount)
//       return res.status(400).json({ message: "Invalid total" });

//     const newOrder = await order.create({
//       userId,
//       items,
//       totalAmount: verifiedTotal,
//     });

//     res.status(201).json({ message: 'success', newOrder });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// }

// module.exports.getUserOrders = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const orders = await order.find({ userId }).sort({ createdAt: -1 })
//         .populate("items._id");

//     res.json({
//       success: true,
//       orders,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Failed to fetch orders" });
//   }
// };


// DELETE /user/orders/:orderId
module.exports.delete_order = async (req, res) => {
  try {
    const { orderId } = req.params;
    await order.findByIdAndDelete(orderId);
    res.json({ success: true, message: "Order deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};


module.exports.getUserOrders = async (req, res) => {
  try {
    // Get userId from Clerk (trusted)
    const userId = req.auth.userId;

    const orders = await order
      .find({ userId })
      .sort({ createdAt: -1 })
      .populate("items._id");

    res.json({
      success: true,
      orders,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};


module.exports.place_orders = async (req, res) => {
  try {
    const userId = req.auth.userId; // Safe & Verified

    const { items, totalAmount } = req.body;

    const newOrder = await order.create({
      userId,
      items,
      totalAmount,
    });

    res.json({ success: true, newOrder });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};


const razorpayInstance = () => {   // Now razorpay is an instance of Razorpay SDK
  return new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

module.exports.razorpayCreateOrder = async (req, res) => {
  try {
    const { amount } = req.body;

   

    const options = {
    
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    //  USE INSTANCE HERE
    const instance = razorpayInstance();
    const order = await instance.orders.create(options);



    // API call to Razorpay server
    // razorpay.orders,razorpay.payments razorpay.refunds are built-in services
    // Call Razorpay server  and Create order on Razorpay cloud
    // Returns order object

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    console.log("Error consoling", err);
    res.status(500).json({ message: "Razorpay order failed" });
  }
};





module.exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      totalAmount,
      userId,
    } = req.body;

    console.log("Verifying payment with data:", req.body);

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");


    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

     if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items received" });
    }

    const newOrder = await order.create({
      userId,
      items: items,   
      totalAmount,
      status: "Paid",
      orderDate: new Date(),
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    res.json({
      success: true,
      message: "Payment verified & order saved",
      order: newOrder,
    });

  } catch (err) {
    console.log("Verify error:", err);
    res.status(500).json({ message: "Verification failed" });
  }
};