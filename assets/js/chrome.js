/** Announcement bar, header, mobile nav, market picker, footer, preview note. */
import { BRAND, CURRENCIES, MARKETS, POLICY, PREVIEW_MODE, RATES_ARE_PLACEHOLDER } from "./config.js";
import { LANGS, t } from "./i18n.js";
import { cartCount, setCurrency, setLanguage, setMarket, state, subscribe } from "./store.js";
import { $, $$, BASE, asset, escape, icon, logo, mount } from "./ui.js";

const link = (path) => asset(path);

const NAV = [
  { key: "nav.shop", href: "index.html#shop" },
  { key: "nav.how", href: "index.html#how" },
  { key: "nav.reviews", href: "index.html#reviews" },
  { key: "nav.faq", href: "index.html#faq" },
  { key: "nav.track", href: "pages/track-order.html" },
];

const FOOTER_COLUMNS = [
  {
    titleKey: "footer.shop",
    links: [
      { key: "nav.shop", href: "index.html#shop" },
      { key: "pdp.name", href: "product.html", raw: "BreezyBuddy™" },
      { key: "bundle.title", href: "index.html#bundles" },
    ],
  },
  {
    titleKey: "footer.help",
    links: [
      { key: "nav.faq", href: "pages/faq.html" },
      { key: "footer.shipping", href: "pages/shipping.html" },
      { key: "footer.returns", href: "pages/returns.html" },
      { key: "nav.track", href: "pages/track-order.html" },
      { key: "nav.contact", href: "pages/contact.html" },
    ],
  },
  {
    titleKey: "footer.company",
    links: [
      { key: "nav.about", href: "pages/about.html" },
      { key: "nav.contact", href: "pages/contact.html" },
    ],
  },
  {
    titleKey: "footer.legal",
    links: [
      { key: "footer.privacy", href: "pages/privacy.html" },
      { key: "footer.terms", href: "pages/terms.html" },
      { key: "footer.cookies", href: "pages/cookies.html" },
    ],
  },
];

const announceItems = () => [
  t("announce.1"),
  t("announce.2"),
  t("announce.3", { days: POLICY.returnsDays }),
];

const marketPanel = () => `
  <div class="market__panel" id="market-panel" hidden>
    <label class="field">
      <span class="field__label">${t("market.country")}</span>
      <select data-market>
        ${MARKETS.map(
          (m) =>
            `<option value="${m.code}"${m.code === state.market ? " selected" : ""}>${escape(m.label)}</option>`
        ).join("")}
      </select>
    </label>
    <label class="field">
      <span class="field__label">${t("market.language")}</span>
      <select data-lang>
        ${LANGS.map(
          (l) => `<option value="${l.code}"${l.code === state.lang ? " selected" : ""}>${l.label}</option>`
        ).join("")}
      </select>
    </label>
    <label class="field">
      <span class="field__label">${t("market.currency")}</span>
      <select data-currency>
        ${Object.keys(CURRENCIES)
          .map((c) => `<option value="${c}"${c === state.currency ? " selected" : ""}>${c}</option>`)
          .join("")}
      </select>
    </label>
    ${RATES_ARE_PLACEHOLDER ? `<p class="market__note">${t("market.note")}</p>` : ""}
  </div>`;

const headerHtml = () => `
  <div class="announce">
    <div class="wrap announce__inner">
      <ul class="announce__list" aria-live="off">
        ${announceItems().map((text) => `<li class="announce__item">${escape(text)}</li>`).join("")}
      </ul>
    </div>
  </div>
  ${
    PREVIEW_MODE
      ? `<div class="preview-bar" id="preview-bar">
          <div class="wrap preview-bar__inner">
            <strong>${t("preview.title")}</strong>
            <span>${t("preview.body")}</span>
            <button type="button" class="preview-bar__x" data-preview-dismiss
                    aria-label="${t("a11y.close")}">${icon("close", 16)}</button>
          </div>
        </div>`
      : ""
  }
  <header class="header" id="header">
    <div class="wrap header__inner">
      <button type="button" class="icon-btn header__burger" data-nav-open
              aria-label="${t("a11y.menu")}" aria-controls="nav-drawer" aria-expanded="false">
        ${icon("menu")}
      </button>

      <a class="header__logo" href="${link("index.html")}" aria-label="${escape(BRAND.name)}">
        ${logo(BRAND.name)}
      </a>

      <nav class="header__nav" aria-label="${t("nav.shop")}">
        ${NAV.map((item) => `<a href="${link(item.href)}">${t(item.key)}</a>`).join("")}
      </nav>

      <div class="header__actions">
        <div class="market">
          <button type="button" class="market__btn" data-market-toggle
                  aria-expanded="false" aria-controls="market-panel">
            <span>${state.market}</span><span class="market__cur">${state.currency}</span>
            ${icon("chevronDown", 16)}
          </button>
          ${marketPanel()}
        </div>
        <button type="button" class="icon-btn cart-btn" data-cart-open aria-label="${t("a11y.cart")}">
          ${icon("cart")}
          <span class="cart-btn__count" data-cart-count hidden>0</span>
        </button>
      </div>
    </div>
  </header>

  <div class="drawer drawer--left" id="nav-drawer" hidden>
    <div class="drawer__scrim" data-nav-close></div>
    <div class="drawer__panel" role="dialog" aria-modal="true" aria-label="${t("nav.shop")}">
      <div class="drawer__head">
        ${logo(BRAND.name, { compact: true })}
        <button type="button" class="icon-btn" data-nav-close aria-label="${t("a11y.close")}">
          ${icon("close")}
        </button>
      </div>
      <nav class="drawer__nav">
        ${NAV.map((item) => `<a href="${link(item.href)}">${t(item.key)}${icon("chevron", 18)}</a>`).join("")}
        <a href="${link("pages/contact.html")}">${t("nav.contact")}${icon("chevron", 18)}</a>
      </nav>
      <a class="btn btn--primary btn--block" href="${link("product.html")}">${t("hero.cta")}</a>
    </div>
  </div>`;

const footerHtml = () => `
  <div class="wrap footer__inner">
    <div class="footer__brand">
      ${logo(BRAND.name)}
      <p class="footer__tagline">${t("footer.tagline")}</p>
      <p class="footer__follow">${t("footer.follow")}</p>
      <div class="footer__social">
        <a href="${BRAND.social.instagram}" rel="noopener noreferrer nofollow" target="_blank"
           aria-label="Instagram">${icon("instagram", 20)}</a>
        <a href="${BRAND.social.tiktok}" rel="noopener noreferrer nofollow" target="_blank"
           aria-label="TikTok">${icon("tiktok", 20)}</a>
        <a href="${BRAND.social.pinterest}" rel="noopener noreferrer nofollow" target="_blank"
           aria-label="Pinterest">${icon("pinterest", 20)}</a>
      </div>
    </div>
    ${FOOTER_COLUMNS.map(
      (col) => `
      <nav class="footer__col" aria-label="${t(col.titleKey)}">
        <h2 class="footer__title">${t(col.titleKey)}</h2>
        <ul>
          ${col.links
            .map((l) => `<li><a href="${link(l.href)}">${l.raw || t(l.key)}</a></li>`)
            .join("")}
        </ul>
      </nav>`
    ).join("")}
  </div>
  <div class="wrap footer__legal">
    <p>${t("footer.rights", { year: new Date().getFullYear(), brand: BRAND.name })}</p>
    <p class="footer__todo">${escape(BRAND.legalName)} · ${escape(BRAND.address)}</p>
  </div>`;

const trapFocus = (panel, event) => {
  const focusables = $$(
    'a[href], button:not([disabled]), select, input, [tabindex]:not([tabindex="-1"])',
    panel
  );
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};

let lastFocused = null;

export const openDrawer = (id) => {
  const drawer = document.getElementById(id);
  if (!drawer) return;
  lastFocused = document.activeElement;
  drawer.hidden = false;
  document.body.classList.add("is-locked");
  requestAnimationFrame(() => drawer.classList.add("is-open"));
  const focusTarget = $(".drawer__panel [data-autofocus]", drawer) || $(".drawer__panel button", drawer);
  focusTarget?.focus();
};

export const closeDrawer = (id) => {
  const drawer = document.getElementById(id);
  if (!drawer || drawer.hidden) return;
  drawer.classList.remove("is-open");
  document.body.classList.remove("is-locked");
  const finish = () => {
    drawer.hidden = true;
  };
  setTimeout(finish, 240);
  lastFocused?.focus?.();
};

const syncCartCount = () => {
  const count = cartCount();
  $$("[data-cart-count]").forEach((el) => {
    el.textContent = String(count);
    el.hidden = count === 0;
  });
};

const bump = () => {
  const btn = $(".cart-btn");
  if (!btn) return;
  btn.classList.remove("is-bump");
  requestAnimationFrame(() => btn.classList.add("is-bump"));
};

export const renderChrome = () => {
  mount("#site-header", headerHtml());
  mount("#site-footer", footerHtml());
  syncCartCount();

  if (PREVIEW_MODE && localStorage.getItem("bb:preview-dismissed") === "1") {
    $("#preview-bar")?.remove();
  }

  const header = $("#header");
  const onScroll = () => header?.classList.toggle("is-stuck", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
};

export const bindChrome = () => {
  document.addEventListener("click", (event) => {
    const target = event.target;

    if (target.closest("[data-nav-open]")) {
      $("[data-nav-open]")?.setAttribute("aria-expanded", "true");
      openDrawer("nav-drawer");
    }
    if (target.closest("[data-nav-close]")) {
      $("[data-nav-open]")?.setAttribute("aria-expanded", "false");
      closeDrawer("nav-drawer");
    }
    if (target.closest("[data-preview-dismiss]")) {
      localStorage.setItem("bb:preview-dismissed", "1");
      $("#preview-bar")?.remove();
    }

    const marketToggle = target.closest("[data-market-toggle]");
    const panel = $("#market-panel");
    if (marketToggle && panel) {
      const open = panel.hidden;
      panel.hidden = !open;
      marketToggle.setAttribute("aria-expanded", String(open));
    } else if (panel && !panel.hidden && !target.closest(".market")) {
      panel.hidden = true;
      $("[data-market-toggle]")?.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (target.matches("[data-market]")) setMarket(target.value);
    if (target.matches("[data-lang]")) setLanguage(target.value);
    if (target.matches("[data-currency]")) setCurrency(target.value);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      $$(".drawer:not([hidden])").forEach((d) => closeDrawer(d.id));
      const panel = $("#market-panel");
      if (panel && !panel.hidden) panel.hidden = true;
    }
    if (event.key === "Tab") {
      const openPanel = $(".drawer:not([hidden]) .drawer__panel");
      if (openPanel) trapFocus(openPanel, event);
    }
  });

  subscribe((_, reason) => {
    syncCartCount();
    if (reason === "add") bump();
  });
};
