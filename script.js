// Data Menu
const menuData = [
    { id: 1, name: "Orange Juice", category: "Drinks", price: 2.87, note: "Less Ice", stock: true, pan: null },
    { id: 2, name: "American Favorite", category: "Pizza", price: 4.87, crust: "Stuffed Crust Sosis", extras: "Extra Mozarella", stock: true, pan: 18 },
    { id: 3, name: "Chicken Mushroom", category: "Pizza", price: 5.87, crust: "Thin Crust", stock: true, pan: 9 },
    { id: 4, name: "Favorite Cheese", category: "Pizza", price: 6.57, crust: "Stuffed Crust Cheese", stock: true, pan: 7 },
    { id: 5, name: "Super Supreme", category: "Pizza", price: 5.75, crust: "Stuffed Crust Sosis", stock: true, pan: 14 },
    { id: 6, name: "Meat Lovers", category: "Pizza", price: 6.37, stock: true, pan: 10 },
    { id: 7, name: "Ultimate Cheese", category: "Pizza", price: 4.27, stock: true, pan: 8 },
    { id: 8, name: "Classic Burger", category: "Burger", price: 5.50, stock: true, pan: null },
    { id: 9, name: "Cheese Burger", category: "Burger", price: 6.20, stock: true, pan: null },
    { id: 10, name: "Chicken Rice Bowl", category: "Rice", price: 7.20, stock: false, pan: null }, // out of stock
    { id: 11, name: "French Fries", category: "Snacks", price: 3.50, stock: true, pan: null },
    { id: 12, name: "Iced Tea", category: "Drinks", price: 1.99, stock: true, pan: null }
];

let cart = []; // { id, name, note, crust, extras, price, quantity }
let currentCategory = "all";
let searchQuery = "";

// DOM Elements
const menuGrid = document.getElementById("menuGrid");
const cartItemsContainer = document.getElementById("cartItems");
const searchInput = document.getElementById("searchInput");
const categoryTabs = document.querySelectorAll(".cat-tab");
const activeCategoryName = document.getElementById("activeCategoryName");
const menuResultCount = document.getElementById("menuResultCount");
const totalItemsSpan = document.getElementById("totalItems");
const subtotalAmountSpan = document.getElementById("subtotalAmount");
const taxAmountSpan = document.getElementById("taxAmount");
const totalAmountSpan = document.getElementById("totalAmount");
const outOfStockCountSpan = document.getElementById("outOfStockCount");
const printBillBtn = document.getElementById("printBillBtn");
const toast = document.getElementById("toast");

// Helper update stock warning
function updateStockWarning() {
    const outOfStock = menuData.filter(m => !m.stock).length;
    outOfStockCountSpan.textContent = outOfStock;
}

// Render Menu berdasarkan filter
function renderMenu() {
    let filtered = menuData.filter(item => {
        const matchCategory = currentCategory === "all" || item.category === currentCategory;
        const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSearch;
    });

    // Update title
    const catDisplay = currentCategory === "all" ? "Menu" : currentCategory;
    activeCategoryName.textContent = catDisplay;
    menuResultCount.textContent = filtered.length;

    if (menuGrid) {
        menuGrid.innerHTML = filtered.map(item => `
            <div class="menu-card ${!item.stock ? 'out-of-stock' : ''}" data-id="${item.id}">
                <div class="badge-stock">${item.pan ? `${item.pan} Pan Available` : (item.stock ? 'In Stock' : 'Out of Stock')}</div>
                <h4>${item.name}</h4>
                ${item.note ? `<div class="note">${item.note}</div>` : ''}
                ${item.crust ? `<div class="note">Crust: ${item.crust}</div>` : ''}
                ${item.extras ? `<div class="note">Extras: ${item.extras}</div>` : ''}
                <div class="price">$${item.price.toFixed(2)}</div>
                ${!item.stock ? '<div style="color:#EF4444; font-size:11px; margin-top:8px;">Out of Stock</div>' : ''}
            </div>
        `).join('');

        // Event listener untuk setiap menu card (hanya jika in stock)
        document.querySelectorAll('.menu-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const id = parseInt(card.dataset.id);
                const item = menuData.find(m => m.id === id);
                if (item && item.stock) {
                    addToCart(item);
                } else if (item && !item.stock) {
                    showToast("Item sedang kosong!", "#EF4444");
                }
            });
        });
    }
}

// Add to cart
function addToCart(item) {
    const existingIndex = cart.findIndex(c => c.id === item.id);
    if (existingIndex !== -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            note: item.note || null,
            crust: item.crust || null,
            extras: item.extras || null,
            price: item.price,
            quantity: 1
        });
    }
    renderCart();
    showToast(`${item.name} ditambahkan ke order`);
}

// Render Cart
function renderCart() {
    if (!cartItemsContainer) return;
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<div style="text-align:center; color:#94A3B8; padding:40px;">Belum ada order</div>`;
    } else {
        cartItemsContainer.innerHTML = cart.map((item, idx) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    ${item.note ? `<div class="cart-item-note">${item.note}</div>` : ''}
                    ${item.crust ? `<div class="cart-item-note">${item.crust}</div>` : ''}
                    ${item.extras ? `<div class="cart-item-note">${item.extras}</div>` : ''}
                </div>
                <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                <div class="cart-item-actions">
                    <button class="qty-btn dec-qty" data-idx="${idx}">-</button>
                    <span class="item-qty">${item.quantity}</span>
                    <button class="qty-btn inc-qty" data-idx="${idx}">+</button>
                    <button class="remove-item" data-idx="${idx}"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `).join('');

        // Event untuk quantity & remove
        document.querySelectorAll('.dec-qty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.dataset.idx);
                if (cart[idx].quantity > 1) {
                    cart[idx].quantity--;
                } else {
                    cart.splice(idx, 1);
                }
                renderCart();
            });
        });
        document.querySelectorAll('.inc-qty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.dataset.idx);
                cart[idx].quantity++;
                renderCart();
            });
        });
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.dataset.idx);
                cart.splice(idx, 1);
                renderCart();
            });
        });
    }
    updateCartSummary();
}

// Update total, tax, items count
function updateCartSummary() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.10;
    const total = subtotal + tax;

    totalItemsSpan.textContent = totalItems;
    subtotalAmountSpan.textContent = subtotal.toFixed(2);
    taxAmountSpan.textContent = tax.toFixed(2);
    totalAmountSpan.textContent = total.toFixed(2);
}

// Print Bill (simulasi)
function printBill() {
    if (cart.length === 0) {
        showToast("Keranjang kosong!", "#EF4444");
        return;
    }
    let billContent = "=== CHESETO RESTAURANT ===\n";
    billContent += `Table: #907653 | T1\n`;
    billContent += `--------------------------------\n`;
    cart.forEach(item => {
        billContent += `${item.name} x${item.quantity}   $${(item.price * item.quantity).toFixed(2)}\n`;
        if (item.crust) billContent += `   ${item.crust}\n`;
    });
    const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const tax = subtotal * 0.10;
    billContent += `--------------------------------\n`;
    billContent += `Subtotal: $${subtotal.toFixed(2)}\n`;
    billContent += `Tax (10%): $${tax.toFixed(2)}\n`;
    billContent += `TOTAL: $${(subtotal + tax).toFixed(2)}\n`;
    billContent += `================================\n`;
    billContent += `Terima kasih! Enjoy your meal!\n`;
    alert(billContent);
    showToast("Struk dicetak (simulasi)");
    // Optional reset cart after print? Uncomment jika ingin:
    // cart = [];
    // renderCart();
}

// Show Toast
function showToast(msg, bgColor = "#1E293B") {
    toast.textContent = msg;
    toast.style.background = bgColor;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}

// Event Listeners
searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderMenu();
});

categoryTabs.forEach(tab => {
    tab.addEventListener("click", () => {
        categoryTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        currentCategory = tab.dataset.cat;
        renderMenu();
    });
});

printBillBtn.addEventListener("click", printBill);

// Inisialisasi
function init() {
    updateStockWarning();
    renderMenu();
    renderCart();
}

init();
