let cart = {};
let allProducts = [];

fetch('./products.json')
  .then(res => res.json())
  .then(data => {
    allProducts = data;
    displayProducts(data);
    displayCategories(data);
    setupSearch(data);
  });

function displayProducts(products) {
  const productList = document.getElementById('product-list');
  productList.innerHTML = '';
  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'p-4 bg-white dark:bg-gray-700 shadow rounded';
    card.innerHTML = `
      <div class="font-bold">${product.name}</div>
      <div>₹${product.price.toFixed(2)}</div>
      <div class="flex items-center gap-2 mt-2">
        <button onclick="updateQty('${product.name}', -1)" class="px-2 bg-gray-300 dark:bg-gray-600 rounded">➖</button>
        <span id="qty-${product.name}">0</span>
        <button onclick="updateQty('${product.name}', 1)" class="px-2 bg-gray-300 dark:bg-gray-600 rounded">➕</button>
      </div>
      <button onclick="addToCart('${product.name}', ${product.price})" class="mt-2 bg-green-500 text-white w-full py-1 rounded">Add to Cart</button>
      <div class="text-xs text-green-600" id="incart-${product.name}"></div>
    `;
    productList.appendChild(card);
  });
}

function displayCategories(products) {
  const categoryListDiv = document.getElementById('category-list');
  const categories = ["All", ...new Set(products.map(p => p.category))];
  categoryListDiv.innerHTML = 
    categories.map(category => `
      <button class="px-3 py-1 rounded bg-blue-100 dark:bg-blue-800" onclick="filterByCategory('${category}')">${category}</button>
    `).join('');
}

function filterByCategory(category) {
  if (category === "All") {
    displayProducts(allProducts);
  } else {
    const filtered = allProducts.filter(product => product.category === category);
    displayProducts(filtered);
  }
}

function updateQty(name, change) {
  const span = document.getElementById(`qty-${name}`);
  let qty = parseInt(span.innerText) + change;
  qty = qty < 0 ? 0 : qty;
  span.innerText = qty;
}

function addToCart(name, price) {
  const qty = parseInt(document.getElementById(`qty-${name}`).innerText);
  if (qty > 0) {
    cart[name] = cart[name] || { price, quantity: 0 };
    cart[name].quantity += qty;
    document.getElementById(`qty-${name}`).innerText = 0;
    document.getElementById(`incart-${name}`).innerText = `Already in cart: ${cart[name].quantity}`;
    updateCartDisplay();
  }
}

function updateCartDisplay() {
  const cartItems = document.getElementById('cart-items');
  const cartCount = document.getElementById('cart-count');
  cartItems.innerHTML = '';
  let total = 0;
  let count = 0;
  Object.entries(cart).forEach(([name, item]) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    count += item.quantity;
    const div = document.createElement('div');
    div.className = 'border-b py-2';
    div.innerHTML = `
      <strong>${name}</strong><br>
      ₹${item.price.toFixed(2)} x 
      <button onclick="changeCartQty('${name}', -1)">➖</button>
      ${item.quantity}
      <button onclick="changeCartQty('${name}', 1)">➕</button>
      = ₹${itemTotal.toFixed(2)}
      <button onclick="removeFromCart('${name}')">❌</button>
    `;
    // ✅ Clear "Already in cart" messages for removed items
allProducts.forEach(product => {
  if (!cart[product.name]) {
    const incartText = document.getElementById(`incart-${product.name}`);
    if (incartText) {
      incartText.innerText = '';
    }
  }
});
    cartItems.appendChild(div);
  });
  cartCount.innerText = count;
  document.getElementById('totalItems').innerText = `Total Items: ${count}`;
  document.getElementById('cart-total').innerText = `Grand Total: ₹${total.toFixed(2)}`;
}

function changeCartQty(name, change) {
  cart[name].quantity += change;
  if (cart[name].quantity <= 0) delete cart[name];
  updateCartDisplay();
}

function removeFromCart(name) {
  delete cart[name];
  updateCartDisplay();
}

function setupSearch(products) {
  const input = document.getElementById('searchInput');
  input.addEventListener('input', () => {
    const keyword = input.value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(keyword));
    displayProducts(filtered);
  });
}

document.getElementById('clearCart').addEventListener('click', () => {
  cart = {};
  updateCartDisplay();
});

document.getElementById('placeOrder').addEventListener('click', () => {
  const name = document.getElementById('customerName').value;
  const address = document.getElementById('customerAddress').value;
  if (!name || !address || Object.keys(cart).length === 0) {
    alert('Please fill in customer details and cart items.');
    return;
  }

  let message = `Order from Shivneri Fresh\n\nCustomer: ${name}\nAddress: ${address}\n\n`;
  let total = 0;
  Object.entries(cart).forEach(([product, item]) => {
    const subtotal = item.quantity * item.price;
    message += `${product} - Qty: ${item.quantity}, ₹${subtotal.toFixed(2)}\n`;
    total += subtotal;
  });
  message += `\nGrand Total: ₹${total.toFixed(2)}`;
  const whatsappURL = `https://wa.me/919867378209?text=${encodeURIComponent(message)}`;
  window.open(whatsappURL, '_blank');
});
