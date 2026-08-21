/** Slide-out basket: lines, quantity controls, free-shipping meter, cross-sell. */
import { POLICY, PREVIEW_MODE } from "./config.js";
import { UNIT_PRICE, buddyById } from "./catalog.js";
import { t } from "./i18n.js";
import {
  addToCart,
  cartTotals,
  money,
  removeLine,
  setQty,
  state,
  subscribe,
  suggestion,
} from "./store.js";
import { $, asset, escape, icon, picture } from "./ui.js";
import { itemPayload, track } from "./analytics.js";
import { closeDrawer, openDrawer } from "./chrome.js";

const lineHtml = (line) => {
  const buddy = buddyById(line.buddyId);
  return `
    <li class="cart-line">
      <div class="cart-line__img" style="--accent:${buddy.accentSoft}">
        ${picture({
          src: asset(buddy.image),
          alt: buddy.name,
          widths: [450],
          sizes: "72px",
          width: 72,
          height: 72,
        })}
      </div>
      <div class="cart-line__body">
        <p class="cart-line__name">${escape(buddy.name)}</p>
        <p class="cart-line__meta">${t(buddy.animalKey)} · ${money(UNIT_PRICE)}</p>
        <div class="qty" role="group" aria-label="${t("cart.qtyLabel", { name: buddy.name })}">
          <button type="button" data-qty-down="${buddy.id}" aria-label="−">−</button>
          <span aria-live="polite">${line.qty}</span>
          <button type="button" data-qty-up="${buddy.id}" aria-label="+">+</button>
        </div>
      </div>
      <button type="button" class="cart-line__remove" data-remove="${buddy.id}"
              aria-label="${t("cart.remove")}">${icon("close", 16)}</button>
    </li>`;
};

const progressHtml = (totals) => {
  const target = POLICY.freeShippingFromUnits;
  const pct = Math.min(100, Math.round((totals.qty / target) * 100));
  return `
    <div class="meter${totals.freeShipping ? " is-done" : ""}">
      <p class="meter__label">
        ${icon("truck", 18)}
        <span>${
          totals.freeShipping
            ? t("cart.progressDone")
            : t("cart.progress", { n: totals.unitsToFreeShipping })
        }</span>
      </p>
      <div class="meter__track"><div class="meter__fill" style="width:${pct}%"></div></div>
    </div>`;
};

const crossSellHtml = () => {
  const buddy = suggestion();
  if (!buddy) return "";
  return `
    <div class="cross">
      <p class="cross__title">${t("cart.cross")}</p>
      <div class="cross__row">
        <div class="cross__img" style="--accent:${buddy.accentSoft}">
          ${picture({
            src: asset(buddy.image),
            alt: buddy.name,
            widths: [450],
            sizes: "56px",
            width: 56,
            height: 56,
          })}
        </div>
        <div>
          <p class="cross__name">${escape(buddy.name)}</p>
          <p class="cross__price">${money(UNIT_PRICE)}</p>
        </div>
        <button type="button" class="btn btn--soft btn--sm" data-add="${buddy.id}">+</button>
      </div>
    </div>`;
};

const bodyHtml = () => {
  const totals = cartTotals();
  if (!state.lines.length) {
    return `
      <div class="cart-empty">
        <p>${t("cart.empty")}</p>
        <a class="btn btn--primary" href="${asset("product.html")}">${t("cart.emptyCta")}</a>
      </div>`;
  }
  return `
    ${progressHtml(totals)}
    <ul class="cart-lines">${state.lines.map(lineHtml).join("")}</ul>
    ${crossSellHtml()}`;
};

const footHtml = () => {
  const totals = cartTotals();
  if (!state.lines.length) return "";
  return `
    <div class="cart-foot__rows">
      <div class="cart-foot__row">
        <span>${t("cart.subtotal")}</span>
        <strong>${money(totals.total)}</strong>
      </div>
      ${
        totals.saved > 0
          ? `<div class="cart-foot__row cart-foot__row--save">
               <span>${t("bundle.save", { amount: money(totals.saved) })}</span>
               <span class="strike">${money(totals.list)}</span>
             </div>`
          : ""
      }
    </div>
    <button type="button" class="btn btn--primary btn--block btn--lg" data-checkout>
      ${t("cart.checkout")} · ${money(totals.total)}
    </button>
    <p class="cart-foot__note">${icon("lock", 15)} ${t("cart.secure")}</p>
    <p class="cart-foot__note cart-foot__note--muted">${t("cart.taxNote")}</p>`;
};

export const renderCart = () => {
  const drawer = $("#cart-drawer");
  if (!drawer) return;
  $("[data-cart-title]", drawer).textContent = t("cart.title");
  $("[data-cart-body]", drawer).innerHTML = bodyHtml();
  $("[data-cart-foot]", drawer).innerHTML = footHtml();
};

export const mountCart = () => {
  const html = `
    <div class="drawer drawer--right" id="cart-drawer" hidden>
      <div class="drawer__scrim" data-cart-close></div>
      <aside class="drawer__panel" role="dialog" aria-modal="true" aria-label="${t("cart.title")}">
        <div class="drawer__head">
          <h2 class="drawer__title" data-cart-title>${t("cart.title")}</h2>
          <button type="button" class="icon-btn" data-cart-close data-autofocus
                  aria-label="${t("a11y.close")}">${icon("close")}</button>
        </div>
        <div class="drawer__body" data-cart-body></div>
        <div class="cart-foot" data-cart-foot></div>
      </aside>
    </div>
    <div class="toast" id="toast" role="status" aria-live="polite" hidden></div>`;

  const holder = document.createElement("div");
  holder.innerHTML = html;
  document.body.append(...holder.children);
  renderCart();

  document.addEventListener("click", (event) => {
    const target = event.target;

    if (target.closest("[data-cart-open]")) {
      renderCart();
      openDrawer("cart-drawer");
      const totals = cartTotals();
      track("view_cart", { currency: "EUR", value: totals.total, items_total: totals.qty });
    }
    if (target.closest("[data-cart-close]")) closeDrawer("cart-drawer");

    const up = target.closest("[data-qty-up]");
    if (up) {
      const id = up.dataset.qtyUp;
      const line = state.lines.find((l) => l.buddyId === id);
      setQty(id, (line?.qty || 0) + 1);
    }
    const down = target.closest("[data-qty-down]");
    if (down) {
      const id = down.dataset.qtyDown;
      const line = state.lines.find((l) => l.buddyId === id);
      setQty(id, (line?.qty || 0) - 1);
    }
    const remove = target.closest("[data-remove]");
    if (remove) removeLine(remove.dataset.remove);

    const add = target.closest("[data-add]");
    if (add) {
      const buddy = buddyById(add.dataset.add);
      addToCart(buddy.id, 1);
      track("add_to_cart", itemPayload(buddy, UNIT_PRICE, 1));
    }

    if (target.closest("[data-checkout]")) {
      const totals = cartTotals();
      track("begin_checkout", { currency: "EUR", value: totals.total, items_total: totals.qty });
      if (PREVIEW_MODE) showToast(t("preview.checkout"));
    }
  });

  subscribe(() => renderCart());
};

let toastTimer = null;

export const showToast = (message) => {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  requestAnimationFrame(() => toast.classList.add("is-on"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("is-on");
    setTimeout(() => {
      toast.hidden = true;
    }, 300);
  }, 2600);
};
