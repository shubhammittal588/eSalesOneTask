const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Order = require('./order');
const { sendOrderConfirmationEmail } = require('./emailService');

// Load environment variables
require('dotenv').config();

// Enable debug logging for email service
const DEBUG = true;

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

const app = express();
app.use(cors());
app.use(express.json());

// Create initial order (from product page)
app.post('/api/order', async (req, res) => {
  try {
    const { items } = req.body;
    
    // Validate input data
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('Invalid order data: missing or empty items array');
      return res.status(400).json({ error: 'Invalid order data: items array is required' });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    
    // Log order details
    console.log('Creating new order:', {
      itemCount: items.length,
      subtotal,
      tax,
      total,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        subtotal: item.subtotal
      }))
    });

    const order = new Order({
      items,
      subtotal,
      tax,
      total,
      status: 'pending'
    });

    const savedOrder = await order.save();
    console.log('Order created successfully:', savedOrder._id);
    
    res.json({ 
      success: true,
      orderId: savedOrder._id,
      itemCount: items.length,
      total
    });
  } catch (error) {
    console.error('Order creation error:', error);
    let errorMessage = 'Failed to create order';
    
    // Add more context to the error message
    if (error.name === 'ValidationError') {
      errorMessage = 'Invalid order data: ' + error.message;
    } else if (error.name === 'MongoError') {
      errorMessage = 'Database error: ' + error.message;
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: error.message
    });
  }
});

// Get order by ID
app.get('/api/order/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order with customer details
app.put('/api/order/:id', async (req, res) => {
  try {
    if (DEBUG) {
      console.log('Updating order:', req.params.id);
      console.log('Customer details:', req.body);
    }

    const orderNumber = 'ORD' + Date.now() + Math.floor(Math.random()*1000);
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        orderNumber,
        customer: {
          name: req.body.name,
          email: req.body.email,
          address: req.body.address,
          city: req.body.city,
          state: req.body.state,
          pincode: req.body.pincode
        },
        status: 'confirmed'
      },
      { new: true }
    );

    if (!updatedOrder) {
      console.error('Order not found:', req.params.id);
      return res.status(404).json({ error: 'Order not found' });
    }

    if (DEBUG) {
      console.log('Order updated successfully:', updatedOrder);
    }

    // Send order confirmation email
    try {
      if (DEBUG) {
        console.log('Attempting to send email to:', updatedOrder.customer.email);
      }
      
      const emailResult = await sendOrderConfirmationEmail(updatedOrder);
      
      if (DEBUG) {
        console.log('Email sending result:', emailResult);
      }

      res.json({ 
        success: true, 
        order: updatedOrder,
        emailSent: emailResult
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Still return success but indicate email failure
      res.json({ 
        success: true, 
        order: updatedOrder,
        emailSent: false,
        emailError: emailError.message
      });
    }
  } catch (error) {
    console.error('Order update error:', error);
    res.status(500).json({ error: 'Failed to update order: ' + error.message });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
