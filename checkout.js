const orderSummary = document.getElementById('order-summary');

// Format card number with spaces
document.getElementById('card').addEventListener('input', function(e) {
  let value = e.target.value.replace(/\D/g, '');
  value = value.replace(/(.{16})/g, '$1 ').trim();
  e.target.value = value;
});

// Format expiry date
document.getElementById('expiry').addEventListener('input', function(e) {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length > 3) {
    value = value.substr(0, 2) + ' / ' + value.substr(2);
  }
  e.target.value = value;
});

// Format CVV to only allow numbers
document.getElementById('cvv').addEventListener('input', function(e) {
  e.target.value = e.target.value.replace(/\D/g, '');
});

// Validate card details
function validateCard(card, expiry, cvv) {
  const cardNumber = card.replace(/\s/g, '');
  if (!/^\d{16}$/.test(cardNumber)) {
    return 'Please enter a valid 16-digit card number';
  }

  const [month, year] = expiry.split('/').map(x => x.trim());
  if (!month || !year || !/^\d{2}$/.test(month) || !/^\d{2}$/.test(year)) {
    return 'Please enter a valid expiry date (MM / YY)';
  }

  const currentDate = new Date();
  const expDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
  if (expDate < currentDate) {
    return 'Card has expired';
  }

  if (!/^\d{3}$/.test(cvv)) {
    return 'Please enter a valid 3-digit CVV';
  }

  return null;
}

// Function to get current order from localStorage and URL
function getCurrentOrder() {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('orderId');
  const currentOrder = JSON.parse(localStorage.getItem('currentOrder'));
  
  if (!orderId || !currentOrder || currentOrder.orderId !== orderId) {
    window.location.href = 'index.html';
    return null;
  }
  
  return { orderId, ...currentOrder };
}

// Function to display order summary
function displayOrderSummary() {
  const currentOrder = getCurrentOrder();
  if (!currentOrder) return;

  const { items, subtotal, tax, total } = currentOrder;
  
  orderSummary.innerHTML = `
    <h3>Order Summary</h3>
    ${items.map(item => `
      <div class="order-item">
        <img src="${item.image}" alt="${item.name}" style="width:60px;height:60px;object-fit:cover;border-radius:4px;">
        <div class="order-details">
          <div class="name">${item.brand ? item.brand + ' | ' : ''}${item.name}</div>
          ${item.size ? `<div class="attr">Size: ${item.size}${item.color ? ' / ' + item.color : ''}</div>` : ''}
          <div class="attr">Qty: ${item.quantity}</div>
          <div class="price">₹${item.subtotal.toFixed(2)}</div>
        </div>
      </div>
    `).join('')}
    <div class="summary-row">Subtotal: <span>₹${subtotal.toFixed(2)}</span></div>
    <div class="summary-row">Tax (18%): <span>₹${tax.toFixed(2)}</span></div>
    <div class="summary-row total">Total: <span>₹${total.toFixed(2)}</span></div>
  `;
}

// Display order summary when page loads
displayOrderSummary();

// Handle form submission
document.getElementById('checkout-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const loader = document.getElementById('transaction-loader');
  const formError = document.getElementById('form-error');
  const submitBtn = e.target.querySelector('.pay-btn');
  formError.textContent = '';

  try {
    const currentOrder = getCurrentOrder();
    if (!currentOrder) {
      formError.textContent = 'Invalid order. Please try again.';
      return;
    }

    // Validate card details
    const cardError = validateCard(
      e.target.card.value,
      e.target.expiry.value,
      e.target.cvv.value
    );
    
    if (cardError) {
      formError.textContent = cardError;
      return;
    }

    // Validate form fields
    const requiredFields = ['email', 'address', 'city', 'state', 'pincode', 'cardname'];
    for (let field of requiredFields) {
      if (!e.target[field].value.trim()) {
        formError.textContent = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        e.target[field].focus();
        return;
      }
    }

    // Disable submit button and show loading overlay
    submitBtn.disabled = true;
    loader.style.display = 'flex';

    // Update order with customer details
    const response = await fetch(`https://esalesonetask.onrender.com/api/order/${currentOrder.orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `${e.target.firstName.value} ${e.target.lastName.value}`.trim(),
        email: e.target.email.value.trim(),
        address: e.target.address.value.trim(),
        city: e.target.city.value.trim(),
        state: e.target.state.value.trim(),
        pincode: e.target.pincode.value.trim()
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to process order');
    }
    
    if (result.success) {
      localStorage.removeItem('cart'); // Clear cart after successful order
      localStorage.removeItem('currentOrder');
      window.location.href = 'thankyou.html?orderId=' + currentOrder.orderId;
    } else {
      throw new Error(result.error || 'Failed to process order');
    }
  } catch (error) {
    console.error('Order processing error:', error);
    formError.textContent = error.message || 'Failed to process order. Please try again.';
    submitBtn.disabled = false;
    loader.style.display = 'none';
  }
});
