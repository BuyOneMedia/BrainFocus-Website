(function () {
  const cfg = window.BOM_STORE_CONFIG || {
    store: "bomcustoms",
    name: "BOM Customs",
    accent: "#0F766E",
    button: "#FF5722",
    apiBase: "",
  };

  const STORAGE_KEY = "bom_cart_" + cfg.store;

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveCart(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {}
    renderCartUI();
  }

  function injectCartDOM() {
    if (document.getElementById("bom-cart-drawer")) return;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <!-- Floating Bottom-Right Cart Pill -->
      <button id="bom-cart-fab" type="button" aria-label="Open shopping cart"
        style="background:${cfg.accent};"
        class="fixed bottom-5 right-5 z-40 text-white font-bold px-5 py-3.5 rounded-full shadow-xl flex items-center gap-2.5 hover:opacity-95 transition transform hover:scale-105">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h12M7 13L5.4 5M10 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm9 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
        </svg>
        <span>Cart</span>
        <span id="bom-cart-fab-count" class="px-2 py-0.5 text-xs rounded-full bg-white text-slate-900 font-extrabold">0</span>
      </button>

      <!-- Backdrop -->
      <div id="bom-cart-backdrop" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 hidden transition-opacity"></div>

      <!-- Drawer -->
      <aside id="bom-cart-drawer" aria-label="Shopping Cart"
        class="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl border-l border-slate-200 flex flex-col transform translate-x-full transition-transform duration-200">
        <div class="p-5 border-b border-slate-200 flex items-center justify-between bg-[#FAF8F5]">
          <div class="flex items-center gap-2.5">
            <h2 class="text-lg font-extrabold text-slate-900">Your Instant Download Cart</h2>
            <span id="bom-cart-header-count" class="px-2.5 py-0.5 text-xs rounded-full font-bold text-white" style="background:${cfg.accent}">0</span>
          </div>
          <button id="bom-cart-close" type="button" aria-label="Close cart" class="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- 15% Bundle Discount Banner -->
        <div id="bom-cart-bundle-banner" class="px-5 py-3 bg-teal-50 border-b border-teal-200 text-xs sm:text-sm font-semibold text-teal-900">
          Add 3 or more items to automatically save <strong>15% OFF</strong> your entire order!
        </div>

        <!-- Cart Items -->
        <div id="bom-cart-items" class="flex-1 overflow-y-auto p-5 space-y-3"></div>

        <!-- Footer -->
        <div class="p-5 border-t border-slate-200 bg-[#FAF8F5] space-y-3">
          <div id="bom-cart-totals" class="space-y-1 text-sm"></div>
          <button id="bom-cart-checkout-btn" type="button"
            style="background:${cfg.button};"
            class="w-full py-3.5 px-6 rounded-xl text-white font-extrabold text-base shadow-sm hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-50">
            <span>Checkout Direct with Stripe &rarr;</span>
          </button>
          <p class="text-[12px] text-center text-slate-500">
            Instant access to your PDFs &amp; Canva links immediately after payment. Apple Pay, Google Pay &amp; Cards accepted.
          </p>
        </div>
      </aside>
    `;
    document.body.appendChild(wrapper);

    document.getElementById("bom-cart-fab").addEventListener("click", openCart);
    document.getElementById("bom-cart-close").addEventListener("click", closeCart);
    document.getElementById("bom-cart-backdrop").addEventListener("click", closeCart);
    document.getElementById("bom-cart-checkout-btn").addEventListener("click", startCheckout);

    const navBtn = document.getElementById("bom-nav-cart-btn");
    if (navBtn) {
      navBtn.addEventListener("click", openCart);
    }
  }

  function openCart() {
    injectCartDOM();
    renderCartUI();
    document.getElementById("bom-cart-backdrop").classList.remove("hidden");
    document.getElementById("bom-cart-drawer").classList.remove("translate-x-full");
  }

  function closeCart() {
    const bd = document.getElementById("bom-cart-backdrop");
    const dr = document.getElementById("bom-cart-drawer");
    if (bd) bd.classList.add("hidden");
    if (dr) dr.classList.add("translate-x-full");
  }

  function renderCartUI() {
    injectCartDOM();
    const items = loadCart();
    const count = items.length;

    const fabCount = document.getElementById("bom-cart-fab-count");
    const hdrCount = document.getElementById("bom-cart-header-count");
    const navCount = document.getElementById("bom-nav-cart-count");
    if (fabCount) fabCount.textContent = String(count);
    if (hdrCount) hdrCount.textContent = String(count);
    if (navCount) navCount.textContent = String(count);

    const banner = document.getElementById("bom-cart-bundle-banner");
    const listEl = document.getElementById("bom-cart-items");
    const totalsEl = document.getElementById("bom-cart-totals");
    const checkoutBtn = document.getElementById("bom-cart-checkout-btn");

    const subtotal = items.reduce((acc, it) => acc + Number(it.price || 0), 0);
    const hasDiscount = count >= 3;
    const discount = hasDiscount ? subtotal * 0.15 : 0;
    const total = subtotal - discount;

    if (banner) {
      if (count === 0) {
        banner.innerHTML = `Bundle &amp; Save: Add any <strong>3+ items</strong> for an automatic <strong>15% discount</strong>!`;
      } else if (count < 3) {
        const rem = 3 - count;
        banner.innerHTML = `Add <strong>${rem} more item${rem > 1 ? "s" : ""}</strong> to unlock <strong>15% OFF</strong> your entire order!`;
      } else {
        banner.innerHTML = `&#10003; <strong>15% Bundle Discount Unlocked!</strong> You're saving <strong>$${discount.toFixed(2)}</strong> on this order.`;
      }
    }

    if (listEl) {
      if (count === 0) {
        listEl.innerHTML = `
          <div class="text-center py-12 text-slate-500">
            <p class="font-semibold text-base text-slate-700 mb-1">Your cart is empty</p>
            <p class="text-sm">Click "Add to Cart" on any printable pack or Canva template to get started.</p>
          </div>
        `;
      } else {
        listEl.innerHTML = items
          .map(
            (it) => `
          <div class="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
            ${
              it.image
                ? `<img src="${it.image}" alt="" class="w-14 h-14 rounded-lg object-cover border border-slate-100 shrink-0">`
                : ""
            }
            <div class="flex-1 min-w-0">
              <p class="font-bold text-slate-900 text-sm truncate">${it.title}</p>
              <p class="text-xs text-slate-500">
                $${Number(it.price).toFixed(2)}
                ${it.canva_count ? ` &middot; <span class="text-teal-700 font-semibold">${it.canva_count} Canva Links</span>` : ""}
              </p>
            </div>
            <button type="button" data-remove-sku="${it.sku}" aria-label="Remove item"
              class="text-xs font-semibold text-slate-400 hover:text-red-600 px-2 py-1">
              Remove
            </button>
          </div>
        `
          )
          .join("");

        listEl.querySelectorAll("[data-remove-sku]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const sku = btn.getAttribute("data-remove-sku");
            removeItem(sku);
          });
        });
      }
    }

    if (totalsEl) {
      if (count === 0) {
        totalsEl.innerHTML = "";
      } else {
        totalsEl.innerHTML = `
          <div class="flex justify-between text-slate-600">
            <span>Subtotal (${count} item${count > 1 ? "s" : ""})</span>
            <span>$${subtotal.toFixed(2)}</span>
          </div>
          ${
            hasDiscount
              ? `<div class="flex justify-between text-emerald-700 font-semibold">
                  <span>15% Bundle Discount (3+ items)</span>
                  <span>-$${discount.toFixed(2)}</span>
                </div>`
              : ""
          }
          <div class="flex justify-between text-slate-900 font-extrabold text-base pt-1.5 border-t border-slate-200">
            <span>Total</span>
            <span>$${total.toFixed(2)} USD</span>
          </div>
        `;
      }
    }

    if (checkoutBtn) {
      checkoutBtn.disabled = count === 0;
    }
  }

  function addItem(prod, openDrawer = true) {
    const items = loadCart();
    if (!items.some((x) => x.sku === prod.sku)) {
      items.push({
        sku: prod.sku,
        title: prod.short_title || prod.title,
        price: Number(prod.price),
        image: prod.image || "",
        canva_count: prod.canva_count || 0,
        file_count: prod.file_count || 1,
      });
      saveCart(items);
    }
    if (openDrawer) {
      openCart();
    }
  }

  function removeItem(sku) {
    const items = loadCart().filter((x) => x.sku !== sku);
    saveCart(items);
  }

  async function startCheckout() {
    const items = loadCart();
    if (!items.length) return;
    const btn = document.getElementById("bom-cart-checkout-btn");
    const origHtml = btn ? btn.innerHTML : "";
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span>Redirecting to Secure Stripe Checkout...</span>`;
    }
    try {
      const payload = {
        store: cfg.store,
        origin: cfg.portalOrigin || window.location.origin,
        items: items.map((i) => ({ sku: i.sku, qty: 1 })),
      };
      let resp = await fetch((cfg.apiBase || "") + "/api/commerce/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (resp.status === 404 || resp.status === 405) {
        payload.origin = "https://bomcustoms.com";
        resp = await fetch("https://bomcustoms.com/api/commerce/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const data = await resp.json();
      if (!resp.ok || !data.checkout_url) {
        throw new Error(data.detail || "Unable to start checkout.");
      }
      window.location.href = data.checkout_url;
    } catch (err) {
      alert("Checkout error: " + err.message);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origHtml;
      }
    }
  }

  window.BOMCart = {
    add: addItem,
    remove: removeItem,
    open: openCart,
    close: closeCart,
    checkout: startCheckout,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderCartUI);
  } else {
    renderCartUI();
  }
})();
