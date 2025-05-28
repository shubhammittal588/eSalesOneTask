const nodemailer = require('nodemailer');

// Create transporter with Mailtrap config
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  secure: false,
  auth: {
    user: process.env.MAILTRAP_USER || "ENTER_MAILTRAP_USERNAME_HERE",
    pass: process.env.MAILTRAP_PASS || "ENTER_MAILTRAP_PASSWORD_HERE"
  },
  debug: true,
  logger: true // Enable detailed logging
});

// Verify transporter connection
transporter.verify(function(error, success) {
  if (error) {
    console.error('Email transporter verification failed:', error);
  } else {
    console.log('Email server connection successful');
  }
});

// Email template for order confirmation
function getOrderEmailHTML(order) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #232733;">Order Confirmation</h1>
      <p>Thank you for your order!</p>
      
      <div style="background: #f6f7f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="margin-top: 0;">Order Details</h2>
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        
        <h3>Customer Information</h3>
        <p>
          ${order.customer.name}<br>
          ${order.customer.email}<br>
          ${order.customer.address}<br>
          ${order.customer.city}, ${order.customer.state} ${order.customer.pincode}
        </p>

        <h3>Items Ordered</h3>
        <div style="margin-bottom: 20px;">
          ${order.items.map(item => `
            <div style="margin-bottom: 10px;">
              <div><strong>${item.brand} | ${item.name}</strong></div>
              <div style="color: #666;">
                ${item.size ? `Size: ${item.size}` : ''} 
                ${item.color ? `Color: ${item.color}` : ''}
                Quantity: ${item.quantity}
              </div>
              <div>Price: ₹${item.subtotal.toFixed(2)}</div>
            </div>
          `).join('')}
        </div>

        <div style="border-top: 1px solid #ddd; padding-top: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>Subtotal:</span>
            <span>₹${order.subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>Tax (18%):</span>
            <span>₹${order.tax.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 10px;">
            <span>Total:</span>
            <span>₹${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <p style="color: #666; font-size: 14px;">
        If you have any questions about your order, please contact our customer service.
      </p>
    </div>
  `;
}

// Send order confirmation email
async function sendOrderConfirmationEmail(order) {
  if (!order || !order.customer || !order.customer.email) {
    throw new Error('Invalid order data: missing customer email');
  }

  console.log('Preparing to send email to:', order.customer.email);
  console.log('Order details:', {
    orderNumber: order.orderNumber,
    customerEmail: order.customer.email,
    status: order.status
  });
  
  try {
    const mailOptions = {
      from: '"eSalesOne Store" <shubhammittal588@gmail.com>',
      to: order.customer.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: getOrderEmailHTML(order),
      text: `Thank you for your order! Your order number is ${order.orderNumber}` // Fallback plain text
    };

    console.log('Sending email with options:', {
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      response: info.response,
      previewUrl: nodemailer.getTestMessageUrl(info)
    });
    
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

module.exports = {
  sendOrderConfirmationEmail
};
