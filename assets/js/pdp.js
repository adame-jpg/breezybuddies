/** Product page: gallery, character slots, bundle selector, sticky add-to-cart. */
import { CLAIMS, POLICY } from "./config.js";
import {
  BUDDIES,
  BUNDLES,
  GALLERY,
  UNIT_PRICE,
  buddyById,
  bundleById,
} from "./catalog.js";
import { t } from "./i18n.js";
import { addMany, discountFor, money } from "./store.js";
import { $, $$, asset, escape, icon, mount, picture } from "./ui.js";
import { itemPayload, track } from "./analytics.js";
import { openDrawer } from "./chrome.js";

const params = new URLSearchParams(window.location.search);

export const pdpState = {
  bundleId: BUNDLES.some((b) => b.id === params.get("bundle")) ? params.get("bundle") : "single",
  sets: 1,
  slots: [],
  slide: 0,
};

const initialBuddy = () => {
  const wanted = params.get("buddy");
  return BUDDIES.some((b) => b.id === wanted) ? wanted : BUDDIES[0].id;
};

const syncSlots = () => {
  const units = bundleById(pdpState.bundleId).units;
  const first = pdpState.slots[0] || initialBuddy();
  const next = [];
  for (let i = 0; i < units; i += 1) {
    next.push(pdpState.slots[i] || (i === 0 ? first : BUDDIES[i % BUDDIES.length].id));
  }
  pdpState.slots = next;
};

const totals = () => {
  const units = bundleById(pdpState.bundleId).units * pdpState.sets;
  const list = units * UNIT_PRICE;
  const discount = discountFor(units);
  const total = Math.round(list * (1 - discount) * 100) / 100;
  return { units, list: Math.round(list * 100) / 100, total, saved: Math.round((list - total) * 100) / 100 };
};

/* ---------------------------------------------------------------- gallery */

const galleryImages = () => {
  const hero = buddyById(pdpState.slots[0]);
  return [
    { src: hero.image, caption: `${hero.name} — ${t(hero.animalKey)}`, widths: [450, 900], ratio: "1/1" },
    ...GALLERY.map((g) => ({
      src: g.src,
      caption: t(g.captionKey),
      widths: g.src.includes("/ugc/") ? [420, 720] : [500, 1000],
      ratio: g.ratio,
    })),
  ];
};

const renderGallery = () => {
  const images = galleryImages();
  return `
    <div class="gal">
      <div class="gal__stage" data-gal-track>
        ${images
          .map(
            (img, i) => `
          <figure class="gal__slide" data-gal-slide="${i}" style="--ratio:${img.ratio}">
            ${picture({
              src: asset(img.src),
              alt: img.caption,
              widths: img.widths,
              sizes: "(min-width: 1000px) 620px, 100vw",
              priority: i === 0,
            })}
          </figure>`
          )
          .join("")}
      </div>
      <button type="button" class="gal__arrow gal__arrow--prev" data-gal-prev
              aria-label="${t("a11y.prev")}">${icon("chevron", 20)}</button>
      <button type="button" class="gal__arrow gal__arrow--next" data-gal-next
              aria-label="${t("a11y.next")}">${icon("chevron", 20)}</button>
      <div class="gal__thumbs" role="tablist">
        ${images
          .map(
            (img, i) => `
          <button type="button" class="gal__thumb${i === 0 ? " is-on" : ""}" data-gal-go="${i}"
                  role="tab" aria-selected="${i === 0}" aria-label="${escape(img.caption)}">
            ${picture({
              src: asset(img.src),
              alt: "",
              widths: [img.widths[0]],
              sizes: "56px",
              width: 56,
              height: 56,
            })}
          </button>`
          )
          .join("")}
      </div>
    </div>`;
};

/* ------------------------------------------------------------------ forms */

const slotRow = (slotIndex) => `
  <div class="slot">
    ${
      pdpState.slots.length > 1
        ? `<span class="slot__label">${t("pdp.pickBuddy").replace(/^\d+ · /, "")} ${slotIndex + 1}</span>`
        : ""
    }
    <div class="swatches" role="radiogroup"
         aria-label="${t("pdp.pickBuddy")}${pdpState.slots.length > 1 ? ` ${slotIndex + 1}` : ""}">
      ${BUDDIES.map(
        (buddy) => `
        <button type="button" class="swatch${pdpState.slots[slotIndex] === buddy.id ? " is-on" : ""}"
                style="--accent:${buddy.accent};--accent-soft:${buddy.accentSoft}"
                role="radio" aria-checked="${pdpState.slots[slotIndex] === buddy.id}"
                data-slot="${slotIndex}" data-buddy="${buddy.id}" title="${escape(buddy.name)}">
          ${picture({
            src: asset(buddy.image),
            alt: buddy.name,
            widths: [450],
            sizes: "64px",
            width: 64,
            height: 64,
          })}
        </button>`
      ).join("")}
    </div>
  </div>`;

const renderForm = () => {
  const money$ = totals();
  const bundle = bundleById(pdpState.bundleId);
  return `
    <p class="pdp__eyebrow">${t("hero.eyebrow")}</p>
    <h1 class="pdp__title">${t("pdp.name")}</h1>
    <p class="pdp__sub">${t("pdp.sub")}</p>

    <div class="pdp__price">
      <strong>${money(money$.total)}</strong>
      ${money$.saved > 0 ? `<span class="strike">${money(money$.list)}</span>` : ""}
      ${
        money$.saved > 0
          ? `<span class="pill pill--save">${t("bundle.save", { amount: money(money$.saved) })}</span>`
          : ""
      }
    </div>

    <ul class="pdp__benefits">
      ${[1, 2, 3, 4]
        .map((n) => `<li>${icon("check", 16)}<span>${t(`pdp.benefit${n}`)}</span></li>`)
        .join("")}
    </ul>

    <fieldset class="pdp__group">
      <legend>${t("pdp.pickBuddy")}</legend>
      <p class="pdp__chosen">${pdpState.slots.map((id) => escape(buddyById(id).name)).join(" · ")}</p>
      ${pdpState.slots.map((_, i) => slotRow(i)).join("")}
    </fieldset>

    <fieldset class="pdp__group">
      <legend>${t("pdp.pickBundle")}</legend>
      <div class="bundle-picker">
        ${BUNDLES.map((b) => {
          const price = Math.round(UNIT_PRICE * b.units * (1 - b.discount) * 100) / 100;
          return `
          <button type="button" class="bpick${b.id === pdpState.bundleId ? " is-on" : ""}"
                  data-bundle="${b.id}" aria-pressed="${b.id === pdpState.bundleId}">
            ${b.tagKey ? `<span class="bpick__tag">${t(b.tagKey)}</span>` : ""}
            <span class="bpick__units">${t(b.labelKey)}</span>
            <span class="bpick__sub">${t(b.subKey)}</span>
            <span class="bpick__price">${money(price)}</span>
            ${
              b.discount > 0
                ? `<span class="bpick__each">${t("bundle.each", {
                    price: money(price / b.units),
                  })}</span>`
                : ""
            }
          </button>`;
        }).join("")}
      </div>
    </fieldset>

    <div class="pdp__buy">
      <div class="qty qty--lg" role="group" aria-label="${t("pdp.qty")}">
        <button type="button" data-sets-down aria-label="−">−</button>
        <span aria-live="polite">${pdpState.sets}</span>
        <button type="button" data-sets-up aria-label="+">+</button>
      </div>
      <button type="button" class="btn btn--primary btn--lg btn--grow" data-pdp-add>
        ${t("pdp.add")} · ${money(money$.total)}
      </button>
    </div>

    <p class="pdp__ship">${icon("truck", 16)} ${t("pdp.shipping", {
      eu: `${POLICY.shipping.eu.min}–${POLICY.shipping.eu.max}`,
    })}</p>
    <p class="pdp__note">${escape(bundle.units > 1 ? t("cart.cross") : "")}</p>`;
};

/* ------------------------------------------------------------- explainer */

const marker = (x, y, n) => `
  <g>
    <circle cx="${x}" cy="${y}" r="11" fill="var(--ink)"/>
    <text x="${x}" y="${y + 4}" text-anchor="middle" font-size="12" font-weight="800"
          fill="#fff">${n}</text>
  </g>`;

export const renderExplainer = () => `
  <div class="wrap">
    <div class="explain">
      <div class="explain__copy">
        <p class="sec-eyebrow">${t("pdp.explain.eyebrow")}</p>
        <h2 class="sec-title">${t("pdp.explain.title")}</h2>
        <p class="explain__body">${t("pdp.explain.body")}</p>
      </div>
      <figure class="explain__figure">
        <svg viewBox="0 0 320 214" role="img" aria-label="${t("pdp.explain.body")}">
          <ellipse cx="150" cy="192" rx="112" ry="10" fill="var(--warm)"/>

          <path d="M78 84h96v76a20 20 0 0 1-20 20H98a20 20 0 0 1-20-20z"
                fill="var(--white)" stroke="var(--line-strong)" stroke-width="3"/>
          <path d="M78 106H62a19 19 0 0 0 0 38h16" fill="none"
                stroke="var(--line-strong)" stroke-width="3"/>
          <ellipse cx="126" cy="84" rx="48" ry="11" fill="var(--coral-soft)"
                   stroke="var(--line-strong)" stroke-width="3"/>

          <g fill="var(--mint)" stroke="var(--white)" stroke-width="2">
            <ellipse cx="190" cy="58" rx="9" ry="12" transform="rotate(-20 190 58)"/>
            <ellipse cx="226" cy="58" rx="9" ry="12" transform="rotate(20 226 58)"/>
            <rect x="184" y="88" width="48" height="62" rx="22"/>
            <circle cx="208" cy="78" r="27"/>
            <rect x="158" y="76" width="36" height="13" rx="6.5"/>
            <ellipse cx="184" cy="82" rx="9" ry="7"/>
          </g>
          <circle cx="180" cy="82" r="2.6" fill="var(--ink)" opacity=".35"/>

          <g stroke="var(--mint)" stroke-width="3" stroke-linecap="round" fill="none" opacity=".8">
            <path d="M172 88c-12 5-22 10-30 15"/>
            <path d="M174 96c-14 3-24 7-32 12"/>
          </g>

          ${marker(246, 128, 3)}
          ${marker(176, 52, 2)}
          ${marker(104, 84, 1)}
        </svg>
        <figcaption class="explain__legend">
          <ol>
            <li><span>1</span>${t("pdp.diagram.drink")}</li>
            <li><span>2</span>${t("pdp.diagram.rim")}</li>
            <li><span>3</span>${t("pdp.diagram.body")}</li>
          </ol>
        </figcaption>
      </figure>
    </div>
  </div>`;

/* ------------------------------------------------------------------ specs */

const SPEC_ROWS = [
  { key: "faq.rechargeable.q", claim: "usbRechargeable", yes: "feature.charging.body" },
  { key: "faq.battery.q", claim: "batteryMinutes" },
  { key: "faq.waterproof.q", claim: "waterResistance" },
  { key: "faq.ages.q", claim: "minAge" },
];

export const renderSpecs = () => `
  <div class="wrap wrap--narrow">
    <h2 class="sec-title sec-title--sm">${t("pdp.spec.title")}</h2>
    <dl class="specs">
      ${SPEC_ROWS.map((row) => {
        const claim = CLAIMS[row.claim];
        const known = claim && claim.value !== null && claim.value !== undefined;
        return `
        <div class="specs__row">
          <dt>${t(row.key)}</dt>
          <dd>${
            known && row.yes
              ? t(row.yes)
              : `<span class="pill pill--pending">${t("pdp.spec.pending")}</span>`
          }</dd>
        </div>`;
      }).join("")}
      <div class="specs__row">
        <dt>${t("faq.clean.q")}</dt>
        <dd>${t("faq.clean.a")}</dd>
      </div>
    </dl>
  </div>`;

/* ------------------------------------------------------------------- wire */

const paint = () => {
  syncSlots();
  mount("#pdp-gallery", renderGallery());
  mount("#pdp-form", renderForm());
  const sticky = $("#sticky-atc");
  if (sticky) {
    const money$ = totals();
    sticky.innerHTML = `
      <div class="sticky__info">
        <strong>${money(money$.total)}</strong>
        <span>${pdpState.slots.map((id) => buddyById(id).name).join(" · ")}</span>
      </div>
      <button type="button" class="btn btn--primary" data-pdp-add>${t("pdp.add")}</button>`;
  }
  goTo(0, false);
};

const goTo = (index, smooth = true) => {
  const stage = $("[data-gal-track]");
  if (!stage) return;
  const slides = $$("[data-gal-slide]", stage);
  const clamped = Math.max(0, Math.min(slides.length - 1, index));
  pdpState.slide = clamped;
  stage.scrollTo({
    left: slides[clamped].offsetLeft - stage.offsetLeft,
    behavior: smooth ? "smooth" : "auto",
  });
  $$("[data-gal-go]").forEach((btn, i) => {
    btn.classList.toggle("is-on", i === clamped);
    btn.setAttribute("aria-selected", String(i === clamped));
  });
};

const addSelection = () => {
  const ids = [];
  for (let s = 0; s < pdpState.sets; s += 1) ids.push(...pdpState.slots);
  addMany(ids);
  const first = buddyById(pdpState.slots[0]);
  track("add_to_cart", itemPayload(first, UNIT_PRICE, ids.length));
  openDrawer("cart-drawer");
};

export const initPdp = () => {
  syncSlots();
  paint();

  const first = buddyById(pdpState.slots[0]);
  track("view_item", itemPayload(first, UNIT_PRICE, 1));

  document.addEventListener("click", (event) => {
    const target = event.target;

    const swatch = target.closest("[data-buddy][data-slot]");
    if (swatch) {
      pdpState.slots[Number(swatch.dataset.slot)] = swatch.dataset.buddy;
      const buddy = buddyById(swatch.dataset.buddy);
      track("select_item", itemPayload(buddy, UNIT_PRICE, 1));
      paint();
    }

    const bundle = target.closest("[data-bundle]");
    if (bundle) {
      pdpState.bundleId = bundle.dataset.bundle;
      paint();
    }

    if (target.closest("[data-sets-up]")) {
      pdpState.sets = Math.min(5, pdpState.sets + 1);
      paint();
    }
    if (target.closest("[data-sets-down]")) {
      pdpState.sets = Math.max(1, pdpState.sets - 1);
      paint();
    }

    if (target.closest("[data-pdp-add]")) addSelection();

    if (target.closest("[data-gal-prev]")) goTo(pdpState.slide - 1);
    if (target.closest("[data-gal-next]")) goTo(pdpState.slide + 1);
    const thumb = target.closest("[data-gal-go]");
    if (thumb) goTo(Number(thumb.dataset.galGo));
  });

  const stickyBar = $("#sticky-atc");
  const anchor = $("#pdp-form");
  if (stickyBar && anchor && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      ([entry]) => stickyBar.classList.toggle("is-on", !entry.isIntersecting),
      { rootMargin: "-120px 0px 0px 0px" }
    );
    io.observe(anchor);
  }

  return { paint };
};
