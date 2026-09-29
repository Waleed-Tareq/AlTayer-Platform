/* Al-Tayer Super Admin Dashboard — interactions & charts */

const DAYS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

/** .NET Core API base URL (https profile from launchSettings.json). */
const API_BASE_URL = "https://localhost:7280";

/** Flip to true when a real backend is available for other endpoints. */
const USE_REAL_API = true;

const PAGE_TITLES = {
  dashboard: "Dashboard",
  campuses: "Campuses",
  merchants: "Merchants",
  finance: "Finance",
  users: "Users",
  notifications: "Notifications",
  ads: "Ads Management",
  settings: "Settings",
};

/**
 * Campus catalog for multi-tenant targeting.
 * Ads use CampusID: null = Global (all campuses); otherwise filter by CampusID.
 */
const CAMPUS_CATALOG = [
  { id: "camp-uj", name: "University of Jordan" },
  { id: "camp-just", name: "JUST" },
  { id: "camp-yarmouk", name: "Yarmouk" },
  { id: "camp-hashemite", name: "Hashemite" },
];

/** Placeholder banners (SVG data URIs) for demo ads without uploads. */
function makeBannerSvg(label, c1, c2) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="160" viewBox="0 0 480 160">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
    <rect width="480" height="160" fill="url(#g)"/>
    <text x="24" y="88" fill="white" font-family="Arial,sans-serif" font-size="22" font-weight="700">${label}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Advertisement model:
 * - campusId: null → Global; string → single campus; (UI may store campusIds[] for multi-select publish)
 * - paused: admin pause override
 * - status derived from dates + paused
 */
let advertisements = [
  {
    id: "ad-001",
    title: "McDonald's Campus Offer",
    campusId: null,
    campusIds: null,
    bannerUrl: makeBannerSvg("McDonald's · 20% Off", "#1E3A8A", "#14B8A6"),
    targetUrl: "altayer://merchant/mcdonalds",
    startDate: "2026-07-01",
    endDate: "2026-07-31",
    impressions: 12480,
    clicks: 892,
    paused: false,
  },
  {
    id: "ad-002",
    title: "Engineering Café Lunch Deal",
    campusId: "camp-uj",
    campusIds: ["camp-uj"],
    bannerUrl: makeBannerSvg("Eng Café · Lunch", "#0F766E", "#1E3A8A"),
    targetUrl: "altayer://merchant/cafeteria-engineering",
    startDate: "2026-07-10",
    endDate: "2026-08-15",
    impressions: 4320,
    clicks: 318,
    paused: false,
  },
  {
    id: "ad-003",
    title: "JUST Welcome Week",
    campusId: "camp-just",
    campusIds: ["camp-just"],
    bannerUrl: makeBannerSvg("JUST Welcome", "#2563EB", "#14B8A6"),
    targetUrl: "",
    startDate: "2026-06-01",
    endDate: "2026-06-20",
    impressions: 9800,
    clicks: 410,
    paused: false,
  },
];

let pendingBannerDataUrl = null;
let adIdSeq = 4;

const ORDERS = [
  {
    id: "AT-4821",
    studentId: "stu-001",
    student: "Layla Hassan",
    initials: "LH",
    merchant: "Cafeteria Engineering",
    status: "preparing",
    time: "2 min ago",
    items: [
      { name: "Shawarma Wrap", qty: 2, price: 1.75 },
      { name: "Soft Drink", qty: 1, price: 1.0 },
    ],
    note: "No garlic sauce, please — allergy.",
    total: 4.5,
    timeline: [
      { status: "accepted", label: "Accepted", at: "12:41 PM", done: true },
      { status: "preparing", label: "Preparing", at: "12:43 PM", done: true, current: true },
      { status: "ready", label: "Ready for pickup", at: null, done: false },
      { status: "picked", label: "Picked up", at: null, done: false },
    ],
  },
  {
    id: "AT-4820",
    studentId: "stu-002",
    student: "Omar Khalil",
    initials: "OK",
    merchant: "Cafeteria Arts",
    status: "accepted",
    time: "4 min ago",
    items: [
      { name: "Falafel Plate", qty: 1, price: 2.5 },
      { name: "Labneh", qty: 1, price: 0.75 },
    ],
    note: "Extra pita if available.",
    total: 3.25,
    timeline: [
      { status: "accepted", label: "Accepted", at: "12:39 PM", done: true, current: true },
      { status: "preparing", label: "Preparing", at: null, done: false },
      { status: "ready", label: "Ready for pickup", at: null, done: false },
      { status: "picked", label: "Picked up", at: null, done: false },
    ],
  },
  {
    id: "AT-4819",
    studentId: "stu-003",
    student: "Nour Al-Din",
    initials: "NA",
    merchant: "Cafeteria Engineering",
    status: "ready",
    time: "6 min ago",
    items: [{ name: "Chicken Meal Box", qty: 1, price: 5.0 }],
    note: "",
    total: 5.0,
    timeline: [
      { status: "accepted", label: "Accepted", at: "12:28 PM", done: true },
      { status: "preparing", label: "Preparing", at: "12:30 PM", done: true },
      { status: "ready", label: "Ready for pickup", at: "12:37 PM", done: true, current: true },
      { status: "picked", label: "Picked up", at: null, done: false },
    ],
  },
  {
    id: "AT-4818",
    studentId: "stu-004",
    student: "Sara Mahmoud",
    initials: "SM",
    merchant: "Cafeteria Arts",
    status: "preparing",
    time: "9 min ago",
    items: [{ name: "Manakish Zaatar", qty: 3, price: 0.9 }],
    note: "Cut into halves.",
    total: 2.7,
    timeline: [
      { status: "accepted", label: "Accepted", at: "12:34 PM", done: true },
      { status: "preparing", label: "Preparing", at: "12:36 PM", done: true, current: true },
      { status: "ready", label: "Ready for pickup", at: null, done: false },
      { status: "picked", label: "Picked up", at: null, done: false },
    ],
  },
  {
    id: "AT-4817",
    studentId: "stu-005",
    student: "Yousef Amari",
    initials: "YA",
    merchant: "Cafeteria Engineering",
    status: "picked",
    time: "14 min ago",
    items: [
      { name: "Espresso", qty: 1, price: 1.1 },
      { name: "Croissant", qty: 1, price: 1.0 },
    ],
    note: "",
    total: 2.1,
    timeline: [
      { status: "accepted", label: "Accepted", at: "12:18 PM", done: true },
      { status: "preparing", label: "Preparing", at: "12:20 PM", done: true },
      { status: "ready", label: "Ready for pickup", at: "12:26 PM", done: true },
      { status: "picked", label: "Picked up", at: "12:29 PM", done: true, current: true },
    ],
  },
];

const NOTIFICATIONS = [
  {
    id: 1,
    type: "order_delay",
    title: "Order AT-4821 delayed",
    body: "Cafeteria Engineering prep time exceeded 12 min.",
    time: "2 min ago",
    unread: true,
    orderId: "AT-4821",
  },
  {
    id: 2,
    type: "payout",
    title: "Payout ready",
    body: "Cafeteria Arts settlement of 420.00 JD is ready.",
    time: "28 min ago",
    unread: true,
    merchantId: "m-arts",
  },
  {
    id: 3,
    type: "merchant_request",
    title: "New merchant request",
    body: "Snack Corner (UJ Medical) awaits approval.",
    time: "1 hr ago",
    unread: true,
    requestId: "req-snack-corner",
  },
  {
    id: 4,
    type: "report",
    title: "Weekly report",
    body: "GMV up 3.2% vs last week across UJ campus.",
    time: "Yesterday",
    unread: false,
  },
];

const CAMPUSES = [
  { name: "University of Jordan", merchants: 12, students: 8200, status: "Active" },
  { name: "Jordan University of Science & Tech", merchants: 8, students: 5100, status: "Active" },
  { name: "Yarmouk University", merchants: 6, students: 3900, status: "Active" },
  { name: "Hashemite University", merchants: 4, students: 2400, status: "Pilot" },
];

const MERCHANTS = [
  { name: "Cafeteria Engineering", campus: "University of Jordan", orders: 68, status: "Open" },
  { name: "Cafeteria Arts", campus: "University of Jordan", orders: 51, status: "Open" },
  { name: "Medical Café", campus: "JUST", orders: 34, status: "Open" },
  { name: "Snack Corner", campus: "Yarmouk University", orders: 0, status: "Pending" },
];

const USERS = [
  {
    id: "admin-001",
    name: "Ahmad Salem",
    initials: "AS",
    role: "Super Admin",
    campus: "All",
    last: "Now",
    email: "ahmad.salem@altayer.jo",
    studentId: null,
  },
  {
    id: "admin-002",
    name: "Rania Odeh",
    initials: "RO",
    role: "Campus Admin",
    campus: "UJ",
    last: "12 min ago",
    email: "rania.odeh@uj.edu.jo",
    studentId: null,
  },
  {
    id: "mgr-001",
    name: "Khaled Nasser",
    initials: "KN",
    role: "Merchant Manager",
    campus: "UJ Eng.",
    last: "1 hr ago",
    email: "khaled@caf-eng.jo",
    studentId: null,
  },
  {
    id: "stu-001",
    name: "Layla Hassan",
    initials: "LH",
    role: "Student",
    campus: "UJ",
    last: "2 min ago",
    email: "layla.h@students.uj.edu.jo",
    studentId: "202112345",
    major: "Computer Engineering",
    ordersToday: 2,
  },
  {
    id: "stu-002",
    name: "Omar Khalil",
    initials: "OK",
    role: "Student",
    campus: "UJ",
    last: "4 min ago",
    email: "omar.k@students.uj.edu.jo",
    studentId: "202109876",
    major: "Business Administration",
    ordersToday: 1,
  },
  {
    id: "stu-003",
    name: "Nour Al-Din",
    initials: "NA",
    role: "Student",
    campus: "UJ",
    last: "6 min ago",
    email: "nour.a@students.uj.edu.jo",
    studentId: "202205432",
    major: "Architecture",
    ordersToday: 1,
  },
  {
    id: "stu-004",
    name: "Sara Mahmoud",
    initials: "SM",
    role: "Student",
    campus: "UJ",
    last: "9 min ago",
    email: "sara.m@students.uj.edu.jo",
    studentId: "202078901",
    major: "Fine Arts",
    ordersToday: 1,
  },
  {
    id: "stu-005",
    name: "Yousef Amari",
    initials: "YA",
    role: "Student",
    campus: "UJ",
    last: "14 min ago",
    email: "yousef.a@students.uj.edu.jo",
    studentId: "201956789",
    major: "Mechanical Engineering",
    ordersToday: 1,
  },
];

/** In-memory ledger for cafeteria pending balances (JD). */
let settlements = [
  { merchantId: "m-eng", merchant: "Cafeteria Engineering", pendingBalance: 680.0, date: "Today", settled: false },
  { merchantId: "m-arts", merchant: "Cafeteria Arts", pendingBalance: 420.0, date: "Yesterday", settled: false },
  { merchantId: "m-med", merchant: "Medical Café", pendingBalance: 310.5, date: "Mon", settled: false },
  { merchantId: "m-bakery", merchant: "Campus Bakery", pendingBalance: 195.0, date: "Sun", settled: false },
  { merchantId: "m-snack", merchant: "Snack Hub", pendingBalance: 148.25, date: "Sat", settled: false },
];

let settledWeekTotal = 12100.0;

const SETTINGS = [
  { key: "alerts", label: "Order delay alerts", desc: "Notify when prep exceeds SLA", on: true },
  { key: "email", label: "Daily email digest", desc: "GMV & orders summary at 8:00 AM", on: true },
  { key: "sound", label: "Notification sound", desc: "Play sound for new alerts", on: false },
  { key: "demo", label: "Demo mode", desc: "Use sample campus data", on: true },
];

const STATUS_MAP = {
  accepted: { label: "Accepted", className: "status-accepted" },
  preparing: { label: "Preparing", className: "status-preparing" },
  ready: { label: "Ready", className: "status-ready" },
  picked: { label: "Picked Up", className: "status-picked" },
};

let currentOrders = ORDERS.map((o) => ({ ...o, items: o.items.map((i) => ({ ...i })), timeline: o.timeline.map((t) => ({ ...t })) }));
let currentPage = "dashboard";
let focusedUserId = null;
let searchQuery = "";
let notifs = NOTIFICATIONS.map((n) => ({ ...n }));
let settingsState = SETTINGS.map((s) => ({ ...s }));
let syncingHash = false;

/* ---------- API layer (demo stubs → real backend later) ---------- */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatJd(n) {
  return `${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} JD`;
}

/**
 * POST /api/superadmin/finance/settle/{merchantId}
 * Demo: simulates network latency and returns success.
 * Real: set USE_REAL_API = true when backend is wired.
 */
async function settleMerchantPayout(merchantId) {
  if (USE_REAL_API) {
    const res = await fetch(
      `${API_BASE_URL}/api/superadmin/finance/settle/${encodeURIComponent(merchantId)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      }
    );
    if (!res.ok) {
      const err = new Error(`Settle failed (${res.status})`);
      err.status = res.status;
      throw err;
    }
    return res.json();
  }

  await delay(450);
  return { ok: true, merchantId, pendingBalance: 0, settledAt: new Date().toISOString() };
}

async function decideMerchantRequest(requestId, decision) {
  if (USE_REAL_API) {
    const res = await fetch(
      `${API_BASE_URL}/api/superadmin/merchants/requests/${encodeURIComponent(requestId)}/${decision}`,
      {
        method: "POST",
        headers: { Accept: "application/json" },
      }
    );
    if (!res.ok) throw new Error(`Request ${decision} failed`);
    return res.json();
  }
  await delay(350);
  return { ok: true, requestId, decision };
}

/* ---------- Sparkline helpers ---------- */
function createSparkline(canvasId, data, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === "undefined") return;

  return new Chart(canvas, {
    type: "line",
    data: {
      labels: data.map((_, i) => i),
      datasets: [
        {
          data,
          borderColor: color,
          backgroundColor: hexToRgba(color, 0.18),
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { display: false },
        y: { display: false },
      },
      animation: { duration: 900 },
    },
  });
}

function hexToRgba(hex, alpha) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ---------- Main combined chart ---------- */
function createMainChart() {
  const canvas = document.getElementById("mainChart");
  if (!canvas || typeof Chart === "undefined") return;

  /* Realistic daily cafeteria volumes (JD) — scale 0 → 1500 */
  const engSales = [420, 580, 510, 720, 890, 650, 980];
  const artsSales = [310, 450, 380, 520, 610, 480, 740];
  const engOrders = [42, 48, 45, 55, 61, 52, 68];
  const artsOrders = [31, 38, 35, 42, 47, 40, 51];

  return new Chart(canvas, {
    type: "bar",
    data: {
      labels: DAYS,
      datasets: [
        {
          type: "bar",
          label: "Eng. Orders",
          data: engOrders,
          backgroundColor: hexToRgba("#1E3A8A", 0.28),
          borderRadius: 6,
          borderSkipped: false,
          yAxisID: "yOrders",
          order: 2,
          barPercentage: 0.7,
          categoryPercentage: 0.65,
        },
        {
          type: "bar",
          label: "Arts Orders",
          data: artsOrders,
          backgroundColor: hexToRgba("#14B8A6", 0.35),
          borderRadius: 6,
          borderSkipped: false,
          yAxisID: "yOrders",
          order: 2,
          barPercentage: 0.7,
          categoryPercentage: 0.65,
        },
        {
          type: "line",
          label: "Eng. Sales",
          data: engSales,
          borderColor: "#1E3A8A",
          backgroundColor: "#1E3A8A",
          borderWidth: 2.5,
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: "#FFFFFF",
          pointBorderColor: "#1E3A8A",
          pointBorderWidth: 2,
          yAxisID: "ySales",
          order: 1,
        },
        {
          type: "line",
          label: "Arts Sales",
          data: artsSales,
          borderColor: "#14B8A6",
          backgroundColor: "#14B8A6",
          borderWidth: 2.5,
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: "#FFFFFF",
          pointBorderColor: "#14B8A6",
          pointBorderWidth: 2,
          yAxisID: "ySales",
          order: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#0F172A",
          titleFont: { family: "'DM Sans', sans-serif", size: 12 },
          bodyFont: { family: "'DM Sans', sans-serif", size: 12 },
          padding: 12,
          cornerRadius: 10,
          callbacks: {
            label(ctx) {
              const v = ctx.parsed.y;
              if (ctx.dataset.yAxisID === "ySales") {
                return ` ${ctx.dataset.label}: ${v.toLocaleString()} JD`;
              }
              return ` ${ctx.dataset.label}: ${v} orders`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: "'DM Sans', sans-serif", size: 11, weight: "500" },
            color: "#6B7280",
          },
          border: { display: false },
        },
        ySales: {
          position: "left",
          min: 0,
          max: 1500,
          suggestedMin: 0,
          ticks: {
            stepSize: 250,
            font: { family: "'DM Sans', sans-serif", size: 10 },
            color: "#9CA3AF",
            callback: (v) => `${Number(v).toLocaleString()}`,
          },
          grid: { color: "rgba(31, 41, 55, 0.06)", drawBorder: false },
          border: { display: false },
          title: {
            display: true,
            text: "Sales (JD)",
            color: "#9CA3AF",
            font: { size: 10, family: "'DM Sans', sans-serif" },
          },
        },
        yOrders: {
          position: "right",
          min: 0,
          suggestedMax: 80,
          grid: { drawOnChartArea: false },
          ticks: {
            font: { family: "'DM Sans', sans-serif", size: 10 },
            color: "#9CA3AF",
          },
          border: { display: false },
          title: {
            display: true,
            text: "Orders",
            color: "#9CA3AF",
            font: { size: 10, family: "'DM Sans', sans-serif" },
          },
        },
      },
      animation: { duration: 1100, easing: "easeOutQuart" },
    },
  });
}

/* ---------- Toast ---------- */
function showToast(message) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  requestAnimationFrame(() => el.classList.add("show"));
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => {
      el.hidden = true;
    }, 200);
  }, 2400);
}

/* ---------- Orders table ---------- */
function getFilteredOrders() {
  const q = searchQuery.trim().toLowerCase();
  if (!q) return currentOrders;
  return currentOrders.filter(
    (o) =>
      o.id.toLowerCase().includes(q) ||
      o.student.toLowerCase().includes(q) ||
      o.merchant.toLowerCase().includes(q) ||
      (STATUS_MAP[o.status]?.label || "").toLowerCase().includes(q)
  );
}

function renderOrders() {
  const tbody = document.getElementById("ordersBody");
  const empty = document.getElementById("ordersEmpty");
  const feedback = document.getElementById("searchFeedback");
  if (!tbody) return;

  const orders = getFilteredOrders();

  if (empty) empty.hidden = orders.length > 0;

  if (feedback) {
    if (searchQuery.trim() && currentPage === "dashboard") {
      feedback.hidden = false;
      feedback.textContent = `${orders.length} result${orders.length === 1 ? "" : "s"}`;
    } else {
      feedback.hidden = true;
    }
  }

  tbody.innerHTML = orders
    .map((o) => {
      const s = STATUS_MAP[o.status];
      return `
        <tr data-order-row="${o.id}">
          <td>
            <button type="button" class="order-id-btn order-id" data-order-id="${o.id}">${o.id}</button>
          </td>
          <td>
            <div class="student-cell">
              <span class="student-avatar">${o.initials}</span>
              <button type="button" class="student-link" data-student-id="${o.studentId}">${o.student}</button>
            </div>
          </td>
          <td><span class="merchant-name">${o.merchant}</span></td>
          <td>
            <span class="status-badge ${s.className}">
              <span class="status-icon" aria-hidden="true"></span>
              ${s.label}
            </span>
          </td>
          <td class="time-cell">${o.time}</td>
        </tr>
      `;
    })
    .join("");
}

function shuffleOrderTimes(orders) {
  const times = ["just now", "1 min ago", "3 min ago", "5 min ago", "8 min ago", "11 min ago", "15 min ago"];
  return orders.map((o, i) => ({
    ...o,
    time: times[i % times.length],
  }));
}

/* ---------- Demo panels ---------- */
function renderCampuses() {
  const grid = document.getElementById("campusesGrid");
  if (!grid) return;
  grid.innerHTML = CAMPUSES.map(
    (c) => `
    <article class="demo-card">
      <div class="demo-card-top">
        <h3>${c.name}</h3>
        <span class="pill ${c.status === "Active" ? "pill-ok" : "pill-warn"}">${c.status}</span>
      </div>
      <dl class="demo-stats">
        <div><dt>Merchants</dt><dd>${c.merchants}</dd></div>
        <div><dt>Students</dt><dd>${c.students.toLocaleString()}</dd></div>
      </dl>
    </article>
  `
  ).join("");
}

function renderMerchants() {
  const tbody = document.getElementById("merchantsBody");
  if (!tbody) return;
  tbody.innerHTML = MERCHANTS.map(
    (m) => `
    <tr>
      <td><span class="merchant-name">${m.name}</span></td>
      <td>${m.campus}</td>
      <td>${m.orders}</td>
      <td><span class="pill ${m.status === "Open" ? "pill-ok" : "pill-warn"}">${m.status}</span></td>
    </tr>
  `
  ).join("");
}

function pendingPayoutsTotal() {
  return settlements.filter((s) => !s.settled).reduce((sum, s) => sum + s.pendingBalance, 0);
}

function updateFinanceMetrics() {
  const pendingEl = document.getElementById("pendingPayoutsValue");
  const settledEl = document.getElementById("settledWeekValue");
  if (pendingEl) {
    pendingEl.innerHTML = `${pendingPayoutsTotal().toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} <small>JD</small>`;
  }
  if (settledEl) {
    settledEl.innerHTML = `${settledWeekTotal.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} <small>JD</small>`;
  }
}

function renderFinance() {
  const list = document.getElementById("financeList");
  if (!list) return;
  updateFinanceMetrics();

  list.innerHTML = settlements
    .map((s) => {
      const settled = s.settled;
      return `
      <li class="demo-list-item" data-merchant-id="${s.merchantId}">
        <div>
          <strong>${s.merchant}</strong>
          <span class="muted">${s.date}${settled ? " · Settled" : " · Pending"}</span>
        </div>
        <div class="settle-row">
          <div class="amount-block">
            <span class="pending-label">Pending Balance</span>
            <span class="amount">${formatJd(s.pendingBalance)}</span>
          </div>
          <button
            type="button"
            class="btn-settle ${settled ? "is-settled" : ""}"
            data-settle="${s.merchantId}"
            ${settled ? "disabled" : ""}
          >${settled ? "Settled" : "Settle Payout"}</button>
        </div>
      </li>
    `;
    })
    .join("");
}

async function handleSettlePayout(merchantId, btn) {
  const entry = settlements.find((s) => s.merchantId === merchantId);
  if (!entry || entry.settled) return;

  btn.disabled = true;
  btn.classList.add("is-loading");
  btn.textContent = "Settling…";

  try {
    await settleMerchantPayout(merchantId);
    const amount = entry.pendingBalance;
    entry.pendingBalance = 0;
    entry.settled = true;
    settledWeekTotal += amount;
    renderFinance();
    showToast(`Payout settled for ${entry.merchant}`);
  } catch (err) {
    btn.disabled = false;
    btn.classList.remove("is-loading");
    btn.textContent = "Settle Payout";
    showToast("Settle failed — try again");
    console.error(err);
  }
}

function initFinanceActions() {
  const list = document.getElementById("financeList");
  if (!list) return;
  list.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-settle]");
    if (!btn || btn.disabled) return;
    handleSettlePayout(btn.dataset.settle, btn);
  });
}

function renderUserProfile(userId) {
  const panel = document.getElementById("userProfilePanel");
  const tableWidget = document.getElementById("usersTableWidget");
  if (!panel) return;

  const user = USERS.find((u) => u.id === userId);
  if (!user) {
    panel.hidden = true;
    focusedUserId = null;
    if (tableWidget) tableWidget.hidden = false;
    return;
  }

  focusedUserId = userId;
  panel.hidden = false;
  panel.innerHTML = `
    <button type="button" class="ghost-btn profile-back" id="profileBackBtn">← All users</button>
    <div class="user-profile-head">
      <div class="user-profile-avatar">${user.initials}</div>
      <div>
        <h3>${user.name}</h3>
        <p class="muted">${user.role} · ${user.campus}</p>
      </div>
    </div>
    <dl class="user-profile-grid">
      <div><dt>User ID</dt><dd>${user.id}</dd></div>
      ${user.studentId ? `<div><dt>Student ID</dt><dd>${user.studentId}</dd></div>` : ""}
      <div><dt>Email</dt><dd>${user.email || "—"}</dd></div>
      <div><dt>Last Active</dt><dd>${user.last}</dd></div>
      ${user.major ? `<div><dt>Major</dt><dd>${user.major}</dd></div>` : ""}
      ${user.ordersToday != null ? `<div><dt>Orders Today</dt><dd>${user.ordersToday}</dd></div>` : ""}
    </dl>
  `;

  document.getElementById("profileBackBtn")?.addEventListener("click", () => {
    focusedUserId = null;
    panel.hidden = true;
    navigateTo("users");
  });
}

function renderUsers() {
  const tbody = document.getElementById("usersBody");
  if (!tbody) return;
  tbody.innerHTML = USERS.map(
    (u) => `
    <tr data-user-id="${u.id}" class="${focusedUserId === u.id ? "users-table-highlight" : ""}">
      <td>
        <div class="student-cell">
          <span class="student-avatar">${u.initials}</span>
          <button type="button" class="student-link" data-student-id="${u.id}">${u.name}</button>
        </div>
      </td>
      <td>${u.role}</td>
      <td>${u.campus}</td>
      <td class="time-cell">${u.last}</td>
    </tr>
  `
  ).join("");

  if (focusedUserId) renderUserProfile(focusedUserId);
  else {
    const panel = document.getElementById("userProfilePanel");
    if (panel) panel.hidden = true;
  }
}

function openStudentProfile(studentId) {
  const user = USERS.find((u) => u.id === studentId);
  if (!user) {
    showToast("Student not found");
    return;
  }
  focusedUserId = studentId;
  navigateTo("users", { userId: studentId });
  renderUsers();
  showToast(`Opened profile: ${user.name}`);
}

function renderSettings() {
  const grid = document.getElementById("settingsGrid");
  if (!grid) return;
  grid.innerHTML = settingsState
    .map(
      (s) => `
    <article class="settings-card">
      <div>
        <h3>${s.label}</h3>
        <p>${s.desc}</p>
      </div>
      <button type="button" class="toggle ${s.on ? "on" : ""}" data-setting="${s.key}" role="switch" aria-checked="${s.on}" aria-label="${s.label}">
        <span class="toggle-knob"></span>
      </button>
    </article>
  `
    )
    .join("");

  grid.querySelectorAll(".toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.setting;
      const item = settingsState.find((x) => x.key === key);
      if (!item) return;
      item.on = !item.on;
      btn.classList.toggle("on", item.on);
      btn.setAttribute("aria-checked", String(item.on));
      showToast(`${item.label}: ${item.on ? "On" : "Off"}`);
    });
  });
}

function notifActionsHtml(n) {
  if (n.type === "order_delay" && n.orderId) {
    return `
      <div class="notif-actions">
        <button type="button" class="btn-outline btn-outline-accent" data-notif-action="view-order" data-order-id="${n.orderId}">View Live Order</button>
      </div>`;
  }
  if (n.type === "merchant_request" && n.requestId) {
    const decided = n.decision;
    if (decided) {
      return `
        <div class="notif-actions">
          <button type="button" class="btn-outline" disabled>${decided === "approve" ? "Approved" : "Rejected"}</button>
        </div>`;
    }
    return `
      <div class="notif-actions">
        <button type="button" class="btn-outline btn-outline-accent" data-notif-action="approve-merchant" data-request-id="${n.requestId}" data-notif-id="${n.id}">Approve</button>
        <button type="button" class="btn-outline btn-outline-danger" data-notif-action="reject-merchant" data-request-id="${n.requestId}" data-notif-id="${n.id}">Reject</button>
      </div>`;
  }
  if (n.type === "payout" && n.merchantId) {
    return `
      <div class="notif-actions">
        <button type="button" class="btn-outline" data-notif-action="view-finance" data-merchant-id="${n.merchantId}">View Finance</button>
      </div>`;
  }
  return "";
}

function notifItemHtml(n) {
  return `
    <li class="notif-item ${n.unread ? "unread" : ""}" data-notif-id="${n.id}">
      <div class="notif-dot" aria-hidden="true"></div>
      <div class="notif-content">
        <strong>${n.title}</strong>
        <p>${n.body}</p>
        <time>${n.time}</time>
        ${notifActionsHtml(n)}
      </div>
    </li>
  `;
}

function renderNotificationsUI() {
  const panelList = document.getElementById("notifList");
  const pageList = document.getElementById("notifPageList");
  const badge = document.getElementById("notifBadge");
  const unread = notifs.filter((n) => n.unread).length;

  if (panelList) {
    panelList.innerHTML = notifs.map((n) => notifItemHtml(n)).join("");
  }
  if (pageList) {
    pageList.innerHTML = notifs.map((n) => notifItemHtml(n)).join("");
  }
  if (badge) {
    badge.hidden = unread === 0;
    badge.textContent = String(unread);
  }
}

async function handleNotifAction(action, el) {
  if (action === "view-order") {
    const orderId = el.dataset.orderId;
    closeNotifPanel();
    navigateTo("dashboard");
    openOrderModal(orderId);
    highlightOrderRow(orderId);
    showToast(`Opened live order ${orderId}`);
    return;
  }

  if (action === "view-finance") {
    closeNotifPanel();
    navigateTo("finance");
    showToast("Opened Finance settlements");
    return;
  }

  if (action === "approve-merchant" || action === "reject-merchant") {
    const decision = action === "approve-merchant" ? "approve" : "reject";
    const requestId = el.dataset.requestId;
    const notifId = Number(el.dataset.notifId);
    el.disabled = true;
    try {
      await decideMerchantRequest(requestId, decision);
      const n = notifs.find((x) => x.id === notifId);
      if (n) {
        n.decision = decision;
        n.unread = false;
        n.body =
          decision === "approve"
            ? "Snack Corner approved and invited to onboard."
            : "Snack Corner request rejected.";
      }
      renderNotificationsUI();
      showToast(decision === "approve" ? "Merchant approved" : "Merchant rejected");
    } catch (err) {
      el.disabled = false;
      showToast("Action failed — try again");
      console.error(err);
    }
  }
}

function initNotifActions() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-notif-action]");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    handleNotifAction(btn.dataset.notifAction, btn);
  });
}

/* ---------- Hash routing & navigation ---------- */
function syncNavActive(page) {
  document.querySelectorAll(".sidebar-nav .nav-item").forEach((n) => {
    const isActive = n.dataset.nav === page;
    n.classList.toggle("active", isActive);
    if (isActive) n.setAttribute("aria-current", "page");
    else n.removeAttribute("aria-current");
  });
}

function buildHash(page, opts = {}) {
  if (page === "users" && opts.userId) return `#users/${opts.userId}`;
  if (page === "dashboard" && opts.orderId) return `#dashboard/order/${opts.orderId}`;
  return `#${page}`;
}

function parseHash() {
  const raw = (location.hash || "#dashboard").replace(/^#/, "");
  const parts = raw.split("/").filter(Boolean);
  const page = parts[0] || "dashboard";

  if (!PAGE_TITLES[page]) {
    return { page: "dashboard", userId: null, orderId: null };
  }

  let userId = null;
  let orderId = null;

  if (page === "users" && parts[1]) userId = parts[1];
  if (page === "dashboard" && parts[1] === "order" && parts[2]) orderId = parts[2];

  return { page, userId, orderId };
}

function navigateTo(page, opts = {}) {
  if (!PAGE_TITLES[page]) return;
  applyPage(page, opts);
  const hash = buildHash(page, opts);
  if (location.hash !== hash) {
    syncingHash = true;
    location.hash = hash;
    setTimeout(() => {
      syncingHash = false;
    }, 0);
  }
}

function applyPage(page, opts = {}) {
  currentPage = page;

  if (opts.clearUser) {
    focusedUserId = null;
  } else if (page === "users" && opts.userId !== undefined) {
    focusedUserId = opts.userId || null;
  } else if (page !== "users") {
    focusedUserId = null;
  }

  syncNavActive(page);

  document.querySelectorAll(".page-panel").forEach((panel) => {
    const match = panel.dataset.panel === page;
    panel.classList.toggle("active", match);
    panel.hidden = !match;
  });

  const role = document.querySelector(".title-role");
  if (role) {
    role.textContent = `${PAGE_TITLES[page]} · Ahmad Salem`;
  }

  const feedback = document.getElementById("searchFeedback");
  if (feedback && page !== "dashboard") {
    feedback.hidden = true;
  } else if (searchQuery.trim()) {
    renderOrders();
  }

  if (page === "users") {
    renderUsers();
  }

  if (page === "finance") {
    renderFinance();
  }

  if (page === "ads") {
    renderAdsTable();
  }

  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  if (sidebar && window.matchMedia("(max-width: 900px)").matches) {
    sidebar.classList.remove("open");
    overlay?.classList.remove("visible");
  }

  if (opts.orderId) {
    openOrderModal(opts.orderId);
    highlightOrderRow(opts.orderId);
  }
}

function switchPage(page) {
  if (page !== "users") focusedUserId = null;
  navigateTo(page, page === "users" ? {} : { clearUser: true });
}

function initNav() {
  document.querySelectorAll(".sidebar-nav .nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const page = item.dataset.nav;
      if (!page) return;
      focusedUserId = null;
      navigateTo(page);
    });
  });

  window.addEventListener("hashchange", () => {
    if (syncingHash) return;
    const { page, userId, orderId } = parseHash();
    focusedUserId = page === "users" ? userId || null : null;
    applyPage(page, { userId, orderId });
  });
}

function initRouteFromHash() {
  if (!location.hash) {
    history.replaceState(null, "", "#dashboard");
  }
  const { page, userId, orderId } = parseHash();
  if (userId) focusedUserId = userId;
  applyPage(page, { userId, orderId });
}

/* ---------- Profile dropdown ---------- */
function initProfileDropdown() {
  const wrap = document.getElementById("profileDropdown");
  const btn = document.getElementById("profileBtn");
  if (!wrap || !btn) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeNotifPanel();
    const open = wrap.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });

  wrap.querySelectorAll(".dropdown-menu a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      wrap.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
      const label = link.textContent.trim();
      if (label === "Sign Out") {
        showToast("Signed out (demo)");
      } else if (label === "My Profile") {
        openStudentProfile("admin-001");
      } else {
        switchPage("settings");
        showToast("Opened Settings");
      }
    });
  });

  document.addEventListener("click", () => {
    wrap.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
  });
}

/* ---------- Notifications bell ---------- */
function closeNotifPanel() {
  const wrap = document.getElementById("notifWrap");
  const btn = document.getElementById("notifBtn");
  const panel = document.getElementById("notifPanel");
  if (!wrap || !btn || !panel) return;
  wrap.classList.remove("open");
  btn.setAttribute("aria-expanded", "false");
  panel.hidden = true;
}

function initNotifications() {
  const wrap = document.getElementById("notifWrap");
  const btn = document.getElementById("notifBtn");
  const panel = document.getElementById("notifPanel");
  const markBtn = document.getElementById("markNotifsRead");
  if (!wrap || !btn || !panel) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const profile = document.getElementById("profileDropdown");
    profile?.classList.remove("open");
    document.getElementById("profileBtn")?.setAttribute("aria-expanded", "false");

    const willOpen = !wrap.classList.contains("open");
    wrap.classList.toggle("open", willOpen);
    btn.setAttribute("aria-expanded", String(willOpen));
    panel.hidden = !willOpen;
  });

  panel.addEventListener("click", (e) => e.stopPropagation());

  markBtn?.addEventListener("click", () => {
    notifs = notifs.map((n) => ({ ...n, unread: false }));
    renderNotificationsUI();
    showToast("All notifications marked as read");
  });

  document.addEventListener("click", () => closeNotifPanel());

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeNotifPanel();
      closeOrderModal();
    }
  });
}

/* ---------- Search ---------- */
function initSearch() {
  const input = document.getElementById("globalSearch");
  if (!input) return;

  input.addEventListener("input", () => {
    searchQuery = input.value;
    if (currentPage !== "dashboard") {
      navigateTo("dashboard");
      showToast("Filtering live orders…");
    }
    renderOrders();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (currentPage !== "dashboard") navigateTo("dashboard");
      renderOrders();
      const count = getFilteredOrders().length;
      showToast(
        searchQuery.trim()
          ? `Found ${count} order${count === 1 ? "" : "s"}`
          : "Showing all orders"
      );
    }
  });
}

/* ---------- Order modal ---------- */
function orderDetailHtml(order) {
  const s = STATUS_MAP[order.status];
  const items = order.items || [];
  const itemsRows = items
    .map(
      (it) => `
      <tr>
        <td>${it.name}</td>
        <td>×${it.qty}</td>
        <td class="amount">${formatJd(it.price * it.qty)}</td>
      </tr>`
    )
    .join("");

  const timeline = (order.timeline || []).map((t) => {
    const cls = [t.done ? "done" : "pending", t.current ? "current" : ""].filter(Boolean).join(" ");
    return `
      <li class="${cls}">
        <span class="tl-label">${t.label}</span>
        <span class="tl-time">${t.at || "Pending"}</span>
      </li>`;
  }).join("");

  return `
    <dl class="order-detail">
      <div>
        <dt>Student</dt>
        <dd>
          <button type="button" class="student-link" data-student-id="${order.studentId}">${order.student}</button>
        </dd>
      </div>
      <div><dt>Merchant</dt><dd>${order.merchant}</dd></div>
      <div><dt>Status</dt><dd><span class="status-badge ${s.className}"><span class="status-icon"></span>${s.label}</span></dd></div>
      <div><dt>Placed</dt><dd>${order.time}</dd></div>
      <div class="full">
        <dt>Items purchased</dt>
        <dd>
          <table class="order-items-table">
            <thead><tr><th>Item</th><th>Qty</th><th>Subtotal</th></tr></thead>
            <tbody>${itemsRows || `<tr><td colspan="3">—</td></tr>`}</tbody>
          </table>
        </dd>
      </div>
      <div class="full">
        <dt>Student note</dt>
        <dd>${order.note ? `<div class="order-note">${order.note}</div>` : "<span class='muted'>No note</span>"}</dd>
      </div>
      <div class="full">
        <dt>Status timeline</dt>
        <dd><ul class="status-timeline">${timeline}</ul></dd>
      </div>
      <div><dt>Total</dt><dd class="amount">${formatJd(order.total)}</dd></div>
    </dl>
  `;
}

function openOrderModal(orderId) {
  const order = currentOrders.find((o) => o.id === orderId) || ORDERS.find((o) => o.id === orderId);
  const modal = document.getElementById("orderModal");
  const body = document.getElementById("orderModalBody");
  const title = document.getElementById("orderModalTitle");
  if (!order || !modal || !body) return;

  if (title) title.textContent = `Order ${order.id}`;
  body.innerHTML = orderDetailHtml(order);

  body.querySelectorAll("[data-student-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeOrderModal();
      openStudentProfile(btn.dataset.studentId);
    });
  });

  modal.hidden = false;
  requestAnimationFrame(() => modal.classList.add("open"));
}

function closeOrderModal() {
  const modal = document.getElementById("orderModal");
  if (!modal) return;
  modal.classList.remove("open");
  setTimeout(() => {
    modal.hidden = true;
  }, 180);
}

function highlightOrderRow(orderId) {
  const row = document.querySelector(`[data-order-row="${orderId}"]`);
  if (!row) return;
  row.classList.add("users-table-highlight");
  row.scrollIntoView({ behavior: "smooth", block: "nearest" });
  setTimeout(() => row.classList.remove("users-table-highlight"), 2800);
}

function initOrderModal() {
  const modal = document.getElementById("orderModal");
  const closeBtn = document.getElementById("orderModalClose");
  const tbody = document.getElementById("ordersBody");
  const usersBody = document.getElementById("usersBody");

  closeBtn?.addEventListener("click", closeOrderModal);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeOrderModal();
  });

  tbody?.addEventListener("click", (e) => {
    const orderBtn = e.target.closest("[data-order-id]");
    if (orderBtn) {
      openOrderModal(orderBtn.dataset.orderId);
      return;
    }
    const studentBtn = e.target.closest("[data-student-id]");
    if (studentBtn) {
      openStudentProfile(studentBtn.dataset.studentId);
    }
  });

  usersBody?.addEventListener("click", (e) => {
    const studentBtn = e.target.closest("[data-student-id]");
    if (studentBtn) openStudentProfile(studentBtn.dataset.studentId);
  });
}

/* ---------- Mobile sidebar ---------- */
function initSidebarMobile() {
  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("menuToggle");
  const overlay = document.getElementById("sidebarOverlay");
  if (!sidebar || !toggle || !overlay) return;

  const close = () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("visible");
  };

  toggle.addEventListener("click", () => {
    const isOpen = sidebar.classList.toggle("open");
    overlay.classList.toggle("visible", isOpen);
  });

  overlay.addEventListener("click", close);
}

function initRefresh() {
  const btn = document.getElementById("refreshOrders");
  if (!btn) return;

  btn.addEventListener("click", () => {
    btn.textContent = "Updating…";
    btn.disabled = true;
    setTimeout(() => {
      currentOrders = shuffleOrderTimes(
        ORDERS.map((o) => ({
          ...o,
          items: o.items.map((i) => ({ ...i })),
          timeline: o.timeline.map((t) => ({ ...t })),
        })).reverse()
      );
      renderOrders();
      btn.textContent = "Refresh";
      btn.disabled = false;
      showToast("Orders refreshed");
    }, 450);
  });
}

/* ---------- Live dashboard metrics (API) ---------- */
function formatMetricJd(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0.00";
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatMetricCount(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return Math.round(n).toLocaleString("en-US");
}

function setMetricJd(elId, value) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = `${formatMetricJd(value)} <small>JD</small>`;
}

function setMetricCount(elId, value) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = formatMetricCount(value);
}

function applyDashboardMetricsFallback() {
  setMetricJd("metricGmv", 0);
  setMetricJd("metricPlatformEarnings", 0);
  setMetricCount("metricActiveStudents", 0);
  setMetricCount("metricActiveOrders", 0);
}

/**
 * GET ${API_BASE_URL}/api/superadmin/dashboard
 * Maps totalGmv, platformEarnings, activeStudentsToday, activeOrdersCount → metric cards.
 */
async function fetchDashboardMetrics() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/superadmin/dashboard`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`Dashboard API responded with ${res.status}`);
    }

    const data = await res.json();

    const totalGmv = data.totalGmv ?? data.totalSalesGmv ?? 0;
    const platformEarnings = data.platformEarnings ?? 0;
    const activeStudentsToday = data.activeStudentsToday ?? 0;
    const activeOrdersCount = data.activeOrdersCount ?? data.activeOrders ?? 0;

    setMetricJd("metricGmv", totalGmv);
    setMetricJd("metricPlatformEarnings", platformEarnings);
    setMetricCount("metricActiveStudents", activeStudentsToday);
    setMetricCount("metricActiveOrders", activeOrdersCount);

    // Optional finance strip sync when those fields are present
    if (data.pendingPayouts != null) {
      const pendingEl = document.getElementById("pendingPayoutsValue");
      if (pendingEl) pendingEl.innerHTML = `${formatMetricJd(data.pendingPayouts)} <small>JD</small>`;
    }
    if (data.settledThisWeek != null) {
      const settledEl = document.getElementById("settledWeekValue");
      if (settledEl) settledEl.innerHTML = `${formatMetricJd(data.settledThisWeek)} <small>JD</small>`;
    }
  } catch (err) {
    console.error("Failed to fetch dashboard metrics from API:", err);
    applyDashboardMetricsFallback();
  }
}

/* ---------- Ads Management ---------- */
function campusNameById(id) {
  return CAMPUS_CATALOG.find((c) => c.id === id)?.name || id;
}

function getAdCtr(ad) {
  if (!ad.impressions) return 0;
  return (ad.clicks / ad.impressions) * 100;
}

function getAdDerivedStatus(ad) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(ad.endDate + "T23:59:59");
  const start = new Date(ad.startDate + "T00:00:00");
  if (end < today) return "expired";
  if (ad.paused) return "paused";
  if (start > today) return "scheduled";
  return "active";
}

function formatAdDateRange(start, end) {
  const opts = { month: "short", day: "numeric", year: "numeric" };
  const s = new Date(start + "T00:00:00").toLocaleDateString("en-GB", opts);
  const e = new Date(end + "T00:00:00").toLocaleDateString("en-GB", opts);
  return `${s} – ${e}`;
}

function scopeBadgeHtml(ad) {
  if (ad.campusId == null && (!ad.campusIds || ad.campusIds.length === 0)) {
    return `<span class="scope-badge scope-global">Global</span>`;
  }
  const ids = ad.campusIds?.length ? ad.campusIds : ad.campusId ? [ad.campusId] : [];
  return ids
    .map((id) => `<span class="scope-badge scope-campus">${campusNameById(id)}</span>`)
    .join(" ");
}

function statusBadgeHtml(status) {
  const map = {
    active: { label: "Active", cls: "ad-status-active" },
    expired: { label: "Expired", cls: "ad-status-expired" },
    paused: { label: "Paused", cls: "ad-status-paused" },
    scheduled: { label: "Scheduled", cls: "ad-status-scheduled" },
  };
  const s = map[status] || map.active;
  return `<span class="ad-status-badge ${s.cls}">${s.label}</span>`;
}

/**
 * Resolve which ads a student should see.
 * CampusID IS NULL → Global; otherwise match student's CampusID.
 */
function getAdsForStudentCampus(studentCampusId) {
  return advertisements.filter((ad) => {
    const status = getAdDerivedStatus(ad);
    if (status === "expired" || status === "paused") return false;
    if (ad.campusId == null && (!ad.campusIds || ad.campusIds.length === 0)) return true;
    const ids = ad.campusIds?.length ? ad.campusIds : [ad.campusId];
    return ids.includes(studentCampusId);
  });
}

function renderAdsTable() {
  const tbody = document.getElementById("adsTableBody");
  const empty = document.getElementById("adsEmpty");
  if (!tbody) return;

  if (!advertisements.length) {
    tbody.innerHTML = "";
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;

  tbody.innerHTML = advertisements
    .map((ad) => {
      const status = getAdDerivedStatus(ad);
      const ctr = getAdCtr(ad).toFixed(1);
      const canToggle = status !== "expired";
      const isOn = status === "active" || status === "scheduled";
      return `
        <tr data-ad-id="${ad.id}">
          <td>
            <div class="ad-thumb-wrap">
              <img class="ad-thumb" src="${ad.bannerUrl}" alt="" />
            </div>
          </td>
          <td>
            <strong class="ad-row-title">${escapeHtml(ad.title)}</strong>
            <div class="muted">${formatAdDateRange(ad.startDate, ad.endDate)}</div>
            ${ad.targetUrl ? `<div class="ad-deeplink muted">${escapeHtml(ad.targetUrl)}</div>` : ""}
          </td>
          <td><div class="scope-badges">${scopeBadgeHtml(ad)}</div></td>
          <td>
            <div class="ad-metrics">
              <span><strong>${ad.impressions.toLocaleString()}</strong> views</span>
              <span><strong>${ctr}%</strong> CTR</span>
            </div>
          </td>
          <td>${statusBadgeHtml(status)}</td>
          <td>
            <div class="ad-actions">
              <label class="toggle-switch ${canToggle ? "" : "disabled"}" title="${canToggle ? (ad.paused ? "Resume" : "Pause") : "Expired"}">
                <input type="checkbox" data-ad-toggle="${ad.id}" ${isOn && !ad.paused ? "checked" : ""} ${canToggle ? "" : "disabled"} />
                <span class="toggle-track"></span>
              </label>
              <button type="button" class="btn-danger-ghost" data-ad-delete="${ad.id}">Delete</button>
            </div>
          </td>
        </tr>`;
    })
    .join("");
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function apiCreateAd(payload) {
  if (USE_REAL_API) {
    const res = await fetch(`${API_BASE_URL}/api/superadmin/ads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Create failed");
    return res.json();
  }
  await new Promise((r) => setTimeout(r, 350));
  return { ok: true, id: `ad-${String(adIdSeq++).padStart(3, "0")}` };
}

async function apiDeleteAd(adId) {
  if (USE_REAL_API) {
    const res = await fetch(`${API_BASE_URL}/api/superadmin/ads/${adId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
    return;
  }
  await new Promise((r) => setTimeout(r, 200));
}

async function apiToggleAd(adId, paused) {
  if (USE_REAL_API) {
    const res = await fetch(`${API_BASE_URL}/api/superadmin/ads/${adId}/pause`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paused }),
    });
    if (!res.ok) throw new Error("Toggle failed");
    return;
  }
  await new Promise((r) => setTimeout(r, 150));
}

function renderCampusMultiselect() {
  const wrap = document.getElementById("adCampusMultiselect");
  if (!wrap) return;
  wrap.innerHTML = CAMPUS_CATALOG.map(
    (c) => `
    <label class="campus-check">
      <input type="checkbox" name="campusIds" value="${c.id}" />
      <span>${c.name}</span>
    </label>`
  ).join("");
}

function setBannerPreview(dataUrl) {
  pendingBannerDataUrl = dataUrl;
  const preview = document.getElementById("adDropzonePreview");
  const inner = document.getElementById("adDropzoneInner");
  const img = document.getElementById("adBannerPreview");
  if (!preview || !inner || !img) return;
  if (dataUrl) {
    img.src = dataUrl;
    preview.hidden = false;
    inner.hidden = true;
  } else {
    img.removeAttribute("src");
    preview.hidden = true;
    inner.hidden = false;
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

function initAdsManagement() {
  renderCampusMultiselect();
  renderAdsTable();

  const scopeSelect = document.getElementById("adTargetScope");
  const campusField = document.getElementById("adCampusField");
  const form = document.getElementById("adCreateForm");
  const dropzone = document.getElementById("adDropzone");
  const fileInput = document.getElementById("adBannerFile");
  const clearBtn = document.getElementById("adBannerClear");
  const startInput = document.getElementById("adStartDate");
  const endInput = document.getElementById("adEndDate");
  const tbody = document.getElementById("adsTableBody");

  const today = new Date().toISOString().slice(0, 10);
  if (startInput && !startInput.value) startInput.value = today;
  if (endInput && !endInput.value) {
    const end = new Date();
    end.setDate(end.getDate() + 14);
    endInput.value = end.toISOString().slice(0, 10);
  }

  scopeSelect?.addEventListener("change", () => {
    const specific = scopeSelect.value === "specific";
    if (campusField) campusField.hidden = !specific;
  });

  dropzone?.addEventListener("click", (e) => {
    if (e.target.closest("#adBannerClear")) return;
    fileInput?.click();
  });

  dropzone?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInput?.click();
    }
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
    if (file && file.type.startsWith("image/")) {
      setBannerPreview(await readFileAsDataUrl(file));
    } else {
      showToast("Please drop an image file");
    }
  });

  fileInput?.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (file) setBannerPreview(await readFileAsDataUrl(file));
  });

  clearBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (fileInput) fileInput.value = "";
    setBannerPreview(null);
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("adTitle")?.value.trim();
    const scope = scopeSelect?.value;
    const targetUrl = document.getElementById("adTargetUrl")?.value.trim() || "";
    const startDate = startInput?.value;
    const endDate = endInput?.value;

    if (!title) {
      showToast("Please enter an ad title");
      return;
    }
    if (!startDate || !endDate) {
      showToast("Please select start and end dates");
      return;
    }
    if (endDate < startDate) {
      showToast("End date must be after start date");
      return;
    }

    let campusIds = [];
    let campusId = null;
    if (scope === "specific") {
      campusIds = [...document.querySelectorAll('#adCampusMultiselect input[name="campusIds"]:checked')].map(
        (el) => el.value
      );
      if (!campusIds.length) {
        showToast("Select at least one campus");
        return;
      }
      campusId = campusIds.length === 1 ? campusIds[0] : campusIds[0];
    }

    const bannerUrl =
      pendingBannerDataUrl ||
      makeBannerSvg(title.slice(0, 28), "#1E3A8A", "#14B8A6");

    const publishBtn = document.getElementById("adPublishBtn");
    if (publishBtn) {
      publishBtn.disabled = true;
      publishBtn.textContent = "Publishing…";
    }

    try {
      const payload = {
        title,
        campusId, // null = Global
        campusIds: scope === "global" ? null : campusIds,
        bannerUrl,
        targetUrl,
        startDate,
        endDate,
      };
      const result = await apiCreateAd(payload);
      advertisements = [
        {
          id: result.id,
          ...payload,
          impressions: 0,
          clicks: 0,
          paused: false,
        },
        ...advertisements,
      ];
      renderAdsTable();
      form.reset();
      setBannerPreview(null);
      if (campusField) campusField.hidden = true;
      if (startInput) startInput.value = today;
      showToast("Advertisement published");
      // Demo: confirm multi-tenant filter works
      console.debug("Ads for UJ student:", getAdsForStudentCampus("camp-uj").map((a) => a.title));
    } catch (err) {
      console.error(err);
      showToast("Publish failed — try again");
    } finally {
      if (publishBtn) {
        publishBtn.disabled = false;
        publishBtn.textContent = "Publish Advertisement";
      }
    }
  });

  tbody?.addEventListener("change", async (e) => {
    const toggle = e.target.closest("[data-ad-toggle]");
    if (!toggle) return;
    const ad = advertisements.find((a) => a.id === toggle.dataset.adToggle);
    if (!ad) return;
    const paused = !toggle.checked;
    try {
      await apiToggleAd(ad.id, paused);
      ad.paused = paused;
      renderAdsTable();
      showToast(paused ? "Ad paused" : "Ad resumed");
    } catch (err) {
      toggle.checked = !paused;
      showToast("Could not update ad");
    }
  });

  tbody?.addEventListener("click", async (e) => {
    const del = e.target.closest("[data-ad-delete]");
    if (!del) return;
    const id = del.dataset.adDelete;
    if (!confirm("Delete this advertisement?")) return;
    del.disabled = true;
    try {
      await apiDeleteAd(id);
      advertisements = advertisements.filter((a) => a.id !== id);
      renderAdsTable();
      showToast("Advertisement deleted");
    } catch (err) {
      del.disabled = false;
      showToast("Delete failed");
    }
  });
}

/* ---------- Boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  createSparkline("sparkSales", [8200, 9100, 8800, 10200, 9800, 11100, 12500], "#14B8A6");
  createSparkline("sparkEarnings", [410, 480, 450, 520, 490, 580, 625], "#1E3A8A");
  createMainChart();
  renderOrders();
  renderCampuses();
  renderMerchants();
  renderFinance();
  renderUsers();
  renderSettings();
  renderNotificationsUI();
  initAdsManagement();
  initNav();
  initRouteFromHash();
  initProfileDropdown();
  initNotifications();
  initNotifActions();
  initFinanceActions();
  initSearch();
  initOrderModal();
  initSidebarMobile();
  initRefresh();
  fetchDashboardMetrics();
});
