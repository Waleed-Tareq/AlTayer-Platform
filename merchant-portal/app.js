/* Al-Tayer Merchant Portal — full interactive Menu Management */

const PAGE_META = {
  orders: { title: "Live Orders", subtitle: "Engineering Cafeteria · Real-time queue" },
  menu: { title: "Menu Management", subtitle: "Engineering Cafeteria" },
  analytics: { title: "Analytics & Revenue", subtitle: "Engineering Cafeteria · Performance" },
  settings: { title: "Settings", subtitle: "Engineering Cafeteria · Preferences" },
};

let categories = ["Sandwiches", "Cold Drinks", "Hot Meals", "Pastries"];
let activeCategory = "All";
let editingId = null;
let pendingImage = null;
let itemIdSeq = 9;
let currentPage = "menu";

function makeImage(label, c1 = "#1E3A8A", c2 = "#14B8A6") {
  const gid = "g" + Math.random().toString(36).slice(2, 9);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
    </linearGradient></defs>
    <rect width="400" height="400" fill="url(#${gid})"/>
    <text x="200" y="210" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="26" font-weight="700">${label}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

let menuItems = [
  { id: "item-1", name: "Zinger Wrap", description: "Crispy chicken with lettuce and special sauce", category: "Sandwiches", price: 2.25, calories: 450, inStock: true, image: makeImage("Zinger") },
  { id: "item-2", name: "Falafel Sandwich", description: "Fresh falafel, tahini, pickles & tomato in pita", category: "Sandwiches", price: 1.5, calories: 380, inStock: true, image: makeImage("Falafel", "#0F766E", "#1E3A8A") },
  { id: "item-3", name: "Iced Latte", description: "Espresso over ice with chilled milk", category: "Cold Drinks", price: 1.75, calories: 120, inStock: true, image: makeImage("Latte", "#2563EB", "#14B8A6") },
  { id: "item-4", name: "Fresh Orange Juice", description: "Freshly squeezed orange juice, no sugar added", category: "Cold Drinks", price: 1.25, calories: 110, inStock: false, image: makeImage("OJ", "#D97706", "#1E3A8A") },
  { id: "item-5", name: "Chicken Meal Box", description: "Grilled chicken, rice, salad & hummus", category: "Hot Meals", price: 3.5, calories: 620, inStock: true, image: makeImage("Meal", "#1E3A8A", "#0F766E") },
  { id: "item-6", name: "Mansaf Plate", description: "Traditional lamb mansaf with jameed & rice", category: "Hot Meals", price: 4.75, calories: 780, inStock: true, image: makeImage("Mansaf", "#14B8A6", "#1E3A8A") },
  { id: "item-7", name: "Cheese Croissant", description: "Buttery croissant filled with melted cheese", category: "Pastries", price: 1.1, calories: 290, inStock: true, image: makeImage("Croissant", "#92400E", "#1E3A8A") },
  { id: "item-8", name: "Chocolate Muffin", description: "Rich cocoa muffin with chocolate chips", category: "Pastries", price: 1.0, calories: 340, inStock: true, image: makeImage("Muffin", "#7C2D12", "#14B8A6") },
];

let liveOrders = [
  { id: "AT-5102", student: "Layla Hassan", items: "Zinger Wrap ×2", status: "Preparing", time: "2 min ago" },
  { id: "AT-5101", student: "Omar Khalil", items: "Iced Latte, Croissant", status: "Accepted", time: "4 min ago" },
  { id: "AT-5100", student: "Nour Al-Din", items: "Chicken Meal Box", status: "Ready", time: "6 min ago" },
  { id: "AT-5099", student: "Sara Mahmoud", items: "Falafel Sandwich ×3", status: "Preparing", time: "8 min ago" },
  { id: "AT-5098", student: "Yousef Amari", items: "Mansaf Plate", status: "Preparing", time: "11 min ago" },
];

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function showToast(message) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.style.display = "block";
  requestAnimationFrame(() => el.classList.add("show"));
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => {
      el.style.display = "none";
    }, 200);
  }, 2400);
}

/* ---------- Modal open / close (display:none based) ---------- */
function openModal(id) {
  const el = document.getElementById(id);
  if (!el) {
    console.error("Modal missing:", id);
    return;
  }
  el.style.display = "grid";
  el.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => el.classList.add("open"));
  document.body.style.overflow = "hidden";
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("open");
  el.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  setTimeout(() => {
    el.style.display = "none";
  }, 180);
}

/* ---------- Page navigation (real views, no placeholders) ---------- */
function switchPage(page) {
  if (!PAGE_META[page]) return;
  currentPage = page;

  document.querySelectorAll(".nav-item").forEach((n) => {
    const active = n.dataset.nav === page;
    n.classList.toggle("active", active);
    if (active) n.setAttribute("aria-current", "page");
    else n.removeAttribute("aria-current");
  });

  document.querySelectorAll(".page-view").forEach((view) => {
    const match = view.id === `view-${page}`;
    view.hidden = !match;
    view.style.display = match ? "block" : "none";
  });

  const meta = PAGE_META[page];
  const title = document.getElementById("pageTitle");
  const subtitle = document.getElementById("pageSubtitle");
  const actions = document.getElementById("menuActions");
  if (title) title.textContent = meta.title;
  if (subtitle) subtitle.textContent = meta.subtitle;
  if (actions) actions.style.display = page === "menu" ? "flex" : "none";

  if (page === "orders") renderLiveOrders();
  if (page === "analytics") renderAnalytics();
  if (page === "menu") {
    renderCategoryTabs();
    renderMenuGrid();
  }

  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  if (sidebar?.classList.contains("open")) {
    sidebar.classList.remove("open");
    overlay?.classList.remove("visible");
  }
}

/* ---------- Menu grid & tabs ---------- */
function getFilteredItems() {
  if (activeCategory === "All") return menuItems;
  return menuItems.filter((i) => i.category === activeCategory);
}

function renderCategoryTabs() {
  const wrap = document.getElementById("categoryTabs");
  if (!wrap) return;
  const tabs = ["All", ...categories];
  wrap.innerHTML = tabs
    .map(
      (cat) =>
        `<button type="button" class="cat-tab ${cat === activeCategory ? "active" : ""}" data-category="${escapeHtml(cat)}" role="tab" aria-selected="${cat === activeCategory}">${escapeHtml(cat)}</button>`
    )
    .join("");
}

function populateDishCategorySelect(selected) {
  const select = document.getElementById("dishCategory");
  if (!select) return;
  select.innerHTML = categories
    .map((c) => `<option value="${escapeHtml(c)}" ${c === selected ? "selected" : ""}>${escapeHtml(c)}</option>`)
    .join("");
}

function renderMenuGrid() {
  const grid = document.getElementById("menuGrid");
  const empty = document.getElementById("menuEmpty");
  if (!grid) return;

  const items = getFilteredItems();
  if (empty) {
    empty.hidden = items.length > 0;
    empty.style.display = items.length ? "none" : "block";
  }

  grid.innerHTML = items
    .map((item) => {
      const out = !item.inStock;
      return `
      <article class="menu-card ${out ? "out-of-stock" : ""}" data-id="${item.id}" data-category="${escapeHtml(item.category)}">
        <div class="card-image">
          <img src="${item.image}" alt="${escapeHtml(item.name)}" />
          <span class="stock-badge">Out of Stock</span>
          <div class="card-actions">
            <button type="button" class="card-action" data-edit="${item.id}" title="Edit" aria-label="Edit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M4 20h4l10-10-4-4L4 16v4z"/><path d="M13 7l4 4"/></svg>
            </button>
            <button type="button" class="card-action danger" data-delete="${item.id}" title="Delete" aria-label="Delete">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M5 7h14M9 7V5h6v2M8 7l1 12h6l1-12"/></svg>
            </button>
          </div>
        </div>
        <div class="card-body">
          <h3 class="card-name">${escapeHtml(item.name)}</h3>
          <p class="card-desc">${escapeHtml(item.description)}</p>
          <div class="card-meta">
            <span class="card-price">${Number(item.price).toFixed(2)} JD</span>
            <span class="card-kcal">${item.calories} kcal</span>
          </div>
          <div class="card-footer">
            <span class="toggle-label ${item.inStock ? "on" : ""}" data-stock-label>${item.inStock ? "In Stock" : "Out of Stock"}</span>
            <label class="toggle">
              <input type="checkbox" data-toggle="${item.id}" ${item.inStock ? "checked" : ""} aria-label="In stock" />
              <span class="toggle-track"></span>
            </label>
          </div>
        </div>
      </article>`;
    })
    .join("");
}

function applyStockUi(card, inStock) {
  if (!card) return;
  card.classList.toggle("out-of-stock", !inStock);
  const label = card.querySelector("[data-stock-label]");
  if (label) {
    label.textContent = inStock ? "In Stock" : "Out of Stock";
    label.classList.toggle("on", inStock);
  }
}

/* ---------- Dish modal ---------- */
function setDishImagePreview(dataUrl) {
  pendingImage = dataUrl;
  const preview = document.getElementById("dishDropPreview");
  const inner = document.getElementById("dishDropInner");
  const img = document.getElementById("dishImagePreview");
  if (!preview || !inner || !img) return;
  if (dataUrl) {
    img.src = dataUrl;
    preview.style.display = "flex";
    inner.style.display = "none";
  } else {
    img.removeAttribute("src");
    preview.style.display = "none";
    inner.style.display = "flex";
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function openDishModal(item = null) {
  editingId = item?.id || null;
  const title = document.getElementById("dishModalTitle");
  const form = document.getElementById("dishForm");
  if (title) title.textContent = item ? "Edit Dish/Item" : "Add New Dish/Item";
  form?.reset();
  populateDishCategorySelect(item?.category || categories[0]);

  if (item) {
    document.getElementById("dishName").value = item.name;
    document.getElementById("dishPrice").value = item.price;
    document.getElementById("dishCalories").value = item.calories;
    document.getElementById("dishDescription").value = item.description || "";
    setDishImagePreview(item.image);
  } else {
    setDishImagePreview(null);
  }

  openModal("dishModal");
}

function initDishModal() {
  const backdrop = document.getElementById("dishModal");
  const form = document.getElementById("dishForm");
  const dropzone = document.getElementById("dishDropzone");
  const fileInput = document.getElementById("dishImageFile");

  document.getElementById("addItemBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    openDishModal();
  });

  document.getElementById("dishModalClose")?.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal("dishModal");
  });
  document.getElementById("dishModalCancel")?.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal("dishModal");
  });

  backdrop?.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal("dishModal");
  });

  dropzone?.addEventListener("click", (e) => {
    if (e.target.closest("#dishImageClear")) return;
    fileInput?.click();
  });

  ["dragenter", "dragover"].forEach((evt) => {
    dropzone?.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });
  });
  ["dragleave", "drop"].forEach((evt) => {
    dropzone?.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
    });
  });
  dropzone?.addEventListener("drop", async (e) => {
    const file = e.dataTransfer?.files?.[0];
    if (file?.type.startsWith("image/")) setDishImagePreview(await readFileAsDataUrl(file));
  });
  fileInput?.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (file) setDishImagePreview(await readFileAsDataUrl(file));
  });
  document.getElementById("dishImageClear")?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (fileInput) fileInput.value = "";
    setDishImagePreview(null);
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("dishName").value.trim();
    const category = document.getElementById("dishCategory").value;
    const price = parseFloat(document.getElementById("dishPrice").value);
    const calories = parseInt(document.getElementById("dishCalories").value, 10);
    const description = document.getElementById("dishDescription").value.trim();

    if (!name || !category || !Number.isFinite(price) || !Number.isFinite(calories)) {
      showToast("Please fill Item Name, Category, Price, and Calories");
      return;
    }

    const image = pendingImage || makeImage(name.slice(0, 12));

    if (editingId) {
      const item = menuItems.find((i) => i.id === editingId);
      if (item) Object.assign(item, { name, category, price, calories, description, image });
      showToast("Dish updated");
    } else {
      menuItems.unshift({
        id: `item-${itemIdSeq++}`,
        name,
        category,
        price,
        calories,
        description,
        image,
        inStock: true,
      });
      showToast("Dish saved to menu");
    }

    closeModal("dishModal");
    renderCategoryTabs();
    renderMenuGrid();
  });
}

/* ---------- Category modal ---------- */
function initCategoryModal() {
  const backdrop = document.getElementById("categoryModal");
  const form = document.getElementById("categoryForm");

  document.getElementById("addCategoryBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    form?.reset();
    openModal("categoryModal");
    document.getElementById("categoryName")?.focus();
  });

  document.getElementById("categoryModalClose")?.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal("categoryModal");
  });
  document.getElementById("categoryModalCancel")?.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal("categoryModal");
  });

  backdrop?.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal("categoryModal");
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("categoryName").value.trim();
    if (!name) return;
    if (categories.some((c) => c.toLowerCase() === name.toLowerCase())) {
      showToast("That category already exists");
      return;
    }
    categories.push(name);
    activeCategory = name;
    populateDishCategorySelect(name);
    renderCategoryTabs();
    renderMenuGrid();
    closeModal("categoryModal");
    showToast(`Category “${name}” created`);
  });
}

/* ---------- Grid: tabs, toggle, edit, delete ---------- */
function initMenuInteractions() {
  document.getElementById("categoryTabs")?.addEventListener("click", (e) => {
    const tab = e.target.closest("[data-category]");
    if (!tab) return;
    e.preventDefault();
    activeCategory = tab.dataset.category;
    renderCategoryTabs();
    renderMenuGrid();
  });

  const grid = document.getElementById("menuGrid");

  grid?.addEventListener("change", (e) => {
    const toggle = e.target.closest("input[data-toggle]");
    if (!toggle) return;

    const itemId = toggle.dataset.toggle;
    const item = menuItems.find((i) => i.id === itemId);
    if (!item) return;

    item.inStock = toggle.checked;
    const status = item.inStock ? "In Stock" : "Out of Stock";

    // For future .NET API: PUT /api/merchant/menu/item/{id}/toggle-availability
    console.log("Toggled item:", itemId, "New Status:", status);

    applyStockUi(toggle.closest(".menu-card"), item.inStock);
    showToast(`${item.name}: ${status}`);
  });

  grid?.addEventListener("click", (e) => {
    const editBtn = e.target.closest("[data-edit]");
    if (editBtn) {
      e.preventDefault();
      const item = menuItems.find((i) => i.id === editBtn.dataset.edit);
      if (item) openDishModal(item);
      return;
    }

    const delBtn = e.target.closest("[data-delete]");
    if (delBtn) {
      e.preventDefault();
      const item = menuItems.find((i) => i.id === delBtn.dataset.delete);
      if (!item) return;
      if (!confirm(`Delete “${item.name}”?`)) return;
      menuItems = menuItems.filter((i) => i.id !== item.id);
      renderMenuGrid();
      showToast("Item deleted");
    }
  });
}

/* ---------- Live Orders / Analytics / Settings ---------- */
function renderLiveOrders() {
  const tbody = document.getElementById("liveOrdersBody");
  const badge = document.getElementById("liveOrdersBadge");
  if (badge) badge.textContent = String(liveOrders.filter((o) => o.status !== "Ready").length);
  if (!tbody) return;

  tbody.innerHTML = liveOrders
    .map(
      (o) => `
    <tr data-order="${o.id}">
      <td><strong>${escapeHtml(o.id)}</strong></td>
      <td>${escapeHtml(o.student)}</td>
      <td>${escapeHtml(o.items)}</td>
      <td><span class="order-status status-${o.status.toLowerCase()}">${escapeHtml(o.status)}</span></td>
      <td class="muted">${escapeHtml(o.time)}</td>
      <td>
        <button type="button" class="btn-ghost sm" data-advance-order="${o.id}">
          ${o.status === "Accepted" ? "Start Prep" : o.status === "Preparing" ? "Mark Ready" : "Complete"}
        </button>
      </td>
    </tr>`
    )
    .join("");
}

function initLiveOrders() {
  document.getElementById("liveOrdersBody")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-advance-order]");
    if (!btn) return;
    const order = liveOrders.find((o) => o.id === btn.dataset.advanceOrder);
    if (!order) return;

    if (order.status === "Accepted") order.status = "Preparing";
    else if (order.status === "Preparing") order.status = "Ready";
    else {
      liveOrders = liveOrders.filter((o) => o.id !== order.id);
      showToast(`${order.id} completed`);
      renderLiveOrders();
      return;
    }
    showToast(`${order.id} → ${order.status}`);
    renderLiveOrders();
  });
}

function renderAnalytics() {
  const list = document.getElementById("revenueList");
  if (!list) return;
  const rows = categories.map((cat) => {
    const items = menuItems.filter((i) => i.category === cat);
    const revenue = items.reduce((sum, i) => sum + i.price * 18, 0);
    return { cat, revenue, count: items.length };
  });
  list.innerHTML = rows
    .map(
      (r) => `
    <li>
      <div>
        <strong>${escapeHtml(r.cat)}</strong>
        <span class="muted">${r.count} items</span>
      </div>
      <span class="amount">${r.revenue.toFixed(2)} JD</span>
    </li>`
    )
    .join("");
}

function initSettings() {
  document.getElementById("settingsForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("settingName").value.trim();
    showToast(`Settings saved${name ? ` for ${name}` : ""}`);
  });
}

function initNav() {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const page = item.dataset.nav;
      if (page) switchPage(page);
    });
  });
}

function initSidebarMobile() {
  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("menuToggle");
  const overlay = document.getElementById("sidebarOverlay");
  if (!sidebar || !toggle || !overlay) return;

  toggle.addEventListener("click", () => {
    const open = sidebar.classList.toggle("open");
    overlay.classList.toggle("visible", open);
  });
  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("visible");
  });
}

function init() {
  // Force modals closed
  ["dishModal", "categoryModal"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove("open");
      el.style.display = "none";
      el.setAttribute("aria-hidden", "true");
    }
  });

  populateDishCategorySelect(categories[0]);
  renderCategoryTabs();
  renderMenuGrid();
  renderLiveOrders();
  renderAnalytics();

  initNav();
  initDishModal();
  initCategoryModal();
  initMenuInteractions();
  initLiveOrders();
  initSettings();
  initSidebarMobile();

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal("dishModal");
      closeModal("categoryModal");
    }
  });

  // Start on Menu Management
  switchPage("menu");
  console.info("[Al-Tayer Merchant] Ready — dishModal & categoryModal wired");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
