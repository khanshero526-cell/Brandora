/* =========================================================
   BRANDORA E-COMMERCE WEBSITE
   FIREBASE REALTIME DATABASE
   CLOUDINARY IMAGE UPLOAD
   PRODUCT STOCK, CART AND WHATSAPP ORDERS
   MAXIMUM 4 IMAGES PER PRODUCT
========================================================= */


/* =========================================================
   FIREBASE CONFIGURATION
========================================================= */

const FIREBASE_DATABASE_URL =
    "https://brandora-82748-default-rtdb.firebaseio.com";

const FIREBASE_PRODUCTS_PATH = "/products.json";
const FIREBASE_SETTINGS_PATH = "/settings.json";


/* =========================================================
   CLOUDINARY CONFIGURATION
========================================================= */

const CLOUDINARY_CLOUD_NAME = "spbb53tj";
const CLOUDINARY_UPLOAD_PRESET = "brandora_products";


/* =========================================================
   LOCAL STORAGE
========================================================= */

const STORAGE_KEY_PRODUCTS = "local_store_products_v1";
const STORAGE_KEY_SETTINGS = "local_store_settings_v1";


/* =========================================================
   DEFAULT SETTINGS
========================================================= */

const defaultSettings = {
    storeName: "BRANDORA",
    whatsappNumber: "923001234567",
    phone: "+92 300 1234567",
    email: "info@yourstore.pk",
    address: "Karachi, Pakistan",
    instagram: "https://instagram.com",
    facebook: "https://facebook.com"
};


/* =========================================================
   FIREBASE FUNCTIONS
========================================================= */

async function firebaseSet(path, data) {
    const response = await fetch(
        FIREBASE_DATABASE_URL + path,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );

    if (!response.ok) {
        throw new Error(
            "Firebase save failed: " + response.status
        );
    }

    return await response.json();
}


async function firebaseGet(path) {
    const response = await fetch(
        FIREBASE_DATABASE_URL + path
    );

    if (!response.ok) {
        throw new Error(
            "Firebase read failed: " + response.status
        );
    }

    return await response.json();
}


/* =========================================================
   SETTINGS FUNCTIONS
========================================================= */

function getStoreSettings() {
    const saved = localStorage.getItem(
        STORAGE_KEY_SETTINGS
    );

    if (!saved) {
        return { ...defaultSettings };
    }

    try {
        return {
            ...defaultSettings,
            ...JSON.parse(saved)
        };
    } catch {
        return { ...defaultSettings };
    }
}


async function loadStoreSettingsFromFirebase() {
    try {
        const data = await firebaseGet(
            FIREBASE_SETTINGS_PATH
        );

        if (data && typeof data === "object") {
            const settings = {
                ...defaultSettings,
                ...data
            };

            localStorage.setItem(
                STORAGE_KEY_SETTINGS,
                JSON.stringify(settings)
            );

            return settings;
        }
    } catch (error) {
        console.error(
            "Firebase settings load error:",
            error
        );
    }

    return getStoreSettings();
}


function saveStoreSettings(settings) {
    localStorage.setItem(
        STORAGE_KEY_SETTINGS,
        JSON.stringify(settings)
    );

    firebaseSet(
        FIREBASE_SETTINGS_PATH,
        settings
    ).catch(error => {
        console.error(
            "Firebase settings save error:",
            error
        );

        alert(
            "Settings saved on this device, but online save failed."
        );
    });
}


/* =========================================================
   PRODUCT FUNCTIONS
========================================================= */

function getProductStock(product) {
    const stock = Number(product.stock);

    if (
        Number.isFinite(stock) &&
        stock >= 0
    ) {
        return Math.floor(stock);
    }

    return 1;
}


function normalizeProduct(product) {
    return {
        ...product,
        stock: getProductStock(product)
    };
}


function getProducts() {
    const saved = localStorage.getItem(
        STORAGE_KEY_PRODUCTS
    );

    if (!saved) {
        return [];
    }

    try {
        return JSON.parse(saved).map(
            normalizeProduct
        );
    } catch {
        return [];
    }
}


async function loadProductsFromFirebase() {
    try {
        const data = await firebaseGet(
            FIREBASE_PRODUCTS_PATH
        );

        if (Array.isArray(data)) {
            const products = data.map(
                normalizeProduct
            );

            localStorage.setItem(
                STORAGE_KEY_PRODUCTS,
                JSON.stringify(products)
            );

            return products;
        }

        return [];
    } catch (error) {
        console.error(
            "Firebase product load error:",
            error
        );

        alert(
            "Online products could not be loaded. Using saved device data."
        );

        return getProducts();
    }
}


function saveProducts(products) {
    try {
        const normalized = products.map(
            normalizeProduct
        );

        // Save local backup.
        localStorage.setItem(
            STORAGE_KEY_PRODUCTS,
            JSON.stringify(normalized)
        );

        // Save products online.
        firebaseSet(
            FIREBASE_PRODUCTS_PATH,
            normalized
        ).catch(error => {
            console.error(
                "Firebase product save error:",
                error
            );

            alert(
                "Product saved on this device, but online save failed."
            );
        });

        return true;
    } catch (error) {
        if (
            error.name === "QuotaExceededError"
        ) {
            alert(
                "Browser storage is full. Please check your available storage."
            );

            return false;
        }

        throw error;
    }
}


/* =========================================================
   PRODUCT IMAGES
========================================================= */

function getProductImages(product) {
    if (
        Array.isArray(product.images) &&
        product.images.length > 0
    ) {
        return product.images;
    }

    if (product.image) {
        return [product.image];
    }

    return [];
}


/* =========================================================
   IMAGE COMPRESSION
========================================================= */

function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = event => {
            const img = new Image();

            img.onload = () => {
                let width = img.width;
                let height = img.height;

                const max = 700;

                if (width > height && width > max) {
                    height = Math.round(
                        height * max / width
                    );

                    width = max;
                } else if (
                    height >= width &&
                    height > max
                ) {
                    width = Math.round(
                        width * max / height
                    );

                    height = max;
                }

                const canvas = document.createElement(
                    "canvas"
                );

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");

                ctx.drawImage(
                    img,
                    0,
                    0,
                    width,
                    height
                );

                resolve(
                    canvas.toDataURL(
                        "image/jpeg",
                        0.7
                    )
                );
            };

            img.onerror = reject;
            img.src = event.target.result;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}


/* =========================================================
   UPLOAD IMAGE TO CLOUDINARY
========================================================= */

async function uploadImageToCloudinary(dataUrl) {
    const formData = new FormData();

    formData.append("file", dataUrl);

    formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
    );

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
            method: "POST",
            body: formData
        }
    );

    const result = await response.json();

    if (
        !response.ok ||
        !result.secure_url
    ) {
        console.error(
            "Cloudinary error:",
            result
        );

        throw new Error(
            result.error?.message ||
            "Cloudinary image upload failed."
        );
    }

    return result.secure_url;
}


/* =========================================================
   CART SETTINGS
========================================================= */

let cart = [];

const SHIPPING_FEE = 250;


/* =========================================================
   DOM ELEMENTS
========================================================= */

const productGrid =
    document.getElementById("productGrid");

const categoryFilters =
    document.getElementById("categoryFilters");

const cartBtn =
    document.getElementById("cartBtn");

const cartDrawer =
    document.getElementById("cartDrawer");

const cartOverlay =
    document.getElementById("cartOverlay");

const closeCartBtn =
    document.getElementById("closeCartBtn");

const cartBody =
    document.getElementById("cartBody");

const cartFooter =
    document.getElementById("cartFooter");

const emptyCart =
    document.getElementById("emptyCart");

const cartBadge =
    document.getElementById("cartBadge");

const cartCount =
    document.getElementById("cartCount");

const cartSubtotal =
    document.getElementById("cartSubtotal");

const cartGrandTotal =
    document.getElementById("cartGrandTotal");

const whatsappCheckoutBtn =
    document.getElementById("whatsappCheckoutBtn");

const mobileMenuBtn =
    document.getElementById("mobileMenuBtn");

const closeMenuBtn =
    document.getElementById("closeMenuBtn");

const navMenu =
    document.getElementById("navMenu");

const startShoppingBtn =
    document.getElementById("startShoppingBtn");


/* =========================================================
   ADMIN ELEMENTS
========================================================= */

const productForm =
    document.getElementById("productForm");

const settingsForm =
    document.getElementById("settingsForm");

const adminTableBody =
    document.getElementById("adminTableBody");

const adminProductCount =
    document.getElementById("adminProductCount");

const prodImageFile =
    document.getElementById("prodImageFile");

const prodImageBase64 =
    document.getElementById("prodImageBase64");

const editProductId =
    document.getElementById("editProductId");

const formTitle =
    document.getElementById("formTitle");

const saveProductBtn =
    document.getElementById("saveProductBtn");

const cancelEditBtn =
    document.getElementById("cancelEditBtn");

const adminTabBtns =
    document.querySelectorAll(".admin-tab-btn");

const adminTabContents =
    document.querySelectorAll(".admin-tab-content");


/* =========================================================
   CREATE STOCK FIELD
========================================================= */

function createStockFieldIfMissing() {
    let stockInput =
        document.getElementById("prodStock");

    if (stockInput) {
        return stockInput;
    }

    if (!prodImageFile) {
        return null;
    }

    const imageGroup =
        prodImageFile.closest(".form-group");

    const stockGroup =
        document.createElement("div");

    stockGroup.className = "form-group";

    stockGroup.innerHTML = `
        <label for="prodStock">
            Stock Quantity *
        </label>

        <input
            type="number"
            id="prodStock"
            min="0"
            step="1"
            value="1"
            required
        >

        <small style="display:block;margin-top:6px;">
            If you have only one piece, enter 1.
        </small>
    `;

    if (
        imageGroup &&
        imageGroup.parentElement
    ) {
        imageGroup.parentElement.insertBefore(
            stockGroup,
            imageGroup
        );
    } else if (productForm) {
        productForm.prepend(stockGroup);
    }

    return document.getElementById("prodStock");
}


/* =========================================================
   APPLY STORE SETTINGS
========================================================= */

function applyStoreSettings(customSettings = null) {
    const settings = {
        ...defaultSettings,
        ...(customSettings || getStoreSettings())
    };

    const pageTitle =
        document.getElementById("pageTitle");

    const headerLogo =
        document.getElementById("headerLogo");

    const footerLogo =
        document.getElementById("footerLogo");

    const nameParts =
        settings.storeName.trim().split(/\s+/);

    const firstWord = nameParts[0] || "BRANDORA";

    const restWords =
        nameParts.slice(1).join(" ");

    const logoHtml =
        `${firstWord}<span>${restWords}</span>`;

    if (pageTitle) {
        pageTitle.textContent =
            `${settings.storeName} | Premium Collection`;
    }

    if (headerLogo) {
        headerLogo.innerHTML = logoHtml;
    }

    if (footerLogo) {
        footerLogo.innerHTML = logoHtml;
    }

    const whatsappNumber =
        String(settings.whatsappNumber || "")
            .replace(/\D/g, "");

    const whatsappURL =
        `https://wa.me/${whatsappNumber}`;

    const heroWhatsAppBtn =
        document.getElementById("heroWhatsAppBtn");

    if (heroWhatsAppBtn) {
        heroWhatsAppBtn.href =
            `${whatsappURL}?text=${encodeURIComponent(
                "Hi, I want to inquire about your products."
            )}`;

        heroWhatsAppBtn.target = "_blank";
        heroWhatsAppBtn.rel = "noopener";
    }

    const contactWhatsAppLink =
        document.getElementById("contactWhatsAppLink");

    if (contactWhatsAppLink) {
        contactWhatsAppLink.textContent =
            settings.phone;

        contactWhatsAppLink.href = whatsappURL;
    }

    const contactEmailLink =
        document.getElementById("contactEmailLink");

    if (contactEmailLink) {
        contactEmailLink.textContent =
            settings.email;

        contactEmailLink.href =
            `mailto:${settings.email}`;
    }

    const contactAddressSpan =
        document.getElementById("contactAddressSpan");

    if (contactAddressSpan) {
        contactAddressSpan.textContent =
            settings.address;
    }

    const footerFacebook =
        document.getElementById("footerFacebook");

    if (footerFacebook) {
        footerFacebook.href = settings.facebook;
    }

    const footerInstagram =
        document.getElementById("footerInstagram");

    if (footerInstagram) {
        footerInstagram.href = settings.instagram;
    }

    const footerWhatsApp =
        document.getElementById("footerWhatsApp");

    if (footerWhatsApp) {
        footerWhatsApp.href = whatsappURL;
    }

    const footerPhoneText =
        document.getElementById("footerPhoneText");

    if (footerPhoneText) {
        footerPhoneText.textContent = settings.phone;
    }

    const footerWaText =
        document.getElementById("footerWaText");

    if (footerWaText) {
        footerWaText.textContent = settings.phone;
    }

    const footerEmailText =
        document.getElementById("footerEmailText");

    if (footerEmailText) {
        footerEmailText.textContent = settings.email;
    }

    const footerLocationText =
        document.getElementById("footerLocationText");

    if (footerLocationText) {
        footerLocationText.textContent = settings.address;
    }

    const footerCopyStore =
        document.getElementById("footerCopyStore");

    if (footerCopyStore) {
        footerCopyStore.textContent = settings.storeName;
    }

    const settingFields = {
        settingStoreName: settings.storeName,
        settingWhatsApp: settings.whatsappNumber,
        settingPhone: settings.phone,
        settingEmail: settings.email,
        settingAddress: settings.address,
        settingInstagram: settings.instagram,
        settingFacebook: settings.facebook
    };

    Object.entries(settingFields).forEach(
        ([id, value]) => {
            const element = document.getElementById(id);

            if (element) {
                element.value = value;
            }
        }
    );
}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts(itemsToRender) {
    if (!productGrid) {
        return;
    }

    productGrid.innerHTML = "";

    if (!itemsToRender.length) {
        productGrid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:60px 20px;">
                <i class="fa-solid fa-box-open"
                   style="font-size:48px;margin-bottom:16px;"></i>

                <h3>No Products Found</h3>

                <p>
                    Your shop is currently empty.
                    Use the Admin Panel to add products.
                </p>

                <a href="#adminSection" class="btn btn-primary">
                    <i class="fa-solid fa-plus"></i>
                    Go to Admin Panel
                </a>
            </div>
        `;

        return;
    }

    itemsToRender.forEach(product => {
        const stock = getProductStock(product);
        const soldOut = stock <= 0;

        const sizesArray =
            String(product.sizes || "")
                .split(",")
                .map(size => size.trim())
                .filter(Boolean);

        const sizesHtml = sizesArray
            .map(size => `<span class="size-tag">${size}</span>`)
            .join("");

        const images = getProductImages(product);
        const mainImage = images[0] || "";

        let thumbnailsHtml = "";

        if (images.length > 1) {
            thumbnailsHtml = `
                <div class="product-thumbnails">
                    ${images.map((img, index) => `
                        <button
                            type="button"
                            class="product-thumb ${index === 0 ? "active" : ""}"
                            onclick="changeProductImage(${product.id}, ${index})"
                        >
                            <img
                                src="${img}"
                                alt="${product.name} ${index + 1}"
                            >
                        </button>
                    `).join("")}
                </div>
            `;
        }

        const cartButton = soldOut
            ? `
                <button class="btn-add-cart sold-out-btn" disabled>
                    <i class="fa-solid fa-ban"></i>
                    Sold Out
                </button>
            `
            : `
                <button
                    class="btn-add-cart"
                    onclick="addToCart(${product.id})"
                >
                    <i class="fa-solid fa-bag-shopping"></i>
                    Add to Cart
                </button>
            `;

        const stockHtml = soldOut
            ? `
                <div class="product-stock sold-out"
                     style="color:#dc3545;font-weight:700;margin:8px 0 12px;">
                    <i class="fa-solid fa-circle-xmark"></i>
                    Sold Out
                </div>
            `
            : `
                <div class="product-stock"
                     style="color:#168a45;font-weight:700;margin:8px 0 12px;">
                    <i class="fa-solid fa-box"></i>
                    ${stock} available
                </div>
            `;

        const card = document.createElement("div");

        card.className = "product-card";

        card.innerHTML = `
            <div class="product-image-wrap">
                <span class="product-badge">
                    ${product.badge || "Imported"}
                </span>

                <img
                    id="main-img-${product.id}"
                    class="product-main-image"
                    src="${mainImage}"
                    alt="${product.name}"
                    loading="lazy"
                >

                ${thumbnailsHtml}
            </div>

            <div class="product-info">
                <span class="product-category-tag">
                    ${product.category || ""}
                </span>

                <h3 class="product-title">
                    ${product.name}
                </h3>

                <p class="product-description">
                    ${product.description || ""}
                </p>

                <div class="product-meta-row">
                    <span class="product-price">
                        Rs. ${Number(product.price).toLocaleString()}
                    </span>

                    <div class="product-sizes">
                        ${sizesHtml}
                    </div>
                </div>

                ${stockHtml}

                <div class="product-buttons">
                    ${cartButton}

                    <button
                        class="btn-quick-wa"
                        onclick="quickWhatsAppOrder(${product.id})"
                        title="Order on WhatsApp"
                    >
                        <i class="fa-brands fa-whatsapp"></i>
                    </button>
                </div>
            </div>
        `;

        productGrid.appendChild(card);
    });
}


/* =========================================================
   CHANGE PRODUCT IMAGE
========================================================= */

function changeProductImage(productId, index) {
    const product = getProducts().find(
        p => p.id === productId
    );

    if (!product) {
        return;
    }

    const images = getProductImages(product);

    const mainImage = document.getElementById(
        `main-img-${productId}`
    );

    if (mainImage && images[index]) {
        mainImage.src = images[index];

        const card = mainImage.closest(".product-card");

        if (card) {
            card.querySelectorAll(".product-thumb")
                .forEach((button, i) => {
                    button.classList.toggle(
                        "active",
                        i === index
                    );
                });
        }
    }
}


/* =========================================================
   ADMIN TABLE
========================================================= */

function renderAdminTable() {
    if (!adminTableBody || !adminProductCount) {
        return;
    }

    const products = getProducts();

    adminProductCount.textContent = products.length;
    adminTableBody.innerHTML = "";

    if (!products.length) {
        adminTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;padding:30px;">
                    No products added yet.
                </td>
            </tr>
        `;

        return;
    }

    products.forEach(product => {
        const images = getProductImages(product);
        const firstImage = images[0] || "";
        const stock = getProductStock(product);

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <img src="${firstImage}" alt="${product.name}">
            </td>

            <td>
                <strong>${product.name}</strong>
            </td>

            <td>${product.category || ""}</td>

            <td>Rs. ${Number(product.price).toLocaleString()}</td>

            <td>${product.sizes || ""}</td>

            <td>
                ${stock === 0
                    ? '<span style="color:#dc3545;font-weight:700;">Sold Out</span>'
                    : `<span style="color:#168a45;font-weight:700;">${stock}</span>`
                }
            </td>

            <td>
                <div class="table-actions">
                    <button
                        class="btn-table-action btn-edit"
                        onclick="editProduct(${product.id})"
                    >
                        <i class="fa-solid fa-pen"></i>
                        Edit
                    </button>

                    <button
                        class="btn-table-action btn-delete"
                        onclick="deleteProduct(${product.id})"
                    >
                        <i class="fa-solid fa-trash"></i>
                        Delete
                    </button>
                </div>
            </td>
        `;

        adminTableBody.appendChild(row);
    });
}


/* =========================================================
   RESET PRODUCT FORM
========================================================= */

function resetProductForm() {
    if (!productForm) {
        return;
    }

    productForm.reset();

    editProductId.value = "";
    prodImageBase64.value = "";

    const stockInput =
        document.getElementById("prodStock");

    if (stockInput) {
        stockInput.value = 1;
    }

    formTitle.innerHTML =
        '<i class="fa-solid fa-plus-circle"></i> Add New Product';

    saveProductBtn.textContent = "Save Product";
    cancelEditBtn.style.display = "none";

    saveProductBtn.disabled = false;
}


/* =========================================================
   EDIT PRODUCT
========================================================= */

function editProduct(id) {
    const products = getProducts();

    const product = products.find(
        p => p.id === id
    );

    if (!product) {
        return;
    }

    editProductId.value = product.id;

    document.getElementById("prodName").value =
        product.name || "";

    document.getElementById("prodPrice").value =
        product.price || "";

    document.getElementById("prodCategory").value =
        product.category || "";

    document.getElementById("prodBadge").value =
        product.badge || "";

    document.getElementById("prodSizes").value =
        product.sizes || "";

    document.getElementById("prodDesc").value =
        product.description || "";

    const stockInput =
        document.getElementById("prodStock");

    if (stockInput) {
        stockInput.value = getProductStock(product);
    }

    prodImageBase64.value = JSON.stringify(
        getProductImages(product)
    );

    formTitle.innerHTML =
        `<i class="fa-solid fa-pen-to-square"></i> Edit Product (#${product.id})`;

    saveProductBtn.textContent = "Update Product";
    cancelEditBtn.style.display = "inline-block";

    location.href = "#adminSection";
}


/* =========================================================
   DELETE PRODUCT
========================================================= */

function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) {
        return;
    }

    const products = getProducts().filter(
        p => p.id !== id
    );

    saveProducts(products);

    renderProducts(products);
    renderAdminTable();
}


/* =========================================================
   CART
========================================================= */

function toggleCart() {
    if (!cartDrawer || !cartOverlay) {
        return;
    }

    cartDrawer.classList.toggle("active");
    cartOverlay.classList.toggle("active");
}


function addToCart(productId) {
    const products = getProducts();

    const product = products.find(
        p => p.id === productId
    );

    if (!product) {
        return;
    }

    const stock = getProductStock(product);

    if (stock <= 0) {
        alert("Sorry, this product is sold out.");
        return;
    }

    const existingItem = cart.find(
        item => item.id === productId
    );

    if (existingItem) {
        if (existingItem.quantity >= stock) {
            alert(`Only ${stock} piece(s) available.`);
            return;
        }

        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            stock,
            quantity: 1
        });
    }

    updateCartUI();

    if (
        cartDrawer &&
        !cartDrawer.classList.contains("active")
    ) {
        toggleCart();
    }
}


function updateQuantity(productId, change) {
    const item = cart.find(
        p => p.id === productId
    );

    if (!item) {
        return;
    }

    const currentProduct = getProducts().find(
        p => p.id === productId
    );

    const stock = currentProduct
        ? getProductStock(currentProduct)
        : getProductStock(item);

    if (
        change > 0 &&
        item.quantity >= stock
    ) {
        alert(`Only ${stock} piece(s) available.`);
        return;
    }

    item.quantity += change;

    if (item.quantity <= 0) {
        cart = cart.filter(
            p => p.id !== productId
        );
    }

    updateCartUI();
}


function removeFromCart(productId) {
    cart = cart.filter(
        p => p.id !== productId
    );

    updateCartUI();
}


function updateCartUI() {
    if (!cartBody) {
        return;
    }

    const totalItems = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    if (cartBadge) {
        cartBadge.textContent = totalItems;
    }

    if (cartCount) {
        cartCount.textContent = totalItems;
    }

    if (!cart.length) {
        if (emptyCart) {
            emptyCart.style.display = "block";
        }

        if (cartFooter) {
            cartFooter.style.display = "none";
        }

        cartBody.querySelectorAll(".cart-item")
            .forEach(item => item.remove());

        return;
    }

    if (emptyCart) {
        emptyCart.style.display = "none";
    }

    if (cartFooter) {
        cartFooter.style.display = "block";
    }

    let subtotal = 0;
    let cartItemsHtml = "";

    cart.forEach(item => {
        subtotal += Number(item.price) * item.quantity;

        const images = getProductImages(item);
        const itemImage = images[0] || "";

        const currentProduct = getProducts().find(
            p => p.id === item.id
        );

        const stock = currentProduct
            ? getProductStock(currentProduct)
            : getProductStock(item);

        const plusDisabled =
            item.quantity >= stock;

        cartItemsHtml += `
            <div class="cart-item">
                <img
                    src="${itemImage}"
                    alt="${item.name}"
                    class="cart-item-img"
                >

                <div class="cart-item-details">
                    <h4 class="cart-item-title">
                        ${item.name}
                    </h4>

                    <div class="cart-item-price">
                        Rs. ${Number(item.price).toLocaleString()}
                    </div>

                    <div class="cart-item-controls">
                        <button
                            class="quantity-btn"
                            onclick="updateQuantity(${item.id}, -1)"
                        >-</button>

                        <span class="cart-item-qty">
                            ${item.quantity}
                        </span>

                        <button
                            class="quantity-btn"
                            onclick="updateQuantity(${item.id}, 1)"
                            ${plusDisabled ? "disabled" : ""}
                        >+</button>

                        <button
                            class="cart-item-remove"
                            onclick="removeFromCart(${item.id})"
                        >
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    cartBody.querySelectorAll(".cart-item")
        .forEach(item => item.remove());

    cartBody.insertAdjacentHTML(
        "afterbegin",
        cartItemsHtml
    );

    const grandTotal = subtotal + SHIPPING_FEE;

    if (cartSubtotal) {
        cartSubtotal.textContent =
            `Rs. ${subtotal.toLocaleString()}`;
    }

    if (cartGrandTotal) {
        cartGrandTotal.textContent =
            `Rs. ${grandTotal.toLocaleString()}`;
    }
}


/* =========================================================
   WHATSAPP CHECKOUT
========================================================= */

function processWhatsAppCheckout() {
    const name = document.getElementById("custName").value.trim();
    const phone = document.getElementById("custPhone").value.trim();
    const city = document.getElementById("custCity").value.trim();
    const address = document.getElementById("custAddress").value.trim();

    if (!name || !phone || !city || !address) {
        alert("Please fill in all delivery details.");
        return;
    }

    if (!cart.length) {
        alert("Your cart is empty.");
        return;
    }

    const currentProducts = getProducts();

    for (const item of cart) {
        const currentProduct = currentProducts.find(
            p => p.id === item.id
        );

        const stock = currentProduct
            ? getProductStock(currentProduct)
            : 0;

        if (
            stock <= 0 ||
            item.quantity > stock
        ) {
            alert(
                `${item.name} is no longer available in the selected quantity.`
            );

            updateCartUI();
            return;
        }
    }

    const settings = getStoreSettings();

    const whatsappNumber =
        String(settings.whatsappNumber || "")
            .replace(/\D/g, "");

    if (!whatsappNumber) {
        alert("Please set your WhatsApp number in Admin Settings.");
        return;
    }

    const subtotal = cart.reduce(
        (sum, item) =>
            sum + Number(item.price) * item.quantity,
        0
    );

    const grandTotal = subtotal + SHIPPING_FEE;

    const itemsListText = cart.map(
        item =>
            `• ${item.name} (Qty: ${item.quantity}) - Rs. ${(Number(item.price) * item.quantity).toLocaleString()}`
    ).join("\n");

    const message =
        `*New Order - ${settings.storeName} (Cash on Delivery)*\n\n` +
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

    const whatsappURL =
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(
        whatsappURL,
        "_blank",
        "noopener"
    );
}


/* =========================================================
   QUICK WHATSAPP ORDER
========================================================= */

function quickWhatsAppOrder(productId) {
    const products = getProducts();

    const product = products.find(
        p => p.id === productId
    );

    if (!product) {
        return;
    }

    const stock = getProductStock(product);

    if (stock <= 0) {
        alert("Sorry, this product is sold out.");
        return;
    }

    const settings = getStoreSettings();

    const whatsappNumber =
        String(settings.whatsappNumber || "")
            .replace(/\D/g, "");

    if (!whatsappNumber) {
        alert("Please set your WhatsApp number in Admin Settings.");
        return;
    }

    const message =
        `*Quick Order - ${settings.storeName}*\n\n` +
        `Product: ${product.name}\n` +
        `Category: ${product.category}\n` +
        `Price: Rs. ${Number(product.price).toLocaleString()}\n` +
        `Available: ${stock}\n\n` +
        `I would like to order this item. Please share further details.`;

    const whatsappURL =
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(
        whatsappURL,
        "_blank",
        "noopener"
    );
}


/* =========================================================
   EVENT LISTENERS
========================================================= */

function setupEventListeners() {

    /* CATEGORY FILTERS */

    if (categoryFilters) {
        categoryFilters.addEventListener("click", e => {
            if (!e.target.classList.contains("filter-btn")) {
                return;
            }

            document.querySelectorAll(".filter-btn")
                .forEach(btn => btn.classList.remove("active"));

            e.target.classList.add("active");

            const filter =
                e.target.getAttribute("data-filter");

            const products = getProducts();

            if (filter === "all") {
                renderProducts(products);
            } else {
                renderProducts(
                    products.filter(
                        p => p.category === filter
                    )
                );
            }
        });
    }


    /* NAVIGATION FILTERS */

    document.querySelectorAll(".nav-link[data-filter]")
        .forEach(link => {
            link.addEventListener("click", () => {
                const filter =
                    link.getAttribute("data-filter");

                document.querySelectorAll(".filter-btn")
                    .forEach(btn => {
                        if (
                            btn.getAttribute("data-filter") === filter
                        ) {
                            btn.click();
                        }
                    });

                if (navMenu) {
                    navMenu.classList.remove("active");
                }
            });
        });


    /* ADMIN TABS */

    adminTabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            adminTabBtns.forEach(
                b => b.classList.remove("active")
            );

            adminTabContents.forEach(
                content => content.classList.remove("active")
            );

            btn.classList.add("active");

            const target = document.getElementById(
                btn.getAttribute("data-tab")
            );

            if (target) {
                target.classList.add("active");
            }
        });
    });


    /* =====================================================
       CLOUDINARY MULTIPLE IMAGE UPLOAD
    ===================================================== */

    if (prodImageFile) {
        prodImageFile.addEventListener("change", async e => {
            const files = Array.from(
                e.target.files || []
            );

            if (!files.length) {
                return;
            }

            if (files.length > 4) {
                alert("Maximum 4 images allowed per product.");
            }

            const selectedFiles = files.slice(0, 4);

            const previousButtonText =
                saveProductBtn.textContent;

            try {
                saveProductBtn.disabled = true;

                saveProductBtn.textContent =
                    "Uploading Images...";

                // Compress images.
                const compressedImages = await Promise.all(
                    selectedFiles.map(
                        file => compressImage(file)
                    )
                );

                // Upload to Cloudinary.
                const uploadedURLs = await Promise.all(
                    compressedImages.map(
                        dataURL => uploadImageToCloudinary(dataURL)
                    )
                );

                // Save Cloudinary URLs in the existing hidden field.
                prodImageBase64.value =
                    JSON.stringify(uploadedURLs);

                alert(
                    `${uploadedURLs.length} image(s) uploaded successfully to Cloudinary!`
                );

            } catch (error) {
                console.error(
                    "Cloudinary image upload failed:",
                    error
                );

                alert(
                    "Image upload failed. Please check your internet connection and Cloudinary Unsigned Upload Preset."
                );

            } finally {
                saveProductBtn.disabled = false;

                // Keep the correct button label for edit mode.
                saveProductBtn.textContent =
                    editProductId.value
                        ? "Update Product"
                        : "Save Product";
            }
        });
    }


    /* SAVE PRODUCT */

    if (productForm) {
        productForm.addEventListener("submit", e => {
            e.preventDefault();

            const idVal = editProductId.value;

            const name =
                document.getElementById("prodName").value.trim();

            const price = Number(
                document.getElementById("prodPrice").value
            );

            const category =
                document.getElementById("prodCategory").value;

            const badge =
                document.getElementById("prodBadge").value.trim();

            const sizes =
                document.getElementById("prodSizes").value.trim();

            const description =
                document.getElementById("prodDesc").value.trim();

            const stockInput =
                document.getElementById("prodStock");

            let stock = stockInput
                ? parseInt(stockInput.value, 10)
                : 1;

            if (
                !Number.isFinite(stock) ||
                stock < 0
            ) {
                stock = 1;
            }

            let images = [];

            try {
                images = JSON.parse(
                    prodImageBase64.value || "[]"
                );
            } catch {
                images = [];
            }

            let products = getProducts();

            /* EDIT EXISTING PRODUCT */

            if (idVal) {
                const index = products.findIndex(
                    p => p.id == idVal
                );

                if (index !== -1) {
                    if (!images.length) {
                        images = getProductImages(
                            products[index]
                        );
                    }

                    products[index] = {
                        ...products[index],

                        id: Number(idVal),
                        name,
                        price,
                        category,
                        badge,
                        sizes,
                        description,
                        stock,

                        image: images[0] || "",
                        images
                    };
                }

            } else {

                /* NEW PRODUCT */

                if (!images.length) {
                    alert(
                        "Please select and upload at least one product image."
                    );

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
                    stock,

                    image: images[0],
                    images
                };

                products.unshift(newProduct);
            }

            const saved = saveProducts(products);

            if (!saved) {
                return;
            }

            renderProducts(products);
            renderAdminTable();
            resetProductForm();

            alert(
                "Product saved! Please check that it appears on the website."
            );
        });
    }


    /* CANCEL EDIT */

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener(
            "click",
            resetProductForm
        );
    }


    /* STORE SETTINGS */

    if (settingsForm) {
        settingsForm.addEventListener("submit", e => {
            e.preventDefault();

            const newSettings = {
                storeName:
                    document.getElementById("settingStoreName").value.trim(),

                whatsappNumber:
                    document.getElementById("settingWhatsApp").value.trim(),

                phone:
                    document.getElementById("settingPhone").value.trim(),

                email:
                    document.getElementById("settingEmail").value.trim(),

                address:
                    document.getElementById("settingAddress").value.trim(),

                instagram:
                    document.getElementById("settingInstagram").value.trim(),

                facebook:
                    document.getElementById("settingFacebook").value.trim()
            };

            saveStoreSettings(newSettings);
            applyStoreSettings(newSettings);

            alert(
                "Store settings updated. Please verify the online save."
            );
        });
    }


    /* CART BUTTONS */

    if (cartBtn) {
        cartBtn.addEventListener("click", toggleCart);
    }

    if (closeCartBtn) {
        closeCartBtn.addEventListener("click", toggleCart);
    }

    if (cartOverlay) {
        cartOverlay.addEventListener("click", toggleCart);
    }

    if (startShoppingBtn) {
        startShoppingBtn.addEventListener("click", () => {
            toggleCart();
            location.href = "#shop";
        });
    }


    /* MOBILE MENU */

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener("click", () => {
            navMenu.classList.add("active");
        });
    }

    if (closeMenuBtn && navMenu) {
        closeMenuBtn.addEventListener("click", () => {
            navMenu.classList.remove("active");
        });
    }

    document.querySelectorAll(".nav-menu a")
        .forEach(link => {
            link.addEventListener("click", () => {
                if (navMenu) {
                    navMenu.classList.remove("active");
                }
            });
        });


    /* WHATSAPP CHECKOUT */

    if (whatsappCheckoutBtn) {
        whatsappCheckoutBtn.addEventListener(
            "click",
            processWhatsAppCheckout
        );
    }
}


/* =========================================================
   PAGE INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    createStockFieldIfMissing();

    applyStoreSettings();

    // Load store settings from Firebase.
    const onlineSettings =
        await loadStoreSettingsFromFirebase();

    applyStoreSettings(onlineSettings);

    // Load products from Firebase.
    const products =
        await loadProductsFromFirebase();

    renderProducts(products);
    renderAdminTable();

    setupEventListeners();
    updateCartUI();
});
