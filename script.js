/* =========================================================
   E-COMMERCE & ADMIN PANEL JAVASCRIPT
   ========================================================= */

// --- LOCALSTORAGE KEYS ---
const STORAGE_KEY_PRODUCTS = "local_store_products_v1";
const STORAGE_KEY_SETTINGS = "local_store_settings_v1";

// --- DEFAULT STORE SETTINGS (Clean generic defaults, no fake numbers) ---
const defaultSettings = {
    storeName: "MY STORE",
    whatsappNumber: "923001234567",
    phone: "+92 300 1234567",
    email: "info@yourstore.pk",
    address: "Karachi, Pakistan",
    instagram: "https://instagram.com",
    facebook: "https://facebook.com"
};

// --- INITIALIZE STORE SETTINGS ---
function getStoreSettings() {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    return saved ? JSON.parse(saved) : defaultSettings;
}

function saveStoreSettings(settings) {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
}

// --- INITIALIZE PRODUCTS (Starts completely empty) ---
function getProducts() {
    const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    return saved ? JSON.parse(saved) : [];
}

function saveProducts(products) {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
}

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

// Admin Elements
const productForm = document.getElementById('productForm');
const settingsForm = document.getElementById('settingsForm');
const adminTableBody = document.getElementById('adminTableBody');
const adminProductCount = document.getElementById('adminProductCount');
const prodImageFile = document.getElementById('prodImageFile');
const prodImageBase64 = document.getElementById('prodImageBase64');
const editProductId = document.getElementById('editProductId');
const formTitle = document.getElementById('formTitle');
const saveProductBtn = document.getElementById('saveProductBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const adminTabBtns = document.querySelectorAll('.admin-tab-btn');
const adminTabContents = document.querySelectorAll('.admin-tab-content');

// --- INITIALIZE ON PAGE LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    applyStoreSettings();
    renderProducts(getProducts());
    renderAdminTable();
    setupEventListeners();
    updateCartUI();
});

// --- APPLY STORE SETTINGS TO UI ---
function applyStoreSettings() {
    const settings = getStoreSettings();
    
    // Header & Logo
    document.getElementById('pageTitle').textContent = `${settings.storeName} | Premium Collection`;
    const firstWord = settings.storeName.split(' ')[0] || 'MY';
    const restWords = settings.storeName.split(' ').slice(1).join(' ') || 'STORE';
    const logoHtml = `${firstWord}<span>${restWords}</span>`;
    document.getElementById('headerLogo').innerHTML = logoHtml;
    document.getElementById('footerLogo').innerHTML = logoHtml;

    // Hero Section
    document.getElementById('heroWhatsAppBtn').href = `https://wa.me/${settings.whatsappNumber}?text=Hi,%20I%20want%20to%20inquire%20about%20your%20products.`;

    // Contact Section
    document.getElementById('contactWhatsAppLink').textContent = settings.phone;
    document.getElementById('contactWhatsAppLink').href = `https://wa.me/${settings.whatsappNumber}`;
    document.getElementById('contactEmailLink').textContent = settings.email;
    document.getElementById('contactEmailLink').href = `mailto:${settings.email}`;
    document.getElementById('contactAddressSpan').textContent = settings.address;

    // Footer
    document.getElementById('footerFacebook').href = settings.facebook;
    document.getElementById('footerInstagram').href = settings.instagram;
    document.getElementById('footerWhatsApp').href = `https://wa.me/${settings.whatsappNumber}`;
    document.getElementById('footerPhoneText').textContent = settings.phone;
    document.getElementById('footerWaText').textContent = settings.phone;
    document.getElementById('footerEmailText').textContent = settings.email;
    document.getElementById('footerLocationText').textContent = settings.address;
    document.getElementById('footerCopyStore').textContent = settings.storeName;

    // Populate Settings Form Inputs
    document.getElementById('settingStoreName').value = settings.storeName;
    document.getElementById('settingWhatsApp').value = settings.whatsappNumber;
    document.getElementById('settingPhone').value = settings.phone;
    document.getElementById('settingEmail').value = settings.email;
    document.getElementById('settingAddress').value = settings.address;
    document.getElementById('settingInstagram').value = settings.instagram;
    document.getElementById('settingFacebook').value = settings.facebook;
}

// --- RENDER PRODUCTS IN SHOP SECTION ---
function renderProducts(itemsToRender) {
    productGrid.innerHTML = '';

    if (itemsToRender.length === 0) {
        productGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding: 60px 20px;">
                <i class="fa-solid fa-box-open" style="font-size: 48px; color: var(--text-light); margin-bottom: 16px;"></i>
                <h3 style="font-size: 18px; margin-bottom: 8px;">No Products Found</h3>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">Your shop is currently empty. Use the Admin Panel below to add your products.</p>
                <a href="#adminSection" class="btn btn-primary"><i class="fa-solid fa-plus"></i> Go to Admin Panel</a>
            </div>
        `;
        return;
    }

    itemsToRender.forEach(product => {
        const sizesArray = product.sizes.split(',').map(s => s.trim()).filter(s => s);
        const sizesHtml = sizesArray.map(size => `<span class="size-tag">${size}</span>`).join('');
        
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
                    <span class="product-price">Rs. ${Number(product.price).toLocaleString()}</span>
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

// --- RENDER ADMIN TABLE ---
function renderAdminTable() {
    const products = getProducts();
    adminProductCount.textContent = products.length;
    adminTableBody.innerHTML = '';

    if (products.length === 0) {
        adminTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-secondary); padding: 30px;">No products added yet. Use the form above to add your first product.</td></tr>`;
        return;
    }

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${product.image}" alt="${product.name}"></td>
            <td><strong>${product.name}</strong></td>
            <td>${product.category}</td>
            <td>Rs. ${Number(product.price).toLocaleString()}</td>
            <td>${product.sizes}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-table-action btn-edit" onclick="editProduct(${product.id})"><i class="fa-solid fa-pen"></i> Edit</button>
                    <button class="btn-table-action btn-delete" onclick="deleteProduct(${product.id})"><i class="fa-solid fa-trash"></i> Delete</button>
                </div>
            </td>
        `;
        adminTableBody.appendChild(row);
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
            const products = getProducts();
            if (filter === 'all') {
                renderProducts(products);
            } else {
                const filtered = products.filter(p => p.category === filter);
                renderProducts(filtered);
            }
        }
    });

    // Nav Links filtering
    document.querySelectorAll('.nav-link[data-filter]').forEach(link => {
        link.addEventListener('click', () => {
            const filter = link.getAttribute('data-filter');
            document.querySelectorAll('.filter-btn').forEach(btn => {
                if (btn.getAttribute('data-filter') === filter) {
                    btn.click();
                }
            });
            navMenu.classList.remove('active');
        });
    });

    // Admin Tabs
    adminTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            adminTabBtns.forEach(b => b.classList.remove('active'));
            adminTabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
        });
    });

    // Image Compression & Upload Handler
    prodImageFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Compress image to JPEG quality 0.8
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                prodImageBase64.value = dataUrl;
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    // Save Product Form Submission (Add / Edit)
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const idVal = editProductId.value;
        const name = document.getElementById('prodName').value.trim();
        const price = Number(document.getElementById('prodPrice').value);
        const category = document.getElementById('prodCategory').value;
        const badge = document.getElementById('prodBadge').value.trim();
        const sizes = document.getElementById('prodSizes').value.trim();
        const description = document.getElementById('prodDesc').value.trim();
        let image = prodImageBase64.value;

        let products = getProducts();

        if (idVal) {
            // Editing existing product
            const index = products.findIndex(p => p.id == idVal);
            if (index !== -1) {
                if (!image) {
                    image = products[index].image; // keep existing image if no new file uploaded
                }
                products[index] = { id: Number(idVal), name, price, category, badge, sizes, description, image };
            }
        } else {
            // Adding new product
            if (!image) {
                alert('Please select a product image from your phone/PC.');
                return;
            }
            const newProduct = {
                id: Date.now(),
                name,
                price,
                category,
                badge,
                sizes,
                description,
                image
            };
            products.unshift(newProduct);
        }

        saveProducts(products);
        renderProducts(products);
        renderAdminTable();
        resetProductForm();
        alert('Product successfully saved!');
    });

    cancelEditBtn.addEventListener('click', resetProductForm);

    // Save Settings Form Submission
    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newSettings = {
            storeName: document.getElementById('settingStoreName').value.trim(),
            whatsappNumber: document.getElementById('settingWhatsApp').value.trim(),
            phone: document.getElementById('settingPhone').value.trim(),
            email: document.getElementById('settingEmail').value.trim(),
            address: document.getElementById('settingAddress').value.trim(),
            instagram: document.getElementById('settingInstagram').value.trim(),
            facebook: document.getElementById('settingFacebook').value.trim()
        };

        saveStoreSettings(newSettings);
        applyStoreSettings();
        alert('Store settings successfully updated!');
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

// --- ADMIN CRUD FUNCTIONS ---
function editProduct(id) {
    const products = getProducts();
    const product = products.find(p => p.id === id);
    if (!product) return;

    editProductId.value = product.id;
    document.getElementById('prodName').value = product.name;
    document.getElementById('prodPrice').value = product.price;
    document.getElementById('prodCategory').value = product.category;
    document.getElementById('prodBadge').value = product.badge;
    document.getElementById('prodSizes').value = product.sizes;
    document.getElementById('prodDesc').value = product.description;
    prodImageBase64.value = product.image;

    formTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Product (#${product.id})`;
    saveProductBtn.textContent = "Update Product";
    cancelEditBtn.style.display = "inline-block";

    // Scroll to form
    location.href = "#adminSection";
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        let products = getProducts();
        products = products.filter(p => p.id !== id);
        saveProducts(products);
        renderProducts(products);
        renderAdminTable();
    }
}

function resetProductForm() {
    productForm.reset();
    editProductId.value = '';
    prodImageBase64.value = '';
    formTitle.innerHTML = `<i class="fa-solid fa-plus-circle"></i> Add New Product`;
    saveProductBtn.textContent = "Save Product";
    cancelEditBtn.style.display = "none";
}

// --- CART LOGIC ---
function addToCart(productId) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartUI();
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
        const items = cartBody.querySelectorAll('.cart-item');
        items.forEach(i => i.remove());
    } else {
        emptyCart.style.display = 'none';
        cartFooter.style.display = 'block';

        let cartItemsHtml = '';
        let subtotal = 0;

        cart.forEach(item => {
            subtotal += item.price * item.quantity;
            cartItemsHtml += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.name}</h4>
                        <div class="cart-item-price">Rs. ${Number(item.price).toLocaleString()}</div>
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

    const settings = getStoreSettings();
    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let grandTotal = subtotal + SHIPPING_FEE;

    let itemsListText = cart.map(item => `• ${item.name} (Qty: ${item.quantity}) - Rs. ${(item.price * item.quantity).toLocaleString()}`).join('\n');

    let message = `*New Order - ${settings.storeName} (Cash on Delivery)*\n\n` +
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
    let whatsappURL = `https://wa.me/${settings.whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappURL, '_blank');
}

// --- QUICK WHATSAPP ORDER FOR SINGLE PRODUCTS ---
function quickWhatsAppOrder(productId) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const settings = getStoreSettings();
    let message = `*Quick Order - ${settings.storeName}*\n\n` +
                  `Product: ${product.name}\n` +
                  `Category: ${product.category}\n` +
                  `Price: Rs. ${Number(product.price).toLocaleString()}\n\n` +
                  `I would like to order this item. Please share further details.`;

    let encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodedMessage}`, '_blank');
}
