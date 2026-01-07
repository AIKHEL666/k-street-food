const burger = document.querySelector(".burger");
const navLinks = document.querySelector(".nav-links");

if (burger && navLinks) {
  burger.addEventListener("click", () => {
    burger.classList.toggle("open");
    navLinks.classList.toggle("show");
  });
}

// Close mobile menu on link click
navLinks?.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    burger?.classList.remove("open");
    navLinks.classList.remove("show");
  })
);

document.querySelectorAll('a[href="contact.html"]').forEach((link) =>
  link.addEventListener("click", () => localStorage.setItem("kstreet_cart_open", "1"))
);

// Scroll reveal
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// Simple form handler (contact)
const form = document.querySelector("#contact-form");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = data.get("name") || "";
    const email = data.get("email") || "";
    const interest = data.get("interest") || "";
    const message = data.get("message") || "";
    const text = `Halo, saya ${name} ingin pesan catering (${interest}).
Email: ${email}
Detail: ${message}`;
    const url = `https://wa.me/6285156575538?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  });
}

// Cart logic for menu page
const CART_KEY = "kstreet_cart";
const cartFab = document.querySelector(".cart-fab");
const toast = document.querySelector(".toast");
const cartModal = document.querySelector(".cart-modal");
const cartItemsEl = document.querySelector(".cart-items");
const cartList = document.querySelector(".cart-list");
const featureCards = document.querySelectorAll(".feature-card");
const featureModal = document.querySelector(".feature-modal");
const featureList = document.querySelector(".feature-list");
let cartSummary = document.querySelector(".cart-summary");
const SUMMARY_ENABLED = /index\.html|menu\.html|^\/$|^$/.test(
  (window.location.pathname || "").toLowerCase()
);

const MENU_DATA = {
  Bibimbap: {
    name: "Bibimbap",
    tag: "Rice Bowl",
    img: "assets/Bibimbap.jpg",
    price: "42K",
    ready: "8 menit",
  },
  "Yangnyeom Chicken": {
    name: "Yangnyeom Chicken",
    tag: "Pedas",
    img: "assets/Yangnyeom_Chicken.jpg",
    price: "48K",
    ready: "10 menit",
  },
  "Kimchi Jjigae": {
    name: "Kimchi Jjigae",
    tag: "Sup",
    img: "assets/Kimchi_Jjigae.jpg",
    price: "40K",
    ready: "9 menit",
  },
  Tteokbokki: {
    name: "Tteokbokki",
    tag: "Street Food",
    img: "assets/Tteokbokki.jpg",
    price: "35K",
    ready: "7 menit",
  },
  Jjajangmyeon: {
    name: "Jjajangmyeon",
    tag: "Noodle",
    img: "assets/Jjajangmyeon.jpg",
    price: "45K",
    ready: "8 menit",
  },
  Hotteok: {
    name: "Hotteok",
    tag: "Snack",
    img: "assets/Hotteok.jpg",
    price: "18K",
    ready: "5 menit",
  },
  Kimbap: {
    name: "Kimbap",
    tag: "Roll",
    img: "assets/Kimbap.jpg",
    price: "32K",
    ready: "6 menit",
  },
  Mandu: {
    name: "Mandu",
    tag: "Dumpling",
    img: "assets/Mandu.jpg",
    price: "30K",
    ready: "7 menit",
  },
};

let cartItems = {};

function loadCart() {
  if (Object.keys(cartItems).length) return cartItems;
  try {
    const local = localStorage.getItem(CART_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) {
        // migrate from array to qty map
        cartItems = parsed.reduce((acc, name) => {
          acc[name] = (acc[name] || 0) + 1;
          return acc;
        }, {});
      } else if (parsed && typeof parsed === "object") {
        cartItems = parsed;
      }
    }
  } catch (e) {
    cartItems = {};
  }
  return cartItems;
}

function persistCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  } catch {}
}

function updateBadge() {
  const badge = cartFab?.querySelector(".badge");
  const total = Object.values(cartItems).reduce((a, b) => a + b, 0);
  if (badge) badge.textContent = total;
}

function showToast(text) {
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1600);
}

function addItem(name, delta = 1) {
  if (!name) return;
  cartItems[name] = (cartItems[name] || 0) + delta;
  if (cartItems[name] <= 0) delete cartItems[name];
  persistCart();
  updateBadge();
  renderCartModal();
  renderContactCart();
  updateSummary();
  updateQtyDisplays();
}

function renderCartModal() {
  if (!cartItemsEl) return;
  const entries = Object.entries(cartItems);
  if (!entries.length) {
    cartItemsEl.innerHTML = "<div class='cart-item muted'>Keranjang kosong.</div>";
    return;
  }
  cartItemsEl.innerHTML = entries
    .map(([name, qty]) => {
      const item = MENU_DATA[name] || { name, tag: "", price: "-", ready: "-" };
      return `
        <div class="cart-item">
          <div>
            <strong>${item.name}</strong>
            <div class="muted">${item.price || "-"} • Ready: ${item.ready || "-"}</div>
          </div>
          <div class="qty-row">
            <button class="qty-btn cart-dec" data-name="${item.name}" type="button">-</button>
            <span class="qty-value" data-name="${item.name}">${qty}</span>
            <button class="qty-btn cart-inc" data-name="${item.name}" type="button">+</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderContactCart() {
  if (!cartList) return;
  const entries = Object.entries(cartItems);
  if (!entries.length) {
    cartList.innerHTML = "<div class='team-member muted'>Keranjang kosong.</div>";
    return;
  }
  cartList.innerHTML = entries
    .map(([name, qty], idx) => `<div class="team-member"><strong>${idx + 1}. ${name}</strong> — ${qty} porsi</div>`)
    .join("");
}

function openCart() {
  renderCartModal();
  cartModal?.classList.add("show");
}

function closeCart() {
  cartModal?.classList.remove("show");
}

// initialize
loadCart();
updateBadge();
renderCartModal();
renderContactCart();
updateSummary();
updateQtyDisplays();

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (btn) {
    const name = btn.dataset.name || "Menu";
    addItem(name, 1);
    showToast(`${name} ditambahkan ke keranjang`);
  }
  const inc = e.target.closest(".cart-inc");
  const dec = e.target.closest(".cart-dec");
  if (inc) addItem(inc.dataset.name, 1);
  if (dec) addItem(dec.dataset.name, -1);
});

cartFab?.addEventListener("click", openCart);
cartModal?.addEventListener("click", (e) => {
  if (e.target === cartModal) closeCart();
});
document.querySelector("[data-close-cart]")?.addEventListener("click", closeCart);
document.querySelector("[data-clear-cart]")?.addEventListener("click", () => {
  cartItems = {};
  persistCart();
  updateBadge();
  renderCartModal();
  renderContactCart();
  showToast("Keranjang dikosongkan");
  updateSummary();
  updateQtyDisplays();
});

const WA_NUMBER = "6285156575538";

function buildOrderMessage() {
  const entries = Object.entries(cartItems);
  if (!entries.length) return "";
  const itemsText = entries
    .map(([name, qty]) => {
      const item = MENU_DATA[name] || {};
      return `${name} x${qty}${item.price ? ` (@${item.price})` : ""}`;
    })
    .join("%0A");
  const totalItems = Object.values(cartItems).reduce((a, b) => a + (Number(b) || 0), 0);
  const totalPrice = formatCurrency(getCartTotal());
  return `Halo, saya ingin pesan:%0A${itemsText}%0A---%0ATotal: ${totalItems} hidangan • ${totalPrice}`;
}

document.querySelectorAll("a.btn.primary[href='contact.html']").forEach((btn) =>
  btn.addEventListener("click", (e) => {
    if (!Object.keys(cartItems).length) return;
    e.preventDefault();
    const text = buildOrderMessage();
    const url = `https://wa.me/${WA_NUMBER}?text=${text}`;
    window.open(url, "_blank");
  })
);

function openFeatureModal(items, title) {
  if (!featureModal || !featureList) return;
  featureList.innerHTML = items
    .map((name) => {
      const item = MENU_DATA[name] || { name, tag: "", img: "", price: "-", ready: "-" };
      const qty = cartItems[name] || 0;
      return `
        <div class="popup-card">
          <button class="add-btn" data-name="${item.name}" type="button">+</button>
          <img src="${item.img}" alt="${item.name}" />
          <div class="content">
            <span class="tag">${item.tag || ""}</span>
            <h4>${item.name}</h4>
            <p class="muted">Harga: ${item.price} • Ready: ${item.ready}</p>
            <div class="qty-row" style="margin-top:8px;">
              <button class="qty-btn cart-dec" data-name="${item.name}" type="button">-</button>
              <span class="qty-value" data-name="${item.name}">${qty}</span>
              <button class="qty-btn cart-inc" data-name="${item.name}" type="button">+</button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
  featureModal.querySelector("h3").textContent = title || "Pilih menu";
  featureModal.classList.add("show");
}

featureCards.forEach((card) => {
  card.style.cursor = "pointer";
  card.addEventListener("click", () => {
    let items = [];
    try {
      items = JSON.parse(card.dataset.menu || "[]");
    } catch {
      items = [];
    }
    const title = card.querySelector("h3")?.textContent || "Pilih menu";
    openFeatureModal(items, title);
  });
});

featureModal?.addEventListener("click", (e) => {
  if (e.target === featureModal) featureModal.classList.remove("show");
});
document.querySelector("[data-close-feature]")?.addEventListener("click", () => {
  featureModal?.classList.remove("show");
});

function updateQtyDisplays() {
  document.querySelectorAll(".qty-value").forEach((el) => {
    const name = el.dataset.name;
    el.textContent = cartItems[name] || 0;
  });
}

function priceToNumber(price) {
  if (!price) return 0;
  const num = parseInt(price.replace(/[^0-9]/g, ""), 10);
  if (isNaN(num)) return 0;
  if (price.toLowerCase().includes("k")) return num * 1000;
  return num;
}

function getCartTotal() {
  return Object.entries(cartItems).reduce((sum, [name, qty]) => {
    const item = MENU_DATA[name];
    const p = priceToNumber(item?.price);
    return sum + p * qty;
  }, 0);
}

function formatCurrency(num) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
}

function ensureSummary() {
  if (!SUMMARY_ENABLED) return null;
  if (cartSummary) return cartSummary;
  cartSummary = document.createElement("button");
  cartSummary.className = "cart-summary";
  cartSummary.type = "button";
  cartSummary.addEventListener("click", openCart);
  document.body.appendChild(cartSummary);
  return cartSummary;
}

function updateSummary() {
  if (!SUMMARY_ENABLED) {
    if (cartSummary) cartSummary.classList.remove("show");
    return;
  }
  const summaryEl = ensureSummary();
  const totalItems = Object.values(cartItems).reduce((a, b) => a + (Number(b) || 0), 0);
  if (!totalItems) {
    summaryEl.classList.remove("show");
    return;
  }
  const totalPrice = formatCurrency(getCartTotal());
  summaryEl.innerHTML = `<strong>Keranjang</strong> • ${totalItems} hidangan • ${totalPrice}`;
  summaryEl.classList.add("show");
}
