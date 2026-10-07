/* =========================================================
   E-COMMERCE & ADMIN PANEL JAVASCRIPT
   MULTIPLE PRODUCT IMAGES - MAX 4
========================================================= */

// STORAGE KEYS
const STORAGE_KEY_PRODUCTS = "local_store_products_v1";
const STORAGE_KEY_SETTINGS = "local_store_settings_v1";

// DEFAULT SETTINGS
const defaultSettings = {
    storeName: "MY STORE",
    whatsappNumber: "923001234567",
    phone: "+92 300 1234567",
    email: "info@yourstore.pk",
    address: "Karachi, Pakistan",
    instagram: "https://instagram.com",
    facebook: "https://facebook.com"
};

// SETTINGS
function getStoreSettings() {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);

    if (!saved) {
        return defaultSettings;
    }

    try {
        return JSON.parse(saved);
    } catch {
        return defaultSettings;
    }
}

function saveStoreSettings(settings) {
    localStorage.setItem(
        STORAGE_KEY_SETTINGS,
        JSON.stringify(settings)
    );
}

// PRODUCTS
function getProducts() {
    const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);

    if (!saved) {
        return [];
    }

    try {
        return JSON.parse(saved);
    } catch {
        return [];
    }
}

function saveProducts(products) {
    try {
        localStorage.setItem(
            STORAGE_KEY_PRODUCTS,
            JSON.stringify(products)
        );

        return true;

    } catch (error) {

        if (error.name === "QuotaExceededError") {

            alert(
                "Browser storage is full. Please use smaller images or fewer products."
            );

            return false;
        }

        throw error;
    }
}

// GET PRODUCT IMAGES
// This also supports old products that only have "image".
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

// COMPRESS IMAGE
function compressImage(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = (event) => {

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

                } else if (height >= width && height > max) {

                    width = Math.round(
                        width * max / height
                    );

                    height = max;
                }

                const canvas = document.createElement("canvas");

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

                const dataUrl =
                    canvas.toDataURL(
                        "image/jpeg",
                        0.7
                    );

                resolve(dataUrl);
            };

            img.onerror = reject;

            img.src = event.target.result;
        };

        reader.onerror = reject;

        reader.readAsDataURL(file);
    });
}

// CART
let cart = [];

const SHIPPING_FEE = 250;

// DOM ELEMENTS
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

// ADMIN ELEMENTS
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

// PAGE LOAD
document.addEventListener("DOMContentLoaded", () => {

    applyStoreSettings();

    renderProducts(getProducts());

    renderAdminTable();

    setupEventListeners();

    updateCartUI();
});

// APPLY SETTINGS
function applyStoreSettings() {

    const settings = getStoreSettings();

    document.getElementById("pageTitle").textContent =
        `${settings.storeName} | Premium Collection`;

    const nameParts =
        settings.storeName.trim().split(/\s+/);

    const firstWord =
        nameParts[0] || "MY";

    const restWords =
        nameParts.slice(1).join(" ") || "STORE";

    const logoHtml =
        `${firstWord}<span>${restWords}</span>`;

    document.getElementById("headerLogo").innerHTML =
        logoHtml;

    document.getElementById("footerLogo").innerHTML =
        logoHtml;

    document.getElementById("heroWhatsAppBtn").href =
        `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
            "Hi, I want to inquire about your products."
        )}`;

    document.getElementById("contactWhatsAppLink").textContent =
        settings.phone;

    document.getElementById("contactWhatsAppLink").href =
        `https://wa.me/${settings.whatsappNumber}`;

    document.getElementById("contactEmailLink").textContent =
        settings.email;

    document.getElementById("contactEmailLink").href =
        `mailto:${settings.email}`;

    document.getElementById("contactAddressSpan").textContent =
        settings.address;

    document.getElementById("footerFacebook").href =
        settings.facebook;

    document.getElementById("footerInstagram").href =
        settings.instagram;

    document.getElementById("footerWhatsApp").href =
        `https://wa.me/${settings.whatsappNumber}`;

    document.getElementById("footerPhoneText").textContent =
        settings.phone;

    document.getElementById("footerWaText").textContent =
        settings.phone;

    document.getElementById("footerEmailText").textContent =
        settings.email;

    document.getElementById("footerLocationText").textContent =
        settings.address;

    document.getElementById("footerCopyStore").textContent =
        settings.storeName;

    document.getElementById("settingStoreName").value =
        settings.storeName;

    document.getElementById("settingWhatsApp").value =
        settings.whatsappNumber;

    document.getElementById("settingPhone").value =
        settings.phone;

    document.getElementById("settingEmail").value =
        settings.email;

    document.getElementById("settingAddress").value =
        settings.address;

    document.getElementById("settingInstagram").value =
        settings.instagram;

    document.getElementById("settingFacebook").value =
        settings.facebook;
}

// RENDER PRODUCTS
function renderProducts(itemsToRender) {

    productGrid.innerHTML = "";

    if (itemsToRender.length === 0) {

        productGrid.innerHTML = `
            <div style="
                grid-column:1/-1;
                text-align:center;
                padding:60px 20px;
            ">

                <i
                    class="fa-solid fa-box-open"
                    style="
                        font-size:48px;
                        color:var(--text-light);
                        margin-bottom:16px;
                    "
                ></i>

                <h3
                    style="
                        font-size:18px;
                        margin-bottom:8px;
                    "
                >
                    No Products Found
                </h3>

                <p
                    style="
                        color:var(--text-secondary);
                        margin-bottom:20px;
                    "
                >
                    Your shop is currently empty.
                    Use the Admin Panel below to add your products.
                </p>

                <a
                    href="#adminSection"
                    class="btn btn-primary"
                >
                    <i class="fa-solid fa-plus"></i>
                    Go to Admin Panel
                </a>

            </div>
        `;

        return;
    }

    itemsToRender.forEach(product => {

        const sizesArray =
            String(product.sizes || "")
                .split(",")
                .map(s => s.trim())
                .filter(Boolean);

        const sizesHtml =
            sizesArray
                .map(size => `
                    <span class="size-tag">
                        ${size}
                    </span>
                `)
                .join("");

        const images =
            getProductImages(product);

        const mainImage =
            images[0] || "";

        let thumbnailsHtml = "";

        if (images.length > 1) {

            thumbnailsHtml = `
                <div class="product-thumbnails">

                    ${images.map((img, index) => `

                        <button
                            type="button"
                            class="product-thumb ${
                                index === 0 ? "active" : ""
                            }"
                            onclick="changeProductImage(
                                ${product.id},
                                ${index}
                            )"
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

        const card =
            document.createElement("div");

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
                    ${product.category}
                </span>

                <h3 class="product-title">
                    ${product.name}
                </h3>

                <p class="product-description">
                    ${product.description}
                </p>

                <div class="product-meta-row">

                    <span class="product-price">
                        Rs. ${Number(product.price).toLocaleString()}
                    </span>

                    <div class="product-sizes">
                        ${sizesHtml}
                    </div>

                </div>

                <div class="product-buttons">

                    <button
                        class="btn-add-cart"
                        onclick="addToCart(${product.id})"
                    >
                        <i class="fa-solid fa-bag-shopping"></i>
                        Add to Cart
                    </button>

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

// CHANGE PRODUCT IMAGE
function changeProductImage(productId, index) {

    const products = getProducts();

    const product =
        products.find(p => p.id === productId);

    if (!product) return;

    const images =
        getProductImages(product);

    const mainImage =
        document.getElementById(
            `main-img-${productId}`
        );

    if (mainImage && images[index]) {

        mainImage.src =
            images[index];
    }

    if (mainImage) {

        const card =
            mainImage.closest(".product-card");

        if (card) {

            const buttons =
                card.querySelectorAll(
                    ".product-thumb"
                );

            buttons.forEach((button, i) => {

                button.classList.toggle(
                    "active",
                    i === index
                );

            });
        }
    }
}

// ADMIN TABLE
function renderAdminTable() {

    const products = getProducts();

    adminProductCount.textContent =
        products.length;

    adminTableBody.innerHTML = "";

    if (products.length === 0) {

        adminTableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    style="
                        text-align:center;
                        color:var(--text-secondary);
                        padding:30px;
                    "
                >
                    No products added yet.
                    Use the form above to add your first product.
                </td>
            </tr>
        `;

        return;
    }

    products.forEach(product => {

        const images =
            getProductImages(product);

        const firstImage =
            images[0] || "";

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>
                <img
                    src="${firstImage}"
                    alt="${product.name}"
                >
            </td>

            <td>
                <strong>
                    ${product.name}
                </strong>
            </td>

            <td>
                ${product.category}
            </td>

            <td>
                Rs. ${Number(product.price).toLocaleString()}
            </td>

            <td>
                ${product.sizes}
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

// EVENT LISTENERS
function setupEventListeners() {

    // CATEGORY FILTER
    categoryFilters.addEventListener("click", e => {

        if (
            e.target.classList.contains("filter-btn")
        ) {

            document
                .querySelectorAll(".filter-btn")
                .forEach(btn =>
                    btn.classList.remove("active")
                );

            e.target.classList.add("active");

            const filter =
                e.target.getAttribute("data-filter");

            const products =
                getProducts();

            if (filter === "all") {

                renderProducts(products);

            } else {

                const filtered =
                    products.filter(
                        p => p.category === filter
                    );

                renderProducts(filtered);
            }
        }
    });

    // NAV FILTER
    document
        .querySelectorAll(".nav-link[data-filter]")
        .forEach(link => {

            link.addEventListener("click", () => {

                const filter =
                    link.getAttribute("data-filter");

                document
                    .querySelectorAll(".filter-btn")
                    .forEach(btn => {

                        if (
                            btn.getAttribute("data-filter") ===
                            filter
                        ) {
                            btn.click();
                        }

                    });

                navMenu.classList.remove("active");
            });
        });

    // ADMIN TABS
    adminTabBtns.forEach(btn => {

        btn.addEventListener("click", () => {

            adminTabBtns.forEach(b =>
                b.classList.remove("active")
            );

            adminTabContents.forEach(c =>
                c.classList.remove("active")
            );

            btn.classList.add("active");

            document
                .getElementById(
                    btn.getAttribute("data-tab")
                )
                .classList.add("active");
        });
    });

    // MULTIPLE IMAGE UPLOAD
    prodImageFile.addEventListener(
        "change",
        async e => {

            const files =
                Array.from(e.target.files);

            if (!files.length) return;

            if (files.length > 4) {

                alert(
                    "Maximum 4 images allowed per product."
                );
            }

            const selectedFiles =
                files.slice(0, 4);

            try {

                const images =
                    await Promise.all(
                        selectedFiles.map(
                            file => compressImage(file)
                        )
                    );

                prodImageBase64.value =
                    JSON.stringify(images);

                alert(
                    `${images.length} image(s) selected successfully.`
                );

            } catch (error) {

                console.error(error);

                alert(
                    "Some images could not be processed. Please try again."
                );
            }
        }
    );

    // SAVE PRODUCT
    productForm.addEventListener(
        "submit",
        e => {

            e.preventDefault();

            const idVal =
                editProductId.value;

            const name =
                document
                    .getElementById("prodName")
                    .value
                    .trim();

            const price =
                Number(
                    document
                        .getElementById("prodPrice")
                        .value
                );

            const category =
                document.getElementById(
                    "prodCategory"
                ).value;

            const badge =
                document
                    .getElementById("prodBadge")
                    .value
                    .trim();

            const sizes =
                document
                    .getElementById("prodSizes")
                    .value
                    .trim();

            const description =
                document
                    .getElementById("prodDesc")
                    .value
                    .trim();

            let images = [];

            try {

                images =
                    JSON.parse(
                        prodImageBase64.value || "[]"
                    );

            } catch {

                images = [];
            }

            let products =
                getProducts();

            // EDIT
            if (idVal) {

                const index =
                    products.findIndex(
                        p => p.id == idVal
                    );

                if (index !== -1) {

                    if (!images.length) {

                        images =
                            getProductImages(
                                products[index]
                            );
                    }

                    products[index] = {

                        id: Number(idVal),

                        name,

                        price,

                        category,

                        badge,

                        sizes,

                        description,

                        image:
                            images[0] || "",

                        images:
                            images
                    };
                }

            } else {

                // NEW PRODUCT
                if (!images.length) {

                    alert(
                        "Please select at least one product image."
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

                    image:
                        images[0],

                    images:
                        images
                };

                products.unshift(
                    newProduct
                );
            }

            const saved =
                saveProducts(products);

            if (!saved) return;

            renderProducts(
                products
            );

            renderAdminTable();

            resetProductForm();

            alert(
                "Product successfully saved!"
            );
        }
    );

    // CANCEL EDIT
    cancelEditBtn.addEventListener(
        "click",
        resetProductForm
    );

    // SETTINGS
    settingsForm.addEventListener(
        "submit",
        e => {

            e.preventDefault();

            const newSettings = {

                storeName:
                    document
                        .getElementById("settingStoreName")
                        .value
                        .trim(),

                whatsappNumber:
                    document
                        .getElementById("settingWhatsApp")
                        .value
                        .trim(),

                phone:
                    document
                        .getElementById("settingPhone")
                        .value
                        .trim(),

                email:
                    document
                        .getElementById("settingEmail")
                        .value
                        .trim(),

                address:
                    document
                        .getElementById("settingAddress")
                        .value
                        .trim(),

                instagram:
                    document
                        .getElementById("settingInstagram")
                        .value
                        .trim(),

                facebook:
                    document
                        .getElementById("settingFacebook")
                        .value
                        .trim()
            };

            saveStoreSettings(
                newSettings
            );

            applyStoreSettings();

            alert(
                "Store settings successfully updated!"
            );
        }
    );

    // CART
    cartBtn.addEventListener(
        "click",
        toggleCart
    );

    closeCartBtn.addEventListener(
        "click",
        toggleCart
    );

    cartOverlay.addEventListener(
        "click",
        toggleCart
    );

    if (startShoppingBtn) {

        startShoppingBtn.addEventListener(
            "click",
            () => {

                toggleCart();

                location.href =
                    "#shop";
            }
        );
    }

    // MOBILE MENU
    mobileMenuBtn.addEventListener(
        "click",
        () =>
            navMenu.classList.add("active")
    );

    closeMenuBtn.addEventListener(
        "click",
        () =>
            navMenu.classList.remove("active")
    );

    document
        .querySelectorAll(".nav-menu a")
        .forEach(link => {

            link.addEventListener(
                "click",
                () =>
                    navMenu.classList.remove(
                        "active"
                    )
            );
        });

    // WHATSAPP CHECKOUT
    whatsappCheckoutBtn.addEventListener(
        "click",
        processWhatsAppCheckout
    );
}

// CART TOGGLE
function toggleCart() {

    cartDrawer.classList.toggle(
        "active"
    );

    cartOverlay.classList.toggle(
        "active"
    );
}

// EDIT PRODUCT
function editProduct(id) {

    const products =
        getProducts();

    const product =
        products.find(
            p => p.id === id
        );

    if (!product) return;

    editProductId.value =
        product.id;

    document.getElementById("prodName").value =
        product.name;

    document.getElementById("prodPrice").value =
        product.price;

    document.getElementById("prodCategory").value =
        product.category;

    document.getElementById("prodBadge").value =
        product.badge;

    document.getElementById("prodSizes").value =
        product.sizes;

    document.getElementById("prodDesc").value =
        product.description;

    const images =
        getProductImages(product);

    prodImageBase64.value =
        JSON.stringify(images);

    formTitle.innerHTML =
        `<i class="fa-solid fa-pen-to-square"></i>
         Edit Product (#${product.id})`;

    saveProductBtn.textContent =
        "Update Product";

    cancelEditBtn.style.display =
        "inline-block";

    location.href =
        "#adminSection";
}

// DELETE PRODUCT
function deleteProduct(id) {

    if (
        !confirm(
            "Are you sure you want to delete this product?"
        )
    ) {
        return;
    }

    let products =
        getProducts();

    products =
        products.filter(
            p => p.id !== id
        );

    saveProducts(
        products
    );

    renderProducts(
        products
    );

    renderAdminTable();
}

// RESET PRODUCT FORM
function resetProductForm() {

    productForm.reset();

    editProductId.value =
        "";

    prodImageBase64.value =
        "";

    formTitle.innerHTML =
        `<i class="fa-solid fa-plus-circle"></i>
         Add New Product`;

    saveProductBtn.textContent =
        "Save Product";

    cancelEditBtn.style.display =
        "none";
}

// ADD TO CART
function addToCart(productId) {

    const products =
        getProducts();

    const product =
        products.find(
            p => p.id === productId
        );

    if (!product) return;

    const existingItem =
        cart.find(
            item => item.id === productId
        );

    if (existingItem) {

        existingItem.quantity += 1;

    } else {

        cart.push({
            ...product,
            quantity: 1
        });
    }

    updateCartUI();

    if (
        !cartDrawer.classList.contains(
            "active"
        )
    ) {

        toggleCart();
    }
}

// QUANTITY
function updateQuantity(
    productId,
    change
) {

    const item =
        cart.find(
            item => item.id === productId
        );

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {

        cart =
            cart.filter(
                p => p.id !== productId
            );
    }

    updateCartUI();
}

// REMOVE CART ITEM
function removeFromCart(productId) {

    cart =
        cart.filter(
            p => p.id !== productId
        );

    updateCartUI();
}

// UPDATE CART
function updateCartUI() {

    const totalItems =
        cart.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        );

    cartBadge.textContent =
        totalItems;

    cartCount.textContent =
        totalItems;

    if (cart.length === 0) {

        emptyCart.style.display =
            "block";

        cartFooter.style.display =
            "none";

        const items =
            cartBody.querySelectorAll(
                ".cart-item"
            );

        items.forEach(
            i => i.remove()
        );

        return;
    }

    emptyCart.style.display =
        "none";

    cartFooter.style.display =
        "block";

    let cartItemsHtml =
        "";

    let subtotal =
        0;

    cart.forEach(item => {

        subtotal +=
            Number(item.price) *
            item.quantity;

        const itemImages =
            getProductImages(item);

        const itemImage =
            itemImages[0] || "";

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
                        Rs. ${Number(
                            item.price
                        ).toLocaleString()}
                    </div>

                    <div class="cart-item-controls">

                        <button
                            class="quantity-btn"
                            onclick="updateQuantity(
                                ${item.id},
                                -1
                            )"
                        >
                            -
                        </button>

                        <span class="cart-item-qty">
                            ${item.quantity}
                        </span>

                        <button
                            class="quantity-btn"
                            onclick="updateQuantity(
                                ${item.id},
                                1
                            )"
                        >
                            +
                        </button>

                        <button
                            class="cart-item-remove"
                            onclick="removeFromCart(
                                ${item.id}
                            )"
                        >
                            <i class="fa-solid fa-trash"></i>
                        </button>

                    </div>

                </div>

            </div>
        `;
    });

    const existingItems =
        cartBody.querySelectorAll(
            ".cart-item"
        );

    existingItems.forEach(
        i => i.remove()
    );

    cartBody.insertAdjacentHTML(
        "afterbegin",
        cartItemsHtml
    );

    const grandTotal =
        subtotal +
        SHIPPING_FEE;

    cartSubtotal.textContent =
        `Rs. ${subtotal.toLocaleString()}`;

    cartGrandTotal.textContent =
        `Rs. ${grandTotal.toLocaleString()}`;
}

// WHATSAPP CHECKOUT
function processWhatsAppCheckout() {

    const name =
        document
            .getElementById("custName")
            .value
            .trim();

    const phone =
        document
            .getElementById("custPhone")
            .value
            .trim();

    const city =
        document
            .getElementById("custCity")
            .value
            .trim();

    const address =
        document
            .getElementById("custAddress")
            .value
            .trim();

    if (
        !name ||
        !phone ||
        !city ||
        !address
    ) {

        alert(
            "Please fill in all delivery details."
        );

        return;
    }

    if (cart.length === 0) {

        alert(
            "Your cart is empty."
        );

        return;
    }

    const settings =
        getStoreSettings();

    const subtotal =
        cart.reduce(
            (sum, item) =>
                sum +
                Number(item.price) *
                item.quantity,
            0
        );

    const grandTotal =
        subtotal +
        SHIPPING_FEE;

    const itemsListText =
        cart.map(item =>
            `• ${item.name} (Qty: ${item.quantity}) - Rs. ${
                (
                    Number(item.price) *
                    item.quantity
                ).toLocaleString()
            }`
        ).join("\n");

    const message =
        `*New Order - ${settings.storeName} (Cash on Delivery)*\n\n` +

        `*Customer Details:*\n` +
        `Name: ${name}\n` +
        `Phone: ${phone}\n` +
        `City: ${city}\n` +
        `Address: ${address}\n\n` +

        `*Order Items:*\n` +
        `${itemsListText}\n\n` +

        `Subtotal: Rs. ${subtotal.toLocaleString()}\n` +
        `Shipping (COD): Rs. ${SHIPPING_FEE}\n` +

        `*Total Amount: Rs. ${grandTotal.toLocaleString()}*\n\n` +

        `Payment Method: Cash on Delivery (COD)`;

    const encodedMessage =
        encodeURIComponent(
            message
        );

    const whatsappURL =
        `https://wa.me/${settings.whatsappNumber}?text=${encodedMessage}`;

    window.open(
        whatsappURL,
        "_blank"
    );
}

// QUICK WHATSAPP ORDER
function quickWhatsAppOrder(
    productId
) {

    const products =
        getProducts();

    const product =
        products.find(
            p => p.id === productId
        );

    if (!product) return;

    const settings =
        getStoreSettings();

    const message =
        `*Quick Order - ${settings.storeName}*\n\n` +

        `Product: ${product.name}\n` +

        `Category: ${product.category}\n` +

        `Price: Rs. ${Number(
            product.price
        ).toLocaleString()}\n\n` +

        `I would like to order this item. Please share further details.`;

    const encodedMessage =
        encodeURIComponent(
            message
        );

    const whatsappURL =
        `https://wa.me/${settings.whatsappNumber}?text=${encodedMessage}`;

    window.open(
        whatsappURL,
        "_blank"
    );
}
