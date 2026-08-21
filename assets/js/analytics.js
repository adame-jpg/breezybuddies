/**
 * One funnel, one event each. Every platform reads from the same call so a
 * pixel can be switched on later without re-instrumenting the storefront.
 *
 * Tag IDs live in config.js. With no IDs set this only fills window.dataLayer
 * and (in preview) logs to the console.
 */
import { ANALYTICS, PREVIEW_MODE } from "./config.js";

const META_MAP = {
  view_item: "ViewContent",
  add_to_cart: "AddToCart",
  view_cart: "ViewCart",
  begin_checkout: "InitiateCheckout",
  purchase: "Purchase",
  select_item: null,
  join_newsletter: "Lead",
};

const TIKTOK_MAP = {
  view_item: "ViewContent",
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
  purchase: "CompletePayment",
  view_cart: null,
  select_item: null,
  join_newsletter: "Subscribe",
};

/** Events that must only ever fire once per page view. */
const ONCE = new Set(["view_item", "purchase"]);
const fired = new Set();

window.dataLayer = window.dataLayer || [];

export const track = (event, payload = {}) => {
  if (ONCE.has(event)) {
    if (fired.has(event)) return;
    fired.add(event);
  }

  window.dataLayer.push({ event, ...payload });

  if (ANALYTICS.ga4 && typeof window.gtag === "function") {
    window.gtag("event", event, payload);
  }
  if (ANALYTICS.metaPixel && typeof window.fbq === "function" && META_MAP[event]) {
    window.fbq("track", META_MAP[event], payload);
  }
  if (ANALYTICS.tiktokPixel && typeof window.ttq === "object" && TIKTOK_MAP[event]) {
    window.ttq.track(TIKTOK_MAP[event], payload);
  }
  if (ANALYTICS.pinterestTag && typeof window.pintrk === "function") {
    window.pintrk("track", event, payload);
  }

  if (ANALYTICS.debug || PREVIEW_MODE) {
    console.info("[analytics]", event, payload);
  }
};

export const itemPayload = (buddy, price, quantity = 1) => ({
  currency: "EUR",
  value: Math.round(price * quantity * 100) / 100,
  items: [
    {
      item_id: buddy.id,
      item_name: buddy.name,
      item_variant: buddy.supplierVariant,
      item_category: "BreezyBuddy",
      price,
      quantity,
    },
  ],
});
