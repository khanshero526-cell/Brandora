/* =========================================================
   VOGUE EXOTIC - E-COMMERCE JAVASCRIPT & PRODUCT DATABASE
   ========================================================= */

// --- CONFIGURABLE WHATSAPP NUMBER ---
const WHATSAPP_NUMBER = "YOUR_WHATSAPP_NUMBER";

// --- PRODUCT DATABASE (Easily edit, add or remove items here) ---
const products = [
    {
        id: 1,
        name: "Vintage Oversized Band T-Shirt",
        category: "T-Shirts",
        price: 2499,
        sizes: ["S", "M", "L", "XL"],
        description: "Imported 100% heavy cotton vintage wash band tee with faded graphic print.",
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80",
        badge: "Imported"
    },
    {
        id: 2,
        name: "Retro Cargo Streetwear Trousers",
        category: "Trousers",
        price: 4500,
        sizes: ["30", "32", "34", "36"],
        description: "Durable multi-pocket utility cargo trousers with relaxed urban fit.",
        image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=700&q=80",
        badge: "Best Seller"
    },
    {
        id: 3,
        name: "Classic Leather Biker Jacket",
        category: "Jackets",
        price: 9800,
        sizes: ["M", "L", "XL"],
        description: "Premium imported faux leather jacket with heavy-duty zips and quilted lining.",
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80",
        badge: "Luxury"
    },
    {
        id: 4,
        name: "Heavy Woven Tapestry Blanket",
        category: "Blankets",
        price: 6500,
        sizes: ["Standard (60x80\")"],
        description: "Luxurious vintage art woven throw blanket, ideal for home decor or cozy lounging.",
        image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=700&q=80",
        badge: "Imported"
    },
    {
        id: 5,
        name: "Branded Vintage Sports Windbreaker",
        category: "Branded Items",
        price: 5900,
        sizes: ["M", "L", "XL"],
        description: "Authentic imported retro sportswear windbreaker with embroidered chest logo.",
        image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=700&q=80",
        badge: "Rare Find"
    },
    {
        id: 6,
        name: "Heavyweight Acid Wash Tee",
        category: "T-Shirts",
        price: 2299,
        sizes: ["S", "M", "L"],
        description: "Prefaded acid wash streetwear tee crafted with ultra-soft breathable cotton.",
        image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=700&q=80",
        badge: "New"
    },
    {
        id: 7,
        name: "Wide-Leg Aesthetic Trousers",
        category: "Trousers",
        price: 4100,
        sizes: ["30", "32", "34"],
        description: "Contemporary wide-leg tailored trousers designed for effortless streetwear styling.",
        image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=700&q=80",
        badge: "Trending"
    },
    {
        id: 8,
        name: "Vintage Aesthetic Tapestry Throw",
        category: "Blankets",
        price: 6200,
        sizes: ["Standard (60x80\")"],
        description: "Intricately woven vintage tapestry blanket featuring timeless artistic patterns.",
        image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=700&q=80",
        badge: "Imported"
    }
];

// --- SHOPPING CART STATE ---
let cart = [];
const SHIPPING_FEE = 250;

// --- DOM ELEMENTS ---
const productGrid = document.getElementById('productGrid');
const categoryFilters = document.getElementById('categoryFilters');
const cartBtn = document.getElementById('cartBtn');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartBody = document.getElementById('cartBody');
const cartFooter = document.getElementById('cartFooter');
const emptyCart = document.getElementById('emptyCart');
const cartBadge = document.getElementById('cartBadge');
const cartCount = document.getElementById('cartCount');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartGrandTotal = document.getElementById('cartGrandTotal');
const whatsappCheckoutBtn = document.getElementById('whatsappCheckoutBtn');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const closeMenuBtn = document.getElementById('closeMenuBtn');
const navMenu = document.getElementById('navMenu');
const startShoppingBtn = document.getElementById('startShoppingBtn');

// --- INITIALIZE WEBSITE ---
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(products);
    setupEventListeners();
    updateCartUI();
});

// --- RENDER PRODUCTS ---
function renderProducts(itemsToRender) {
    productGrid.innerHTML = '';

    if (itemsToRender.length === 0) {
        productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-secondary);">No products found in this category.</p>`;
        return;
    }

    itemsToRender.forEach(product => {
        const sizesHtml = product.sizes.map(size => `<span class="size-tag">${size}</span>`).join('');
        
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image-wrap">
                <span class="product-badge">${product.badge}</span>
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <span class="product-category-tag">${product.category}</span>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-meta-row">
                    <span class="product-price">Rs. ${product.price.toLocaleString()}</span>
                    <div class="product-sizes">${sizesHtml}</div>
                </div>
                <div class="product-buttons">
                    <button class="btn-add-cart" onclick="addToCart(${product.id})">
                        <i class="fa-solid fa-bag-shopping"></i> Add to Cart
                    </button>
                    <button class="btn-quick-wa" onclick="quickWhatsAppOrder(${product.id})" title="Order on WhatsApp">
                        <i class="fa-brands fa-whatsapp"></i>
                    </button>
                </div>
            </div>
        `;
        productGrid.appendChild(card);
    });
}

// --- SETUP EVENT LISTENERS ---
function setupEventListeners() {
    // Category Filtering
    categoryFilters.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            const filter = e.target.getAttribute('data-filter');
            if (filter === 'all') {
                renderProducts(products);
            } else {
                const filtered = products.filter(p => p.category === filter);
                renderProducts(filtered);
            }
        }
    });

    // Nav Links category filtering support
    document.querySelectorAll('.nav-link[data-filter]').forEach(link => {
        link.addEventListener('click', (e) => {
            const filter = link.getAttribute('data-filter');
            document.querySelectorAll('.filter-btn').forEach(btn => {
                if (btn.getAttribute('data-filter') === filter) {
                    btn.click();
                }
            });
            navMenu.classList.remove('active');
        });
    });

    // Cart Drawer Open/Close
    cartBtn.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);
    if (startShoppingBtn) {
        startShoppingBtn.addEventListener('click', () => {
            toggleCart();
            location.href = '#shop';
        });
    }

    // Mobile Menu Toggle
    mobileMenuBtn.addEventListener('click', () => navMenu.classList.add('active'));
    closeMenuBtn.addEventListener('click', () => navMenu.classList.remove('active'));
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => navMenu.classList.remove('active'));
    });

    // WhatsApp Checkout Button
    whatsappCheckoutBtn.addEventListener('click', processWhatsAppCheckout);
}

function toggleCart() {
    cartDrawer.classList.toggle('active');
    cartOverlay.classList.toggle('active');
}

// --- CART LOGIC ---
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartUI();
    // Automatically open cart drawer to confirm addition
    if (!cartDrawer.classList.contains('active')) {
        toggleCart();
    }
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(p => p.id !== productId);
        }
    }
    updateCartUI();
}

function removeFromCart(productId) {
    cart = cart.filter(p => p.id !== productId);
    updateCartUI();
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
    cartCount.textContent = totalItems;

    if (cart.length === 0) {
        emptyCart.style.display = 'block';
        cartFooter.style.display = 'none';
        // Remove existing items from body except emptyCart
        const items = cartBody.querySelectorAll('.cart-item');
        items.forEach(i => i.remove());
    } else {
        emptyCart.style.display = 'none';
        cartFooter.style.display = 'block';

        // Render cart items
        let cartItemsHtml = '';
        let subtotal = 0;

        cart.forEach(item => {
            subtotal += item.price * item.quantity;
            cartItemsHtml += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.name}</h4>
                        <div class="cart-item-price">Rs. ${item.price.toLocaleString()}</div>
                        <div class="cart-item-controls">
                            <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                            <span class="cart-item-qty">${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                            <button class="cart-item-remove" onclick="removeFromCart(${item.id})"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            `;
        });

        // Keep empty cart hidden and update items
        const existingItems = cartBody.querySelectorAll('.cart-item');
        existingItems.forEach(i => i.remove());
        cartBody.insertAdjacentHTML('afterbegin', cartItemsHtml);

        const grandTotal = subtotal + SHIPPING_FEE;
        cartSubtotal.textContent = `Rs. ${subtotal.toLocaleString()}`;
        cartGrandTotal.textContent = `Rs. ${grandTotal.toLocaleString()}`;
    }
}

// --- WHATSAPP CHECKOUT & AUTOMATED MESSAGE ---
function processWhatsAppCheckout() {
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const city = document.getElementById('custCity').value.trim();
    const address = document.getElementById('custAddress').value.trim();

    if (!name || !phone || !city || !address) {
        alert('Please fill in all delivery details (Name, Phone, City, and Address) before ordering on WhatsApp.');
        return;
    }

    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let grandTotal = subtotal + SHIPPING_FEE;

    let itemsListText = cart.map(item => `• ${item.name} (Qty: ${item.quantity}) - Rs. ${(item.price * item.quantity).toLocaleString()}`).join('\n');

    let message = `*New Order - Vogue Exotic (Cash on Delivery)*\n\n` +
                  `*Customer Details:*\n` +
                  `Name: ${name}\n` +
                  `Phone: ${phone}\n` +
                  `City: ${city}\n` +
                  `Address: ${address}\n\n` +
                  `*Order Items:*\n${itemsListText}\n\n` +
                  `Subtotal: Rs. ${subtotal.toLocaleString()}\n` +
                  `Shipping (COD): Rs. ${SHIPPING_FEE}\n` +
                  `*Total Amount: Rs. ${grandTotal.toLocaleString()}*\n\n` +
                  `Payment Method: Cash on Delivery (COD)`;

    let encodedMessage = encodeURIComponent(message);
    let whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    window.open(whatsappURL, '_blank');
}

// --- QUICK WHATSAPP ORDER FOR SINGLE PRODUCTS ---
function quickWhatsAppOrder(productId) {
    const product = products.find(p => p.id === productId);
    let message = `*Quick Order - Vogue Exotic*\n\n` +
                  `Product: ${product.name}\n` +
                  `Category: ${product.category}\n` +
                  `Price: Rs. ${product.price.toLocaleString()}\n\n` +
                  `I would like to order this item. Please share further details.`;

    let encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
}
