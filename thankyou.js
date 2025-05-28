// Get order ID from URL
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('orderId');

if (orderId) {
  fetch(`http://localhost:3000/api/order/${orderId}`)
    .then(res => res.json())
    .then(order => {
      if (!order.orderNumber) {
        throw new Error('Invalid order');
      }

      document.getElementById('order-details').innerHTML = `
        <h2>Order Number: ${order.orderNumber}</h2>
        <div class="order-info">
          <div class="info-section">
            <h3>Customer Details</h3>
            <div>Name: ${order.customer.name}</div>
            <div>Email: ${order.customer.email}</div>
            <div>Address: ${order.customer.address}</div>
            <div>${order.customer.city}, ${order.customer.state} ${order.customer.pincode}</div>
          </div>
          
          <div class="info-section">
            <h3>Order Summary</h3>
            <div class="order-items">
              ${order.items.map(item => `
                <div class="order-item">
                  <div class="item-name">${item.brand} | ${item.name}</div>
                  <div class="item-details">
                    ${item.size ? `Size: ${item.size}` : ''} 
                    ${item.color ? `Color: ${item.color}` : ''}
                    Qty: ${item.quantity}
                  </div>
                  <div class="item-price">Rs.${item.subtotal.toFixed(2)}</div>
                </div>
              `).join('')}
            </div>
            <div class="order-totals">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>Rs.${order.subtotal.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Tax (18%):</span>
                <span>Rs.${order.tax.toFixed(2)}</span>
              </div>
              <div class="total-row grand-total">
                <span>Total:</span>
                <span>Rs.${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="order-status">
          Status: <span class="status-${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
        </div>
      `;
    })
    .catch(error => {
      console.error('Error fetching order:', error);
      document.getElementById('order-details').innerHTML = `
        <div class="error-message">
          <h2>Oops! Something went wrong</h2>
          <p>We couldn't find your order details. Please try again later or contact support.</p>
          <a href="index.html" class="home-link">Return to Home</a>
        </div>
      `;
    });
} else {
  window.location.href = 'index.html';
}
