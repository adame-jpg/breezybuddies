/**
 * BreezyBuddies commerce — sticky ATC, PDP showcase, cart drawer, UGC.
 * Copy comes from Liquid `bb.*` translations via #bb-commerce-config.i18n.
 */
(() => {
  const UNIT = 1995;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const readJson = (id) => {
    const el = document.getElementById(id);
    if (!el) return null;
    try {
      return JSON.parse(el.textContent);
    } catch {
      return null;
    }
  };

  const interpolate = (template, vars = {}) =>
    String(template || "").replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) =>
      vars[key] != null ? String(vars[key]) : ""
    );

  const characters = readJson("bb-characters-data") || [];
  const config = readJson("bb-commerce-config") || {};
  const i18n = config.i18n || {};
  const unitCents = config.unitPriceCents || UNIT;
  const bundles = config.bundles || [
    { id: "single", units: 1, discount: 0 },
    { id: "duo", units: 2, discount: 0.125 },
    { id: "family", units: 3, discount: 0.2 },
  ];

  const state = {
    characterId: characters.find((c) => c.id === "ellie")?.id || characters[0]?.id || null,
    bundleId: "family",
    cart: null,
    busy: false,
  };

  const moneyLocale = "en-US";

  const money = (cents) => {
    const value = (Number(cents) || 0) / 100;
    try {
      return new Intl.NumberFormat(moneyLocale, {
        style: "currency",
        currency: config.currency || "EUR",
      }).format(value);
    } catch {
      return `€${value.toFixed(2)}`;
    }
  };

  const discountForUnits = (units) => {
    if (units >= 3) return 0.2;
    if (units >= 2) return 0.125;
    return 0;
  };

  const bundlePrice = (units, priceCents = unitCents) =>
    Math.round(priceCents * units * (1 - discountForUnits(units)));

  const currentCharacter = () => characters.find((c) => c.id === state.characterId) || characters[0];
  const currentBundle = () => bundles.find((b) => b.id === state.bundleId) || bundles[0];

  const fetchCart = async () => {
    const res = await fetch(config.cartJsUrl || "/cart.js", {
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    });
    if (!res.ok) throw new Error("Cart fetch failed");
    state.cart = await res.json();
    return state.cart;
  };

  const addToCart = async (variantId, quantity) => {
    if (!variantId) throw new Error(i18n.pdpMissing || "Missing variant");
    const res = await fetch(config.cartAddUrl || "/cart/add.js", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ items: [{ id: Number(variantId), quantity }] }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.description || data.message || "Add failed");
    await fetchCart();
    return data;
  };

  const changeLine = async (key, quantity) => {
    const res = await fetch(config.cartChangeUrl || "/cart/change.js", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ id: key, quantity }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Change failed");
    state.cart = data;
    return data;
  };

  const cartRoot = () => $("#bb-cart");

  const openCart = async () => {
    const root = cartRoot();
    if (!root) return;
    try {
      await fetchCart();
    } catch {
      /* still open */
    }
    renderCart();
    root.classList.add("is-open");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("bb-cart-lock");
    $("#bb-cart-close")?.focus();
  };

  const closeCart = () => {
    const root = cartRoot();
    if (!root) return;
    root.classList.remove("is-open");
    root.setAttribute("aria-hidden", "true");
    document.body.classList.remove("bb-cart-lock");
  };

  const renderCart = () => {
    const root = cartRoot();
    if (!root) return;
    const cart = state.cart;
    const countEl = $("#bb-cart-count");
    const body = $("#bb-cart-body");
    const shipText = $("#bb-cart-ship-text");
    const shipFill = $("#bb-cart-ship-fill");
    const totalEl = $("#bb-cart-total");
    const hintEl = $("#bb-cart-hint");
    const upsell = $("#bb-cart-upsell");
    const navCount = $$("[data-bb-cart-count]");

    const count = cart?.item_count || 0;
    if (countEl) countEl.textContent = String(count);
    navCount.forEach((el) => {
      el.textContent = String(count);
      el.hidden = count === 0;
    });

    const need = config.freeShipUnits || 3;
    const progress = Math.min(100, (count / need) * 100);
    if (shipFill) shipFill.style.width = `${progress}%`;
    if (shipText) {
      if (count >= need) {
        shipText.textContent = i18n.cartShipDone || "Free shipping unlocked";
        shipText.classList.add("is-done");
      } else {
        const left = need - count;
        shipText.textContent =
          left === 1
            ? i18n.cartShipOne || "1 more buddy for free shipping!"
            : interpolate(i18n.cartShipOther || "{{ count }} more buddies for free shipping!", {
                count: left,
              });
        shipText.classList.remove("is-done");
      }
    }

    if (upsell) {
      const show = count > 0 && count < 3;
      upsell.hidden = !show;
      const copy = $("#bb-cart-upsell-copy");
      if (copy) {
        copy.textContent = count === 1 ? i18n.cartUpsellDuo : i18n.cartUpsellFamily;
      }
    }

    if (!body) return;

    if (!cart || !cart.items?.length) {
      body.innerHTML = `
        <div class="bb-cart__empty">
          <h3>${i18n.cartEmptyTitle || "Your cart is empty"}</h3>
          <p>${i18n.cartEmptyBody || ""}</p>
          <button type="button" class="bb-pdp__atc" data-bb-close-and-shop style="max-width:260px;margin:0 auto;">
            ${i18n.cartChoose || "Choose your buddy"}
          </button>
        </div>`;
      if (totalEl) totalEl.textContent = money(0);
      if (hintEl) hintEl.textContent = "";
      return;
    }

    body.innerHTML = cart.items
      .map((item) => {
        const img = item.image || item.featured_image || "";
        return `
        <article class="bb-cart__line" data-key="${item.key}">
          <img class="bb-cart__line-img" src="${img}" alt="" width="72" height="72" loading="lazy">
          <div>
            <h3 class="bb-cart__line-name">${item.product_title}</h3>
            <p class="bb-cart__line-meta">${
              item.variant_title && item.variant_title !== "Default Title" ? `${item.variant_title} · ` : ""
            }${money(item.final_line_price / item.quantity)} ${i18n.cartEach || ""}</p>
            <div class="bb-cart__qty">
              <button type="button" data-bb-qty="-1" aria-label="${i18n.cartLess || "Less"}">−</button>
              <span>${item.quantity}</span>
              <button type="button" data-bb-qty="1" aria-label="${i18n.cartMore || "More"}">+</button>
            </div>
            <button type="button" class="bb-cart__remove" data-bb-remove>${i18n.cartRemove || "Remove"}</button>
          </div>
          <p class="bb-cart__line-price">${money(item.final_line_price)}</p>
        </article>`;
      })
      .join("");

    if (totalEl) totalEl.textContent = money(cart.total_price);
    const breezy = bundlePrice(count, unitCents);
    if (hintEl) {
      hintEl.textContent =
        count >= 2
          ? interpolate(i18n.cartHintBreezy || "Breezy set price guide: {{ amount }}", {
              amount: money(breezy),
            })
          : i18n.cartHintBundles || "";
    }
  };

  const renderSticky = () => {
    const root = $("#bb-sticky");
    if (!root) return;
    const ch = currentCharacter();
    const b = currentBundle();
    if (!ch || !b) return;

    const thumb = $("#bb-sticky-thumb");
    const name = $("#bb-sticky-name");
    const price = $("#bb-sticky-price");
    if (thumb) {
      thumb.src = ch.image;
      thumb.alt = ch.name;
    }
    if (name) name.textContent = ch.name;
    if (price) {
      const total = bundlePrice(b.units, ch.priceCents || unitCents);
      price.innerHTML =
        b.units === 1
          ? `<strong>${money(ch.priceCents || unitCents)}</strong>`
          : `<strong>${money(total)}</strong> · ${b.units}×`;
    }

    $$("[data-bb-sticky-bundle]").forEach((btn) => {
      btn.setAttribute("aria-pressed", btn.dataset.bbStickyBundle === state.bundleId ? "true" : "false");
    });

    const cta = $("#bb-sticky-cta");
    if (cta) {
      cta.disabled = !ch.variantId || state.busy;
      cta.textContent = state.busy ? i18n.stickyBusy || "…" : i18n.stickyCta || "Add to cart";
    }
  };

  const setupStickyObserver = () => {
    const sticky = $("#bb-sticky");
    if (!sticky) return;

    const mode = sticky.getAttribute("data-bb-sticky-mode") || "product";
    sticky.removeAttribute("hidden");

    // Homepage / non-PDP: only mount when Liquid already gated on cart items — keep visible.
    if (mode !== "product") {
      sticky.classList.add("is-visible");
      return;
    }

    // Product template: reveal after scrolling past hero / gallery.
    const hero = $("#bb-pdp") || $(".hero") || $("#shop");
    if (!hero) {
      sticky.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        const past = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        sticky.classList.toggle("is-visible", past);
      },
      { threshold: 0 }
    );
    io.observe(hero);
  };

  const renderPdp = () => {
    const root = $("#bb-pdp");
    if (!root) return;
    const ch = currentCharacter();
    const b = currentBundle();
    if (!ch || !b) return;

    root.style.setProperty("--soft", ch.soft);
    root.style.setProperty("--accent", ch.accent);

    const stage = $("#bb-pdp-stage-img");
    const title = $("#bb-pdp-title");
    const eyebrow = $("#bb-pdp-eyebrow");
    const price = $("#bb-pdp-price");
    const save = $("#bb-pdp-save");
    const badge = $("#bb-pdp-badge");

    if (stage) {
      stage.src = ch.image;
      stage.alt = ch.name;
    }
    if (title) title.textContent = ch.name;
    if (eyebrow) {
      eyebrow.textContent = interpolate(i18n.pdpEyebrow || "{{ animal }} · {{ group }}", {
        animal: ch.animal,
        group: ch.groupLabel || ch.group || "",
      });
    }
    if (badge) {
      if (ch.badge) {
        badge.hidden = false;
        badge.textContent = ch.badge;
      } else badge.hidden = true;
    }

    const total = bundlePrice(b.units, ch.priceCents || unitCents);
    const full = (ch.priceCents || unitCents) * b.units;
    if (price) price.textContent = money(total);
    if (save) {
      if (b.units > 1) {
        save.hidden = false;
        save.textContent = interpolate(i18n.save || "You save {{ amount }}", {
          amount: money(full - total),
        });
      } else save.hidden = true;
    }

    $$("[data-bb-swatch]").forEach((btn) => {
      const on = btn.dataset.bbSwatch === state.characterId;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    $$("[data-bb-pdp-bundle], [data-bb-bundle-card], .bb-bundle-card").forEach((btn) => {
      const id = btn.dataset.bbPdpBundle || btn.dataset.bbBundleCard;
      if (!id) return;
      btn.setAttribute("aria-pressed", id === state.bundleId ? "true" : "false");
      btn.classList.toggle("is-selected", id === state.bundleId);
    });

    const thumbs = $("#bb-pdp-thumbs");
    if (thumbs && !thumbs.dataset.ready) {
      thumbs.innerHTML = characters
        .slice(0, 6)
        .map(
          (c) => `
        <button type="button" class="bb-pdp__thumb" data-bb-thumb="${c.id}" aria-label="${c.name}">
          <img src="${c.image}" alt="" width="68" height="68" loading="lazy">
        </button>`
        )
        .join("");
      thumbs.dataset.ready = "1";
    }
    $$("[data-bb-thumb]").forEach((btn) => {
      btn.setAttribute("aria-selected", btn.dataset.bbThumb === state.characterId ? "true" : "false");
    });

    const atc = $("#bb-pdp-atc");
    if (atc) {
      atc.disabled = !ch.variantId || state.busy;
      atc.textContent = state.busy
        ? i18n.stickyBusy || "…"
        : b.units === 1
          ? i18n.pdpAtc || "Add to cart"
          : interpolate(i18n.pdpAtcMulti || "Add {{ count }} buddies to cart", { count: b.units });
    }
  };

  const selectCharacter = (id) => {
    if (!characters.some((c) => c.id === id)) return;
    state.characterId = id;
    renderSticky();
    renderPdp();
  };

  const selectBundle = (id) => {
    if (!bundles.some((b) => b.id === id)) return;
    state.bundleId = id;
    renderSticky();
    renderPdp();
    $$(".bb-bundle-card").forEach((card) => {
      const bid = card.dataset.bbPdpBundle;
      card.setAttribute("aria-pressed", bid === id ? "true" : "false");
      card.classList.toggle("is-selected", bid === id);
    });
  };

  const handleAdd = async () => {
    const ch = currentCharacter();
    const b = currentBundle();
    if (!ch?.variantId) {
      alert(i18n.pdpMissing || "Product not linked");
      return;
    }
    state.busy = true;
    renderSticky();
    renderPdp();
    try {
      await addToCart(ch.variantId, b.units);
      await openCart();
    } catch (err) {
      alert(err.message || "Could not add to cart");
    } finally {
      state.busy = false;
      renderSticky();
      renderPdp();
    }
  };

  const setupUgc = () => {
    const root = $("[data-bb-ugc]");
    const track = $("[data-bb-ugc-track]");
    if (!root || !track) return;
    const scrollBy = (dir) => {
      track.scrollBy({ left: dir * Math.min(320, track.clientWidth * 0.8), behavior: "smooth" });
    };
    root.addEventListener("click", (e) => {
      if (e.target.closest("[data-bb-ugc-prev]")) scrollBy(-1);
      if (e.target.closest("[data-bb-ugc-next]")) scrollBy(1);
      const play = e.target.closest(".bb-ugc__play");
      if (play) {
        const card = play.closest(".bb-ugc__card");
        card?.classList.toggle("is-playing");
        play.textContent = card?.classList.contains("is-playing") ? "❚❚" : "▶";
      }
    });
  };

  const bind = () => {
    document.addEventListener("click", async (e) => {
      if (e.target.closest("[data-bb-open-cart]")) {
        e.preventDefault();
        openCart();
        return;
      }
      if (e.target.closest("[data-bb-close-cart], .bb-cart__backdrop")) {
        e.preventDefault();
        closeCart();
        return;
      }
      if (e.target.closest("[data-bb-close-and-shop]")) {
        closeCart();
        $("#shop")?.scrollIntoView({ behavior: "smooth" });
        return;
      }

      const stickyBundle = e.target.closest("[data-bb-sticky-bundle]");
      if (stickyBundle) {
        selectBundle(stickyBundle.dataset.bbStickyBundle);
        return;
      }
      const pdpBundle = e.target.closest("[data-bb-pdp-bundle]");
      if (pdpBundle) {
        selectBundle(pdpBundle.dataset.bbPdpBundle);
        if (!e.target.closest("#bb-pdp")) $("#shop")?.scrollIntoView({ behavior: "smooth" });
        return;
      }
      const swatch = e.target.closest("[data-bb-swatch]");
      if (swatch) {
        selectCharacter(swatch.dataset.bbSwatch);
        return;
      }
      const thumb = e.target.closest("[data-bb-thumb]");
      if (thumb) {
        selectCharacter(thumb.dataset.bbThumb);
        return;
      }
      if (e.target.closest("#bb-sticky-cta, #bb-pdp-atc")) {
        e.preventDefault();
        handleAdd();
        return;
      }
      const cardPick = e.target.closest("[data-bb-pick]");
      if (cardPick) selectCharacter(cardPick.dataset.bbPick);

      const qtyBtn = e.target.closest("[data-bb-qty]");
      if (qtyBtn) {
        const line = qtyBtn.closest("[data-key]");
        if (!line || !state.cart) return;
        const item = state.cart.items.find((i) => i.key === line.dataset.key);
        if (!item) return;
        try {
          await changeLine(item.key, Math.max(0, item.quantity + Number(qtyBtn.dataset.bbQty)));
          renderCart();
        } catch (err) {
          alert(err.message);
        }
        return;
      }
      const removeBtn = e.target.closest("[data-bb-remove]");
      if (removeBtn) {
        const line = removeBtn.closest("[data-key]");
        if (!line) return;
        try {
          await changeLine(line.dataset.key, 0);
          renderCart();
        } catch (err) {
          alert(err.message);
        }
        return;
      }
      const upsellBtn = e.target.closest("[data-bb-upsell-add]");
      if (upsellBtn) {
        const ch = currentCharacter();
        if (!ch?.variantId) return;
        try {
          await addToCart(ch.variantId, 1);
          renderCart();
        } catch (err) {
          alert(err.message);
        }
        return;
      }
      const cableBtn = e.target.closest("[data-bb-upsell-cable]");
      if (cableBtn) {
        const vid = cableBtn.dataset.variant;
        if (!vid) return;
        try {
          await addToCart(vid, 1);
          cableBtn.textContent = i18n.cableAdded || "Added";
          cableBtn.disabled = true;
          renderCart();
        } catch (err) {
          alert(err.message);
        }
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeCart();
    });

    $$(".bb-site .card form[action*='/cart/add']").forEach((form) => {
      form.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        const id = form.querySelector('[name="id"]')?.value;
        const card = form.closest("[data-bb-pick]");
        if (card) selectCharacter(card.dataset.bbPick);
        if (!id) return;
        try {
          await addToCart(id, currentBundle()?.units || 1);
          await openCart();
        } catch (err) {
          alert(err.message);
        }
      });
    });
  };

  const init = async () => {
    if (!characters.length && !$("#bb-sticky") && !$("#bb-pdp") && !$("#bb-cart")) return;
    bind();
    setupUgc();
    renderSticky();
    renderPdp();
    setupStickyObserver();
    try {
      await fetchCart();
      renderCart();
    } catch {
      /* preview */
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
