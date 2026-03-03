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


module.exports.login = async (req, res) => {

  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ message: "Feild is Required" })
    }

    const user = await user_registration_model.findOne({ email: email })
    if (!user) {
      return res.json({ message: "Please Register!" })
    }
    const result = await bcrypt.compare(password, user.password)
    if (result) {
      const token = jwt.sign({ email: user.email }, process.env.SECRET_KEY, { expiresIn: "1h" })


      // res.cookie("token",token)
      console.log("Login Successfull")
      // res.send("Your Login Successfull")
      // console.log(user)
      res.json({
        token, user: {
          _id: user._id,
          name: user.name,
          email: user.email
        }
      })


    }
    else {
      res.json({ message: "something went wrong!" })
    }




  } catch (err) {
    console.log("something went wrong", err)
    res.json({
      message: "Something went wrong",
      error: err
    });

  }


}

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
module.exports.place_orders = async (req, res) => {
  try {
    const { userId, items, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    // Validate & calculate total safely
    const orderItems = items.map(item => ({
      productId: item.productId || item._id,
      name: item.name,
      quantity: Number(item.quantity),
      price: Number(item.price),
    }));

    const verifiedTotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if (verifiedTotal !== Number(totalAmount)) {
      return res.status(400).json({ message: "Invalid total amount" });
    }

    const newOrder = await Order.create({
      userId,
      items: orderItems,
      totalAmount: verifiedTotal,
      status: "Paid",
      orderDate: new Date(),
    });

    res.status(201).json({ message: "success", newOrder });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await order.find({ userId }).sort({ createdAt: -1 })
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
      cartItems,
      totalAmount,
      userId,
    } = req.body;

    // console.log("Verifying payment with data:", req.body);

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");


    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    //  SAVE ORDER IN DB
    const newOrder = await order.create({
      userId,
      items: cartItems,
      totalAmount,
      razorpay_order_id,
      razorpay_payment_id,
      status: "Paid",
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