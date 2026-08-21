/** Boots a page, then repaints it whenever market, language or currency change. */
import { BRAND, POLICY, PREVIEW_MODE } from "./config.js";
import { BUDDIES, IS_SAMPLE_REVIEWS, REVIEWS, UNIT_PRICE, buddyById, reviewAverage } from "./catalog.js";
import { applyI18n, t } from "./i18n.js";
import { addToCart, subscribe } from "./store.js";
import { $, asset, observeReveal } from "./ui.js";
import { bindChrome, openDrawer, renderChrome } from "./chrome.js";
import { mountCart } from "./cart.js";
import { itemPayload, track } from "./analytics.js";
import {
  faqSchema,
  renderBundles,
  renderFaq,
  renderFeatures,
  renderHow,
  renderReviews,
  renderShop,
  renderSocial,
  renderTrust,
  renderUgc,
} from "./sections.js";
import { initPdp, renderExplainer, renderSpecs } from "./pdp.js";

const page = document.body.dataset.page || "static";

const setMeta = () => {
  const titleKey = page === "product" ? "meta.product.title" : "meta.home.title";
  const descKey = page === "product" ? "meta.product.desc" : "meta.home.desc";
  if (page === "home" || page === "product") {
    document.title = t(titleKey);
    $('meta[name="description"]')?.setAttribute("content", t(descKey));
    $('meta[property="og:title"]')?.setAttribute("content", t(titleKey));
    $('meta[property="og:description"]')?.setAttribute("content", t(descKey));
  }
};

const injectJsonLd = (id, data) => {
  let node = document.getElementById(id);
  if (!node) {
    node = document.createElement("script");
    node.type = "application/ld+json";
    node.id = id;
    document.head.appendChild(node);
  }
  node.textContent = JSON.stringify(data);
};

const productSchema = () => {
  const url = `https://${BRAND.domain}/product.html`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `BreezyBuddy™`,
    description: t("meta.product.desc"),
    brand: { "@type": "Brand", name: BRAND.name },
    image: BUDDIES.map((b) => `https://${BRAND.domain}/${b.image}.jpg`),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: UNIT_PRICE.toFixed(2),
      highPrice: (UNIT_PRICE * 3).toFixed(2),
      offerCount: BUDDIES.length,
      availability: "https://schema.org/InStock",
      url,
    },
    // Ratings are deliberately omitted while the reviews on the page are samples.
    ...(IS_SAMPLE_REVIEWS
      ? {}
      : {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: reviewAverage(),
            reviewCount: REVIEWS.length,
          },
        }),
  };
};

const organisationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: BRAND.name,
  url: `https://${BRAND.domain}`,
  email: BRAND.supportEmail,
  sameAs: Object.values(BRAND.social),
});

const paintHome = () => {
  $("#shop").innerHTML = renderShop();
  $("#how").innerHTML = renderHow();
  $("#features").innerHTML = renderFeatures();
  $("#ugc").innerHTML = renderUgc();
  $("#bundles").innerHTML = renderBundles();
  $("#reviews").innerHTML = renderReviews();
  $("#social").innerHTML = renderSocial();
  $("#faq").innerHTML = renderFaq();
  $("#trust").innerHTML = renderTrust();
  injectJsonLd("ld-faq", faqSchema());
  injectJsonLd("ld-org", organisationSchema());
};

const paintProduct = () => {
  $("#explainer").innerHTML = renderExplainer();
  $("#specs").innerHTML = renderSpecs();
  $("#faq").innerHTML = renderFaq();
  $("#trust").innerHTML = renderTrust();
  injectJsonLd("ld-product", productSchema());
  injectJsonLd("ld-faq", faqSchema());
};

const paintFaqPage = () => {
  $("#faq").innerHTML = renderFaq();
  $("#trust").innerHTML = renderTrust();
  injectJsonLd("ld-faq", faqSchema());
};

const paintStatic = () => {
  const days = $("[data-returns-days]");
  if (days) days.textContent = String(POLICY.returnsDays);
  const eu = $("[data-ship-eu]");
  if (eu) eu.textContent = `${POLICY.shipping.eu.min}–${POLICY.shipping.eu.max}`;
  const row = $("[data-ship-row]");
  if (row) row.textContent = `${POLICY.shipping.row.min}–${POLICY.shipping.row.max}`;
};

let pdp = null;

const paint = () => {
  renderChrome();
  setMeta();
  applyI18n();
  if (page === "home") paintHome();
  if (page === "faq") paintFaqPage();
  if (page === "product") {
    paintProduct();
    pdp?.paint();
  }
  paintStatic();
  observeReveal();
};

const bindGlobal = () => {
  document.addEventListener("click", (event) => {
    const add = event.target.closest("[data-add-buddy]");
    if (add) {
      const buddy = buddyById(add.dataset.addBuddy);
      addToCart(buddy.id, 1);
      track("add_to_cart", itemPayload(buddy, UNIT_PRICE, 1));
      openDrawer("cart-drawer");
    }
  });

  document.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-newsletter]");
    if (!form) return;
    event.preventDefault();
    track("join_newsletter", { method: "footer_form" });
    form.classList.add("is-done");
    const note = form.querySelector("[data-newsletter-done]");
    if (note) {
      note.textContent = t("news.done");
      note.hidden = false;
    }
    form.querySelector("input")?.setAttribute("disabled", "true");
  });
};

const boot = () => {
  paint();
  bindChrome();
  mountCart();
  bindGlobal();
  if (page === "product") {
    pdp = initPdp();
  }
  subscribe((_, reason) => {
    if (reason === "market" || reason === "lang" || reason === "currency") paint();
  });
  if (PREVIEW_MODE) {
    console.info(
      `[${BRAND.name}] preview mode — sample pricing, checkout disabled. See pages/launch-checklist.html`
    );
  }
};

boot();
