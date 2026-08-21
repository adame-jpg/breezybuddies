/**
 * Catalog data. Every buddy here maps to a real character variant that exists
 * in the supplier listing — nothing is invented. `supplierVariant` is the
 * label to match when the product is imported into Shopify/WooCommerce.
 */
import { CLAIMS } from "./config.js";

/** Base price in EUR. All other currencies are derived (preview only). */
export const UNIT_PRICE = 19.95;

/** No compare-at price is configured: we do not fake a struck-through price. */
export const UNIT_COMPARE_AT = null;

export const BUDDIES = [
  {
    id: "ellie",
    name: "Ellie Elephant",
    animalKey: "animal.elephant",
    supplierVariant: "Grey elephant",
    image: "assets/img/products/buddy-elephant",
    accent: "var(--mint)",
    accentSoft: "var(--mint-soft)",
    badgeKey: "badge.bestseller",
  },
  {
    id: "mochi",
    name: "Mochi Cat",
    animalKey: "animal.cat",
    supplierVariant: "White cat",
    image: "assets/img/products/buddy-cat",
    accent: "var(--yellow)",
    accentSoft: "var(--yellow-soft)",
    badgeKey: null,
  },
  {
    id: "coco",
    name: "Coco Pup",
    animalKey: "animal.dog",
    supplierVariant: "Orange dog / shiba",
    image: "assets/img/products/buddy-dog",
    accent: "#f5a54a",
    accentSoft: "#ffeed8",
    badgeKey: null,
  },
  {
    id: "dino-mint",
    name: "Dino Mint",
    animalKey: "animal.dino",
    supplierVariant: "Green dinosaur",
    image: "assets/img/products/buddy-dino-mint",
    accent: "var(--green)",
    accentSoft: "var(--green-soft)",
    badgeKey: null,
  },
  {
    id: "dino-grape",
    name: "Dino Grape",
    animalKey: "animal.dino",
    supplierVariant: "Purple dinosaur",
    image: "assets/img/products/buddy-dino-grape",
    accent: "var(--purple)",
    accentSoft: "var(--purple-soft)",
    badgeKey: "badge.new",
  },
  {
    id: "biscuit",
    name: "Biscuit Bear",
    animalKey: "animal.bear",
    supplierVariant: "Brown bear",
    image: "assets/img/products/buddy-bear",
    accent: "#c98b5e",
    accentSoft: "#f6e6d8",
    badgeKey: null,
  },
];

export const buddyById = (id) => BUDDIES.find((b) => b.id === id) || BUDDIES[0];

/**
 * Bundles are pure math on UNIT_PRICE — the "you save" figure is always real.
 */
export const BUNDLES = [
  { id: "single", units: 1, discount: 0, labelKey: "bundle.single", subKey: "bundle.single.sub" },
  {
    id: "duo",
    units: 2,
    discount: 0.125,
    labelKey: "bundle.duo",
    subKey: "bundle.duo.sub",
    tagKey: "bundle.popular",
  },
  {
    id: "family",
    units: 3,
    discount: 0.2,
    labelKey: "bundle.family",
    subKey: "bundle.family.sub",
    tagKey: "bundle.value",
  },
];

export const bundleById = (id) => BUNDLES.find((b) => b.id === id) || BUNDLES[0];

export const bundlePrice = (bundle) =>
  Math.round(UNIT_PRICE * bundle.units * (1 - bundle.discount) * 100) / 100;

export const bundleListPrice = (bundle) => Math.round(UNIT_PRICE * bundle.units * 100) / 100;

/** Product gallery. `caption` is an i18n key. */
export const GALLERY = [
  { src: "assets/img/products/on-mug", captionKey: "gallery.onMug", ratio: "1/1" },
  { src: "assets/img/ugc/hot-chocolate", captionKey: "gallery.child", ratio: "3/4" },
  { src: "assets/img/ugc/soup", captionKey: "gallery.soup", ratio: "3/4" },
  { src: "assets/img/products/detail-charging", captionKey: "gallery.charging", ratio: "1/1" },
  { src: "assets/img/lifestyle/family-tea", captionKey: "gallery.family", ratio: "4/3" },
];

export const HOW_IT_WORKS = [
  { id: "clip", icon: "clip", titleKey: "how.1.title", bodyKey: "how.1.body" },
  { id: "aim", icon: "aim", titleKey: "how.2.title", bodyKey: "how.2.body" },
  { id: "breeze", icon: "breeze", titleKey: "how.3.title", bodyKey: "how.3.body" },
];

/**
 * Only claims we can stand behind. Anything gated on an unverified CLAIM is
 * filtered out instead of being softened into marketing fluff.
 */
export const FEATURES = [
  { id: "airflow", icon: "breeze", titleKey: "feature.airflow.title", bodyKey: "feature.airflow.body", show: true },
  {
    id: "charging",
    icon: "usb",
    titleKey: "feature.charging.title",
    bodyKey: "feature.charging.body",
    show: CLAIMS.usbRechargeable.value === true,
  },
  { id: "collect", icon: "heart", titleKey: "feature.collect.title", bodyKey: "feature.collect.body", show: true },
  { id: "gift", icon: "gift", titleKey: "feature.gift.title", bodyKey: "feature.gift.body", show: true },
];

export const UGC = [
  { src: "assets/img/ugc/soup", titleKey: "ugc.soup", handle: "@sample_family" },
  { src: "assets/img/ugc/hot-chocolate", titleKey: "ugc.cocoa", handle: "@sample_family" },
  { src: "assets/img/ugc/breakfast", titleKey: "ugc.breakfast", handle: "@sample_family" },
];

/**
 * SAMPLE reviews. Written by us as layout placeholders, flagged so the UI can
 * label them. Replace with a real review app (Judge.me / Loox) before launch —
 * never publish these as if they were customer reviews.
 */
export const IS_SAMPLE_REVIEWS = true;

export const REVIEWS = [
  { id: 1, name: "Sanne", country: "NL", rating: 5, buddy: "ellie", bodyKey: "review.1", photo: "assets/img/ugc/hot-chocolate" },
  { id: 2, name: "Marc", country: "BE", rating: 5, buddy: "dino-mint", bodyKey: "review.2", photo: null },
  { id: 3, name: "Laura", country: "DE", rating: 4, buddy: "mochi", bodyKey: "review.3", photo: "assets/img/ugc/soup" },
  { id: 4, name: "Emma", country: "GB", rating: 5, buddy: "biscuit", bodyKey: "review.4", photo: null },
  { id: 5, name: "Nadia", country: "FR", rating: 5, buddy: "coco", bodyKey: "review.5", photo: "assets/img/ugc/breakfast" },
  { id: 6, name: "Tom", country: "US", rating: 4, buddy: "dino-grape", bodyKey: "review.6", photo: null },
];

export const reviewAverage = () =>
  Math.round((REVIEWS.reduce((sum, r) => sum + r.rating, 0) / REVIEWS.length) * 10) / 10;

/**
 * FAQ. `claim` points at a CLAIMS entry; when that claim is unverified the
 * answer falls back to an honest "we are confirming this" line.
 */
export const FAQ = [
  { id: "what" },
  { id: "attach" },
  { id: "vessels" },
  { id: "drinks" },
  { id: "rechargeable", claim: "usbRechargeable" },
  { id: "battery", claim: "batteryMinutes" },
  { id: "clean" },
  { id: "waterproof", claim: "waterResistance" },
  { id: "ages", claim: "minAge" },
  { id: "shipping" },
  { id: "returns" },
];
