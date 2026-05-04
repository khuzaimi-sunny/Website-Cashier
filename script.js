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
// ============ USER & AUTH SYSTEM ============
let currentUser = null;

// Default users database
let users = [
    { id: 1, username: "admin", password: "admin123", fullname: "Administrator", email: "admin@cheseto.com", role: "admin", avatar: "Admin", createdAt: new Date().toISOString() },
    { id: 2, username: "kasir1", password: "kasir123", fullname: "Budi Santoso", email: "budi@cheseto.com", role: "cashier", avatar: "BS", createdAt: new Date().toISOString() },
    { id: 3, username: "chef", password: "chef123", fullname: "Chef Ramli", email: "chef@cheseto.com", role: "chef", avatar: "CR", createdAt: new Date().toISOString() }
];

// Load users from localStorage
function loadUsers() {
    const stored = localStorage.getItem("cheseto_users");
    if (stored) {
        users = JSON.parse(stored);
    } else {
        saveUsers();
    }
}

function saveUsers() {
    localStorage.setItem("cheseto_users", JSON.stringify(users));
}

// Menu Data (sama seperti sebelumnya)
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
    { id: 10, name: "Chicken Rice Bowl", category: "Rice", price: 7.20, stock: false, pan: null },
    { id: 11, name: "French Fries", category: "Snacks", price: 3.50, stock: true, pan: null },
    { id: 12, name: "Iced Tea", category: "Drinks", price: 1.99, stock: true, pan: null }
];

let cart = [];
let currentCategory = "all";
let searchQuery = "";
let orderHistory = [];

// Load order history
function loadHistory() {
    const stored = localStorage.getItem("cheseto_orders");
    if (stored) {
        orderHistory = JSON.parse(stored);
    }
}

function saveHistory() {
    localStorage.setItem("cheseto_orders", JSON.stringify(orderHistory));
}

// ============ AUTH FUNCTIONS ============
function showAuthModal(mode = "login") {
    const modal = document.getElementById("authModal");
    const authTitle = document.getElementById("authTitle");
    const container = document.getElementById("authFormContainer");
    
    authTitle.textContent = mode === "login" ? "Login" : "Register";
    
    if (mode === "login") {
        container.innerHTML = `
            <form id="loginForm">
                <div class="input-group">
                    <label>Username</label>
                    <input type="text" id="loginUsername" placeholder="Masukkan username" required>
                </div>
                <div class="input-group">
                    <label>Password</label>
                    <input type="password" id="loginPassword" placeholder="Masukkan password" required>
                </div>
                <button type="submit" class="btn-auth">Login</button>
                <div class="auth-switch">
                    Belum punya akun? <a id="switchToRegister">Daftar disini</a>
                </div>
            </form>
        `;
        
        document.getElementById("loginForm")?.addEventListener("submit", handleLogin);
        document.getElementById("switchToRegister")?.addEventListener("click", () => showAuthModal("register"));
    } else {
        container.innerHTML = `
            <form id="registerForm">
                <div class="input-group">
                    <label>Nama Lengkap</label>
                    <input type="text" id="regFullname" placeholder="Nama lengkap" required>
                </div>
                <div class="input-group">
                    <label>Email</label>
                    <input type="email" id="regEmail" placeholder="Email" required>
                </div>
                <div class="input-group">
                    <label>Username</label>
                    <input type="text" id="regUsername" placeholder="Username" required>
                </div>
                <div class="input-group">
                    <label>Password</label>
                    <input type="password" id="regPassword" placeholder="Password" required>
                </div>
                <div class="input-group">
                    <label>Role</label>
                    <select id="regRole">
                        <option value="cashier">Cashier (Kasir)</option>
                        <option value="chef">Chef (Dapur)</option>
                    </select>
                </div>
                <button type="submit" class="btn-auth">Daftar</button>
                <div class="auth-switch">
                    Sudah punya akun? <a id="switchToLogin">Login disini</a>
                </div>
            </form>
        `;
        
        document.getElementById("registerForm")?.addEventListener("submit", handleRegister);
        document.getElementById("switchToLogin")?.addEventListener("click", () => showAuthModal("login"));
    }
    
    modal.style.display = "block";
    
    // Close modal
    document.querySelector(".close-modal")?.addEventListener("click", () => {
        modal.style.display = "none";
    });
    window.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
    });
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = { ...user };
        localStorage.setItem("cheseto_currentUser", JSON.stringify(currentUser));
        document.getElementById("authModal").style.display = "none";
        showToast(`Welcome back, ${user.fullname}!`, "#10B981");
        renderApp();
    } else {
        showToast("Username atau password salah!", "#EF4444");
    }
}

function handleRegister(e) {
    e.preventDefault();
    const fullname = document.getElementById("regFullname").value;
    const email = document.getElementById("regEmail").value;
    const username = document.getElementById("regUsername").value;
    const password = document.getElementById("regPassword").value;
    const role = document.getElementById("regRole").value;
    
    if (users.find(u => u.username === username)) {
        showToast("Username sudah terdaftar!", "#EF4444");
        return;
    }
    
    const newUser = {
        id: users.length + 1,
        username,
        password,
        fullname,
        email,
        role,
        avatar: fullname.charAt(0) + (fullname.split(" ")[1]?.charAt(0) || ""),
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers();
    showToast("Registrasi berhasil! Silakan login.", "#10B981");
    showAuthModal("login");
}

function logout() {
    currentUser = null;
    localStorage.removeItem("cheseto_currentUser");
    cart = [];
    renderApp();
    showToast("Anda telah logout", "#64748B");
}

// ============ RENDER UI ============
function renderApp() {
    renderSidebar();
    renderMainContent();
}

function renderSidebar() {
    const navMenu = document.getElementById("navMenu");
    const profileSection = document.getElementById("profileSection");
    
    if (!currentUser) {
        navMenu.innerHTML = `
            <a href="#" class="nav-item" id="loginNavBtn">
                <i class="fas fa-sign-in-alt"></i>
                <span>Login</span>
            </a>
            <a href="#" class="nav-item" id="registerNavBtn">
                <i class="fas fa-user-plus"></i>
                <span>Register</span>
            </a>
        `;
        profileSection.innerHTML = `
            <div class="user-badge" style="justify-content:center;">
                <i class="fas fa-user-circle"></i>
                <span>Guest</span>
            </div>
        `;
        document.getElementById("loginNavBtn")?.addEventListener("click", () => showAuthModal("login"));
        document.getElementById("registerNavBtn")?.addEventListener("click", () => showAuthModal("register"));
        return;
    }
    
    // Navigation based on role
    let navItems = `
        <a href="#" class="nav-item active" data-page="pos">
            <i class="fas fa-home"></i>
            <span>POS</span>
        </a>
        <a href="#" class="nav-item" data-page="history">
            <i class="fas fa-clock"></i>
            <span>History</span>
        </a>
    `;
    
    if (currentUser.role === "admin") {
        navItems += `
            <a href="#" class="nav-item" data-page="users">
                <i class="fas fa-users"></i>
                <span>Manage Users</span>
            </a>
            <a href="#" class="nav-item" data-page="report">
                <i class="fas fa-chart-line"></i>
                <span>Report</span>
            </a>
        `;
    }
    
    navItems += `
        <a href="#" class="nav-item" id="logoutNavBtn">
            <i class="fas fa-sign-out-alt"></i>
            <span>Logout</span>
        </a>
    `;
    
    navMenu.innerHTML = navItems;
    
    // Profile section
    profileSection.innerHTML = `
        <img src="https://ui-avatars.com/api/?background=FF6B35&color=fff&name=${currentUser.avatar}" alt="Profile">
        <div class="profile-info">
            <h4>${currentUser.fullname}</h4>
            <p>${currentUser.role === "admin" ? "Administrator" : (currentUser.role === "cashier" ? "Cashier" : "Chef")}</p>
        </div>
    `;
    
    // Event listeners
    document.querySelectorAll("[data-page]").forEach(link => {
        link.addEventListener("click", (e) => {
            document.querySelectorAll(".nav-item").forEach(nav => nav.classList.remove("active"));
            link.classList.add("active");
            const page = link.dataset.page;
            if (page === "pos") renderPOSPage();
            else if (page === "history") renderHistoryPage();
            else if (page === "users" && currentUser.role === "admin") renderUsersPage();
            else if (page === "report") renderReportPage();
        });
    });
    document.getElementById("logoutNavBtn")?.addEventListener("click", logout);
}

function renderMainContent() {
    if (!currentUser) {
        renderLandingPage();
    } else {
        renderPOSPage();
    }
}

function renderLandingPage() {
    const main = document.getElementById("mainContent");
    main.innerHTML = `
        <div style="display:flex; justify-content:center; align-items:center; min-height:70vh;">
            <div style="text-align:center;">
                <i class="fas fa-utensils" style="font-size:80px; color:#FF6B35;"></i>
                <h1 style="font-size:32px; margin:20px 0;">Welcome to Cheseto Restaurant</h1>
                <p style="color:#64748B;">Silakan login untuk mulai menggunakan POS system</p>
                <button id="landingLoginBtn" style="background:#FF6B35; color:white; border:none; padding:12px 32px; border-radius:40px; margin-top:24px; cursor:pointer;">Login Sekarang</button>
            </div>
        </div>
    `;
    document.getElementById("landingLoginBtn")?.addEventListener("click", () => showAuthModal("login"));
}

function renderPOSPage() {
    const main = document.getElementById("mainContent");
    main.innerHTML = `
        <div class="search-header">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" placeholder="Search category or menu" id="searchInput">
            </div>
            <div class="stock-warning">
                <i class="fas fa-exclamation-triangle"></i>
                <span id="outOfStockCount">0</span> items out of stocks
            </div>
        </div>
        <div class="category-tabs" id="categoryTabs">
            <button class="cat-tab active" data-cat="all">All</button>
            <button class="cat-tab" data-cat="Pizza">Pizza</button>
            <button class="cat-tab" data-cat="Burger">Burger</button>
            <button class="cat-tab" data-cat="Rice">Rice</button>
            <button class="cat-tab" data-cat="Snacks">Snacks</button>
            <button class="cat-tab" data-cat="Drinks">Drinks</button>
        </div>
        <div class="pos-layout">
            <div class="menu-section">
                <div class="section-title">
                    <h3>Choose <span id="activeCategoryName">Menu</span></h3>
                    <span id="menuResultCount">0</span> items
                </div>
                <div class="menu-grid" id="menuGrid"></div>
            </div>
            <div class="cart-section">
                <div class="cart-header">
                    <h3><i class="fas fa-receipt"></i> Current Orders</h3>
                    <div class="table-info">
                        <span>Cashier:</span>
                        <strong>${currentUser.fullname.split(" ")[0]}</strong>
                    </div>
                </div>
                <div class="cart-items" id="cartItems"></div>
                <div class="cart-summary">
                    <div class="summary-row"><span>items(<span id="totalItems">0</span>)</span><span>$<span id="subtotalAmount">0.00</span></span></div>
                    <div class="summary-row"><span>Tax (10%)</span><span>$<span id="taxAmount">0.00</span></span></div>
                    <div class="summary-row total"><span>Total</span><span>$<span id="totalAmount">0.00</span></span></div>
                    <button class="btn-print" id="printBillBtn"><i class="fas fa-print"></i> Complete Order</button>
                </div>
            </div>
        </div>
    `;
    
    renderMenu();
    renderCart();
    attachPOSEvents();
}

function renderHistoryPage() {
    const userOrders = orderHistory.filter(o => o.cashierId === currentUser.id || currentUser.role === "admin");
    const main = document.getElementById("mainContent");
    main.innerHTML = `
        <div style="background:white; border-radius:24px; padding:24px;">
            <h2 style="font-size:24px; margin-bottom:20px;"><i class="fas fa-clock"></i> Order History</h2>
            ${userOrders.length === 0 ? '<p style="color:#64748B;">Belum ada order tersimpan</p>' : 
                userOrders.map(order => `
                    <div style="border-bottom:1px solid #E2E8F0; padding:16px 0;">
                        <div style="display:flex; justify-content:space-between;">
                            <strong>Order #${order.id}</strong>
                            <span>${new Date(order.date).toLocaleString()}</span>
                        </div>
                        <div>Total: $${order.total.toFixed(2)}</div>
                        <div>Items: ${order.items.length}</div>
                    </div>
                `).join('')
            }
        </div>
    `;
}

function renderUsersPage() {
    const main = document.getElementById("mainContent");
    main.innerHTML = `
        <div style="background:white; border-radius:24px; padding:24px;">
            <h2 style="font-size:24px; margin-bottom:20px;"><i class="fas fa-users"></i> Manage Users</h2>
            <div style="overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse;">
                    <thead>
                        <tr><th style="text-align:left; padding:12px; background:#F8FAFC;">ID</th>
                            <th style="text-align:left; padding:12px;">Username</th>
                            <th style="text-align:left; padding:12px;">Fullname</th>
                            <th style="text-align:left; padding:12px;">Role</th>
                            <th style="text-align:left; padding:12px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr style="border-bottom:1px solid #E2E8F0;">
                                <td style="padding:12px;">${user.id}</td>
                                <td style="padding:12px;">${user.username}</td>
                                <td style="padding:12px;">${user.fullname}</td>
                                <td style="padding:12px;"><span class="${user.role === 'admin' ? 'admin-badge' : ''}" style="background:${user.role === 'admin' ? '#FF6B35' : '#E2E8F0'}; padding:4px 12px; border-radius:20px;">${user.role}</span></td>
                                <td style="padding:12px;">
                                    <button class="delete-user-btn" data-id="${user.id}" style="background:#EF4444; color:white; border:none; padding:6px 12px; border-radius:8px; cursor:pointer;">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <button id="addUserBtn" style="margin-top:20px; background:#FF6B35; color:white; border:none; padding:10px 20px; border-radius:40px; cursor:pointer;">+ Add New User</button>
        </div>
    `;
    
    document.querySelectorAll(".delete-user-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.dataset.id);
            if (id === currentUser.id) {
                showToast("Tidak bisa menghapus akun sendiri!", "#EF4444");
                return;
            }
            users = users.filter(u => u.id !== id);
            saveUsers();
            renderUsersPage();
            showToast("User berhasil dihapus", "#10B981");
        });
    });
    document.getElementById("addUserBtn")?.addEventListener("click", () => showAuthModal("register"));
}

function renderReportPage() {
    const totalOrders = orderHistory.length;
    const totalRevenue = orderHistory.reduce((sum, o) => sum + o.total, 0);
    const main = document.getElementById("mainContent");
    main.innerHTML = `
        <div style="background:white; border-radius:24px; padding:24px;">
            <h2 style="font-size:24px; margin-bottom:20px;"><i class="fas fa-chart-line"></i> Sales Report</h2>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px,1fr)); gap:20px;">
                <div style="background:#F8FAFC; padding:20px; border-radius:20px; text-align:center;">
                    <div style="font-size:32px; font-weight:700; color:#FF6B35;">${totalOrders}</div>
                    <div>Total Orders</div>
                </div>
                <div style="background:#F8FAFC; padding:20px; border-radius:20px; text-align:center;">
                    <div style="font-size:32px; font-weight:700; color:#FF6B35;">$${totalRevenue.toFixed(2)}</div>
                    <div>Total Revenue</div>
                </div>
            </div>
        </div>
    `;
}

// ============ POS FUNCTIONS ============
function renderMenu() {
    let filtered = menuData.filter(item => {
        const matchCategory = currentCategory === "all" || item.category === currentCategory;
        const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSearch;
    });
    
    document.getElementById("activeCategoryName").textContent = currentCategory === "all" ? "Menu" : currentCategory;
    document.getElementById("menuResultCount").textContent = filtered.length;
    document.getElementById("outOfStockCount").textContent = menuData.filter(m => !m.stock).length;
    
    const menuGrid = document.getElementById("menuGrid");
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
    
    document.querySelectorAll('.menu-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.id);
            const item = menuData.find(m => m.id === id);
            if (item && item.stock) addToCart(item);
            else if (item && !item.stock) showToast("Item sedang kosong!", "#EF4444");
        });
    });
}

function addToCart(item) {
    const existing = cart.find(c => c.id === item.id);
    if (existing) existing.quantity++;
    else cart.push({ ...item, quantity: 1 });
    renderCart();
    showToast(`${item.name} ditambahkan ke order`);
}

function renderCart() {
    const container = document.getElementById("cartItems");
    if (cart.length === 0) {
        container.innerHTML = `<div style="text-align:center; color:#94A3B8; padding:40px;">Belum ada order</div>`;
    } else {
        container.innerHTML = cart.map((item, idx) => `
            <div class="cart-item">
                <div class="cart-item-info"><div class="cart-item-name">${item.name}</div></div>
                <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                <div class="cart-item-actions">
                    <button class="qty-btn dec-qty" data-idx="${idx}">-</button>
                    <span class="item-qty">${item.quantity}</span>
                    <button class="qty-btn inc-qty" data-idx="${idx}">+</button>
                    <button class="remove-item" data-idx="${idx}"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `).join('');
        
        document.querySelectorAll('.dec-qty').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                if (cart[idx].quantity > 1) cart[idx].quantity--;
                else cart.splice(idx, 1);
                renderCart();
            });
        });
        document.querySelectorAll('.inc-qty').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                cart[idx].quantity++;
                renderCart();
            });
        });
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                cart.splice(idx, 1);
                renderCart();
            });
        });
    }
    updateCartSummary();
}

function updateCartSummary() {
    const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const tax = subtotal * 0.10;
    const total = subtotal + tax;
    
    document.getElementById("totalItems").textContent = totalItems;
    document.getElementById("subtotalAmount").textContent = subtotal.toFixed(2);
    document.getElementById("taxAmount").textContent = tax.toFixed(2);
    document.getElementById("totalAmount").textContent = total.toFixed(2);
}

function completeOrder() {
    if (cart.length === 0) {
        showToast("Keranjang kosong!", "#EF4444");
        return;
    }
    
    const total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const tax = total * 0.10;
    const grandTotal = total + tax;
    
    const newOrder = {
        id: Date.now(),
        cashierId: currentUser.id,
        cashierName: currentUser.fullname,
        items: [...cart],
        subtotal: total,
        tax: tax,
        total: grandTotal,
        date: new Date().toISOString()
    };
    
    orderHistory.unshift(newOrder);
    saveHistory();
    cart = [];
    renderCart();
    showToast(`Order completed! Total: $${grandTotal.toFixed(2)}`, "#10B981");
    
    // Print receipt simulation
    alert(`=== CHESETO RESTAURANT ===\nCashier: ${currentUser.fullname}\n${new Date().toLocaleString()}\n----------------------------\n${newOrder.items.map(i => `${i.name} x${i.quantity}   $${(i.price * i.quantity).toFixed(2)}`).join('\n')}\n----------------------------\nSubtotal: $${total.toFixed(2)}\nTax 10%: $${tax.toFixed(2)}\nTOTAL: $${grandTotal.toFixed(2)}\n----------------------------\nThank you!`);
}

function attachPOSEvents() {
    document.getElementById("searchInput")?.addEventListener("input", (e) => {
        searchQuery = e.target.value;
        renderMenu();
    });
    document.querySelectorAll(".cat-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".cat-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            currentCategory = tab.dataset.cat;
            renderMenu();
        });
    });
    document.getElementById("printBillBtn")?.addEventListener("click", completeOrder);
}

function showToast(msg, bgColor = "#1E293B") {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.style.background = bgColor;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
}

// ============ INITIALIZATION ============
function init() {
    loadUsers();
    loadHistory();
    const savedUser = localStorage.getItem("cheseto_currentUser");
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
    renderApp();
}

init();