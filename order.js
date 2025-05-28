const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: String,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed'],
    default: 'pending'
  },
  items: [{
    id: String,
    name: String,
    brand: String,
    image: String,
    price: Number,
    category: String,
    size: String,
    color: String,
    quantity: Number,
    subtotal: Number
  }],
  customer: {
    name: String,
    email: String,
    address: String,
    city: String,
    state: String,
    pincode: String
  },
  subtotal: Number,
  tax: Number,
  total: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
