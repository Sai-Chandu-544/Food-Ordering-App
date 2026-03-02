const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  items: [
    {
      productId: String,
      name: String,
      quantity: Number,
      price: Number,
    },
  ],
  totalAmount: Number,
  orderDate: { type: Date, default: Date.now },
    status: {
      type: String,
      default: "Pending",
    },

    // Razorpay fields
    razorpayOrderId: String,
    razorpayPaymentId: String,
 
 
});

const order = mongoose.model('Order', orderSchema);
module.exports=order
