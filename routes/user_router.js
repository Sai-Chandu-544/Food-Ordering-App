const express = require("express");
const router = express.Router();
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");

const {
  register,
  login,
  logout,
  user_menu,
  user_item,
  item_category,
  user_cusine,
  place_orders,
  getUserOrders,
  delete_order,
  razorpayCreateOrder,
  verifyPayment
} = require("./../controllers/user_logic");

// AUTH
router.post("/register", ClerkExpressRequireAuth(), register);
router.post("/login", ClerkExpressRequireAuth(), login);
router.get("/logout", logout);

// MENU
router.get("/menu", ClerkExpressRequireAuth(), user_menu);
router.get("/menu/:item", ClerkExpressRequireAuth(), user_item);
router.get("/list/:item_type", ClerkExpressRequireAuth(), item_category);
router.get("/cusine/:cusine", ClerkExpressRequireAuth(), user_cusine);

// ORDERS
router.post("/place/orders", ClerkExpressRequireAuth(), place_orders);
router.get("/orders/:userId", ClerkExpressRequireAuth(), getUserOrders);
router.delete("/orders/:orderId", ClerkExpressRequireAuth(), delete_order);

// RAZORPAY
router.post("/razorpay/order", ClerkExpressRequireAuth(), razorpayCreateOrder);
router.post("/razorpay/verify", ClerkExpressRequireAuth(), verifyPayment);


router.get("/test", ClerkExpressRequireAuth(), (req, res) => {
  console.log("user Details",req.auth);

  res.json({
    message: "Authenticated",
    userId: req.auth.userId
  });
});

module.exports = router;