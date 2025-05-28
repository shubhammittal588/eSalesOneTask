let cartCount = 0;
const cartCountSpan = document.querySelector('.cart-count');
const productModal = document.getElementById('product-modal');
const cartPopup = document.getElementById('cart-popup');
const modalContent = productModal.querySelector('.modal-content');
const cartPopupContent = cartPopup.querySelector('.cart-popup-content');

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountSpan.textContent = cartCount;
}

// Initialize cart count
updateCartCount();

function addToCart(product, options = {}) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let quantityToAdd = options.quantity || 1;
  
  let existingIndex = cart.findIndex(item =>
    item.id === product.id &&
    (options.size ? item.size === options.size : true) &&
    (options.color ? item.color === options.color : true)
  );

  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantityToAdd;
    cart[existingIndex].subtotal = cart[existingIndex].price * cart[existingIndex].quantity;
  } else {
    cart.push({
      id: product.id || Date.now(), // Fallback ID if none exists
      name: product.name,
      brand: product.brand,
      image: product.image,
      price: product.price,
      category: product.category,
      size: options.size,
      color: options.color,
      quantity: quantityToAdd,
      subtotal: product.price * quantityToAdd
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  return cart;
}

// Helper to show cart popup
function showCartPopup(product, options = {}) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  
  cartPopupContent.innerHTML = `
    <div style="font-size:1.05rem;margin-bottom:10px;">Item added to your cart</div>
    <div class="cart-popup-row">
      <img src="${product.image}" alt="${product.name}">
      <div class="cart-popup-details">
        <div class="cart-popup-title">${product.brand} | ${product.name}</div>
        ${options.size ? `<div class="cart-popup-attr">Size: ${options.size}</div>` : ''}
        ${options.color ? `<div class="cart-popup-attr">Color: ${options.color}</div>` : ''}
        <div class="cart-popup-attr">Price: ₹${product.price.toFixed(2)}</div>
      </div>
    </div>
    <div style="margin-top:10px;padding-top:10px;border-top:1px solid #eee;">
      <div style="margin-bottom:10px;">Cart Total (${totalItems} items): ₹${subtotal.toFixed(2)}</div>
    </div>
    <div class="cart-popup-btns">
      <button class="cart-popup-btn" onclick="closeCartPopup()">View Cart</button>
      <button class="cart-popup-btn" onclick="goToCheckout()">Checkout</button>
      <div class="cart-popup-link" onclick="closeCartPopup()">Continue shopping</div>
    </div>
  `;
  cartPopup.style.display = 'flex';
}

// Helper to show shoe modal
function showShoeModal(product) {
  // Example sizes/colors
  const sizes = product.sizes || [4, 8, 14];
  const colors = product.colors || ['black', 'blue'];
  let selectedSize = sizes[0];
  let selectedColor = colors[0];
  let quantity = 1;

  function render() {
    modalContent.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <div class="modal-details">
        <div class="modal-title">${product.brand} | ${product.name}</div>
        <div class="modal-row">Size<br>
          ${sizes.map(size => `
            <button class="size-btn${size === selectedSize ? ' selected' : ''}" data-size="${size}">${size}</button>
          `).join('')}
        </div>
        <div class="modal-row">Color<br>
          ${colors.map(color => `
            <button class="color-btn${color === selectedColor ? ' selected' : ''}" data-color="${color}">${color}</button>
          `).join('')}
        </div>
        <div class="modal-row">Quantity<br>
          <div class="qty-box">
            <button class="qty-btn" id="qty-minus">-</button>
            <span class="qty-value" id="qty-value">${quantity}</span>
            <button class="qty-btn" id="qty-plus">+</button>
          </div>
        </div>
        <div class="modal-row" style="font-size:1.2rem;font-weight:600;">Rs. ${product.price.toFixed(2)}</div>
        <button class="modal-add-btn" id="add-to-cart-modal">Add to cart</button>
      </div>
    `;

    // Add event listeners for size/color/qty
    modalContent.querySelectorAll('.size-btn').forEach(btn => {
      btn.onclick = () => {
        selectedSize = parseInt(btn.dataset.size);
        render();
      };
    });
    modalContent.querySelectorAll('.color-btn').forEach(btn => {
      btn.onclick = () => {
        selectedColor = btn.dataset.color;
        render();
      };
    });
    modalContent.querySelector('#qty-minus').onclick = () => {
      if (quantity > 1) { quantity--; render(); }
    };
    modalContent.querySelector('#qty-plus').onclick = () => {
      quantity++; render();
    };
    modalContent.querySelector('#add-to-cart-modal').onclick = () => {
      addToCart(product, { size: selectedSize, color: selectedColor, quantity });
      closeModal();
      showCartPopup(product, { size: selectedSize, color: selectedColor });
    };
  }
  render();
  productModal.style.display = 'flex';
}

// Render products and handle Add to Cart
fetch('products.json')
  .then(response => response.json())
  .then(products => {
    const container = document.getElementById('product-list');
    const maxInitial = 6;
    function renderProducts(showAll = false) {
      container.innerHTML = '';
      const itemsToShow = showAll ? products.length : Math.min(maxInitial, products.length);

      for (let i = 0; i < itemsToShow; i++) {
        const product = products[i];
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
          <img src="${product.image}" alt="${product.name}">
          <div class="product-card-content">
            <div class="brand">${product.brand} | ${product.category.toUpperCase()}</div>
            <div class="name">${product.name}</div>
            <div class="price">Rs. ${product.price.toFixed(2)}</div>
            <button>${product.category === 'Shoes' ? 'Choose options' : 'Add to cart'}</button>
          </div>
        `;
        // Add to cart button logic
        card.querySelector('button').onclick = () => {
          if (product.category.toLowerCase() === 'shoes') {
            showShoeModal(product);
          } else {
            addToCart(product, { size: 'OS', color: product.color || 'default', quantity: 1 });
            showCartPopup(product);
          }
        };
        container.appendChild(card);
      }

      // Add "View All" button if there are more products to show
      if (!showAll && products.length > maxInitial) {
        const viewAllBtn = document.createElement('button');
        viewAllBtn.textContent = 'View All';
        viewAllBtn.className = 'view-all-btn';
        viewAllBtn.onclick = () => {
          renderProducts(true);
        };
        const btnWrapper = document.createElement('div');
        btnWrapper.className = 'view-all-btn-wrapper';
        btnWrapper.appendChild(viewAllBtn);
        container.appendChild(btnWrapper);
      }
    }
    renderProducts();
  });

// Add event listeners after DOM content loads
document.addEventListener('DOMContentLoaded', () => {
  // Add click handler for cart icon
  const cartIcon = document.querySelector('.nav-right .icon:last-child');
  if (cartIcon) {
    cartIcon.style.cursor = 'pointer';
    cartIcon.onclick = goToCheckout;
  }
});

// Function to close modals
function closeModal() {
  productModal.style.display = 'none';
}

function closeCartPopup() {
  cartPopup.style.display = 'none';
}

// Navigate to checkout
async function goToCheckout() {
  try {
    // Validate cart
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    // Validate each item in the cart
    for (const item of cart) {
      if (!item.id || !item.name || !item.price || !item.quantity) {
        console.error('Invalid cart item:', item);
        alert('Some items in your cart are invalid. Please try clearing your cart and adding items again.');
        return;
      }
      // Recalculate subtotal to ensure accuracy
      item.subtotal = item.price * item.quantity;
    }

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    // Show loading state
    const cartIcon = document.querySelector('.nav-right .icon:last-child');
    if (cartIcon) cartIcon.style.opacity = '0.5';

    // Create an initial order in MongoDB
    const response = await fetch('http://localhost:3000/api/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        items: cart,
        subtotal,
        tax,
        total
      })
    });
    
    const data = await response.json();
    if (response.ok && data.success && data.orderId) {
      console.log('Order created successfully:', {
        orderId: data.orderId,
        itemCount: data.itemCount,
        total: data.total
      });

      // Store order ID in localStorage for reference
      localStorage.setItem('currentOrder', JSON.stringify({
        orderId: data.orderId,
        items: cart,
        subtotal,
        tax,
        total
      }));

      // Navigate to checkout page
      window.location.href = `checkout.html?orderId=${data.orderId}`;
    } else {
      throw new Error(data.error || 'Failed to create order');
    }
  } catch (error) {
    // Reset loading state
    const cartIcon = document.querySelector('.nav-right .icon:last-child');
    if (cartIcon) cartIcon.style.opacity = '1';

    console.error('Error creating order:', error);
    alert(error.message || 'Failed to create order. Please try again later.');
  }
}
