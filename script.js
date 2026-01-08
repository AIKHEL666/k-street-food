const burger = document.querySelector(".burger");
const navLinks = document.querySelector(".nav-links");
const menuTabs = document.querySelectorAll("[data-menu-tab]");
const menuCards = document.querySelectorAll(".card[data-category]");

// Toggle burger menu untuk navigasi mobile
if (burger && navLinks) {
  burger.addEventListener("click", () => {
    burger.classList.toggle("open");
    navLinks.classList.toggle("show");
  });
}

// Tutup menu ketika link diklik
navLinks?.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    burger?.classList.remove("open");
    navLinks.classList.remove("show");
  })
);

// Simpan flag agar halaman contact langsung buka keranjang
document.querySelectorAll('a[href="contact.html"]').forEach((link) =>
  link.addEventListener("click", () => localStorage.setItem("kstreet_cart_open", "1"))
);

// Scroll reveal: tambahkan kelas visible saat elemen masuk viewport
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

// Form contact: rakit pesan WA otomatis
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
    const url = `https://wa.me/62881036380166?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  });
}

// Cart logic untuk tab menu
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
const path = (window.location.pathname || "").toLowerCase();
const SUMMARY_ENABLED =
  /index\.html$/.test(path) ||
  /menu\.html$/.test(path) ||
  /\/k-street-food\/?$/.test(path) ||
  /^\/$/.test(path);

const MENU_DATA = {
  Bibimbap: {
    name: "Bibimbap",
    tag: "Rice Bowl",
    img: "assets/food/Bibimbap.jpg",
    price: "42K",
    ready: "8 menit",
  },
  "Yangnyeom Chicken": {
    name: "Yangnyeom Chicken",
    tag: "Pedas",
    img: "assets/food/Yangnyeom_Chicken.jpg",
    price: "48K",
    ready: "10 menit",
  },
  "Kimchi Jjigae": {
    name: "Kimchi Jjigae",
    tag: "Sup",
    img: "assets/food/Kimchi_Jjigae.jpg",
    price: "40K",
    ready: "9 menit",
  },
  Tteokbokki: {
    name: "Tteokbokki",
    tag: "Street Food",
    img: "assets/food/Tteokbokki.jpg",
    price: "35K",
    ready: "7 menit",
  },
  Jjajangmyeon: {
    name: "Jjajangmyeon",
    tag: "Noodle",
    img: "assets/food/Jjajangmyeon.jpg",
    price: "45K",
    ready: "8 menit",
  },
  "Bulgogi Bowl": {
    name: "Bulgogi Bowl",
    tag: "Grill",
    img: "assets/food/Bulgogi_Bowl.jpg",
    price: "48K",
    ready: "9 menit",
  },
  Dakgalbi: {
    name: "Dakgalbi",
    tag: "Pedas",
    img: "assets/food/Dakgalbi.jpg",
    price: "47K",
    ready: "9 menit",
  },
  Samgyetang: {
    name: "Samgyetang",
    tag: "Sup",
    img: "assets/food/Samgyetang.jpg",
    price: "52K",
    ready: "12 menit",
  },
  Hotteok: {
    name: "Hotteok",
    tag: "Snack",
    img: "assets/snack/Hotteok.jpg",
    price: "18K",
    ready: "5 menit",
  },
  Kimbap: {
    name: "Kimbap",
    tag: "Snack",
    img: "assets/snack/Kimbap.jpg",
    price: "32K",
    ready: "6 menit",
  },
  Mandu: {
    name: "Mandu",
    tag: "Snack",
    img: "assets/snack/Mandu.jpg",
    price: "30K",
    ready: "7 menit",
  },
  "Honey Citron Tea": {
    name: "Honey Citron Tea",
    tag: "Drink",
    img: "assets/drink/Honey_Citron_Tea.jpg",
    price: "25K",
    ready: "4 menit",
  },
  "Strawberry Milk": {
    name: "Strawberry Milk",
    tag: "Drink",
    img: "assets/drink/Strawberry_Milk.jpg",
    price: "28K",
    ready: "3 menit",
  },
  "Iced Americano": {
    name: "Iced Americano",
    tag: "Drink",
    img: "assets/drink/Iced_Americano.jpg",
    price: "22K",
    ready: "2 menit",
  },
  "Peach Iced Tea": {
    name: "Peach Iced Tea",
    tag: "Drink",
    img: "assets/drink/Peach_Iced_Tea.jpg",
    price: "24K",
    ready: "3 menit",
  },
  "Matcha Latte": {
    name: "Matcha Latte",
    tag: "Drink",
    img: "assets/drink/Matcha_Latte.jpg",
    price: "30K",
    ready: "4 menit",
  },
  "Korean Banana Milk": {
    name: "Korean Banana Milk",
    tag: "Drink",
    img: "assets/drink/Korean_Banana_Milk.jpg",
    price: "26K",
    ready: "3 menit",
  },
  "Dalgona Coffee": {
    name: "Dalgona Coffee",
    tag: "Drink",
    img: "assets/drink/Dalgona_Coffee.jpg",
    price: "27K",
    ready: "3 menit",
  },
  "Yuzu Sparkling": {
    name: "Yuzu Sparkling",
    tag: "Drink",
    img: "assets/drink/Yuzu_Sparkling.jpg",
    price: "26K",
    ready: "2 menit",
  },
  "Corn Dog Korea": {
    name: "Corn Dog Korea",
    tag: "Snack",
    img: "assets/snack/Corn_Dog_Korea.jpg",
    price: "25K",
    ready: "6 menit",
  },
  "Odeng Kuah": {
    name: "Odeng Kuah",
    tag: "Snack",
    img: "assets/snack/Odeng_Kuah.jpg",
    price: "23K",
    ready: "5 menit",
  },
  "Gimbap Mini": {
    name: "Gimbap Mini",
    tag: "Snack",
    img: "assets/snack/Gimbap_Mini.jpg",
    price: "20K",
    ready: "5 menit",
  },
  Bungeoppang: {
    name: "Bungeoppang",
    tag: "Snack",
    img: "assets/snack/Bungeoppang.jpg",
    price: "19K",
    ready: "6 menit",
  },
  "Gamja Twigim": {
    name: "Gamja Twigim",
    tag: "Snack",
    img: "assets/snack/Gamja Twigim.jpg",
    price: "18K",
    ready: "5 menit",
  },
};

let cartItems = {};

// Filter grid Food/Drink di halaman menu
function applyMenuFilter(category = "food") {
  if (!menuTabs.length || !menuCards.length) return;
  menuTabs.forEach((btn) => btn.classList.toggle("active", btn.dataset.menuTab === category));
  menuCards.forEach((card) => {
    const isMatch = card.dataset.category === category;
    card.classList.toggle("hidden", !isMatch);
  });
}

menuTabs.forEach((btn) =>
  btn.addEventListener("click", () => {
    applyMenuFilter(btn.dataset.menuTab || "food");
  })
);
applyMenuFilter("food");

// Ambil keranjang dari localStorage (migrasi array lama -> map qty)
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

// Simpan keranjang ke localStorage
function persistCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  } catch {}
}

// Tampilkan jumlah item di badge FAB
function updateBadge() {
  const badge = cartFab?.querySelector(".badge");
  const total = Object.values(cartItems).reduce((a, b) => a + b, 0);
  if (badge) badge.textContent = total;
}

// Notifikasi popup singkat
function showToast(text) {
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1600);
}

// Tambah/kurangi item keranjang lalu refresh semua UI terkait
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

// Render isi keranjang di modal utama
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

// Render keranjang versi ringkas di halaman contact
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

// Buka modal keranjang dan render ulang
function openCart() {
  renderCartModal();
  cartModal?.classList.add("show");
}

// Tutup modal keranjang
function closeCart() {
  cartModal?.classList.remove("show");
}

// Inisialisasi: sync keranjang, badge, dan ringkasan awal
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

const WA_NUMBER = "62881036380166";

// Susun template pesan WA dari isi keranjang
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

// Buka popup kartu menu unggulan dengan daftar item dinamis
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

// Sync angka qty di semua kartu dengan state keranjang
function updateQtyDisplays() {
  document.querySelectorAll(".qty-value").forEach((el) => {
    const name = el.dataset.name;
    el.textContent = cartItems[name] || 0;
  });
}

// Konversi "45K" menjadi angka 45000
function priceToNumber(price) {
  if (!price) return 0;
  const num = parseInt(price.replace(/[^0-9]/g, ""), 10);
  if (isNaN(num)) return 0;
  if (price.toLowerCase().includes("k")) return num * 1000;
  return num;
}

// Hitung total harga keranjang (angka)
function getCartTotal() {
  return Object.entries(cartItems).reduce((sum, [name, qty]) => {
    const item = MENU_DATA[name];
    const p = priceToNumber(item?.price);
    return sum + p * qty;
  }, 0);
}

// Format angka jadi rupiah tanpa desimal
function formatCurrency(num) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
}

// Pastikan tombol ringkasan keranjang tersedia di body
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

// Perbarui teks dan visibilitas ringkasan mengambang
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
