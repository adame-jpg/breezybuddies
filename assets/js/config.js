/**
 * Single source of truth for everything that is a business decision rather
 * than a design decision. Anything marked TODO must be replaced with real
 * information before this store takes a real order.
 */

export const BRAND = {
  name: "BreezyBuddies",
  // The attached logo mock used "Cool Critter Club". Swap these two lines to
  // flip the whole storefront over to that name.
  legalName: "TODO — registered company name",
  domain: "breezybuddies.com",
  supportEmail: "hello@breezybuddies.com",
  address: "TODO — registered business address (required for EU consumer law)",
  vat: "TODO — VAT / company number",
  social: {
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/",
    pinterest: "https://pinterest.com/",
  },
};

/**
 * Preview mode keeps the demo honest: it shows a banner, blocks checkout and
 * labels sample data. Set to false only once real payments are wired up.
 */
export const PREVIEW_MODE = true;

export const POLICY = {
  // Shipping windows per region, in business days. Update once the fulfilment
  // partner confirms real lead times.
  shipping: {
    eu: { min: 6, max: 12 },
    uk: { min: 7, max: 14 },
    us: { min: 7, max: 14 },
    ca: { min: 8, max: 16 },
    au: { min: 8, max: 16 },
    row: { min: 10, max: 20 },
  },
  freeShippingFromUnits: 2,
  returnsDays: 30,
  returnsConfirmed: true, // set by us, not by the supplier
  warrantyMonths: null, // TODO — confirm with supplier
};

/**
 * Product claims. `value: null` means "not verified yet" and the UI will show
 * a neutral "still being confirmed" state instead of inventing a number.
 */
export const CLAIMS = {
  usbRechargeable: {
    value: true,
    note: "Supplier listing states USB charging.",
  },
  batteryMinutes: {
    value: null,
    note: "TODO — measure on a sample unit before publishing a runtime.",
  },
  waterResistance: {
    value: null,
    note: "TODO — no IP rating supplied. Do not claim waterproof.",
  },
  dishwasherSafe: {
    value: false,
    note: "Electronics inside — never claim dishwasher safe.",
  },
  materialSafety: {
    value: null,
    note: "TODO — request BPA / EN71 / CE documentation from supplier.",
  },
  minAge: {
    value: null,
    note: "TODO — depends on CE/EN71 toy certification. Until then: adult supervision copy only.",
  },
  heightMm: {
    value: null,
    note: "TODO — measure a sample. Roughly palm-sized in supplier photos.",
  },
};

export const CURRENCIES = {
  EUR: { symbol: "€", locale: "nl-NL", rate: 1 },
  USD: { symbol: "$", locale: "en-US", rate: 1.09 },
  GBP: { symbol: "£", locale: "en-GB", rate: 0.85 },
  CAD: { symbol: "CA$", locale: "en-CA", rate: 1.48 },
  AUD: { symbol: "A$", locale: "en-AU", rate: 1.64 },
};

/**
 * The rates above are placeholders for the preview only. A live store must
 * take prices from the commerce platform (Shopify Markets / WooCommerce
 * multi-currency) instead of converting client-side.
 */
export const RATES_ARE_PLACEHOLDER = true;

export const MARKETS = [
  { code: "NL", label: "Nederland", currency: "EUR", lang: "nl", zone: "eu" },
  { code: "BE", label: "België", currency: "EUR", lang: "nl", zone: "eu" },
  { code: "DE", label: "Deutschland", currency: "EUR", lang: "de", zone: "eu" },
  { code: "FR", label: "France", currency: "EUR", lang: "fr", zone: "eu" },
  { code: "ES", label: "España", currency: "EUR", lang: "es", zone: "eu" },
  { code: "GB", label: "United Kingdom", currency: "GBP", lang: "en", zone: "uk" },
  { code: "US", label: "United States", currency: "USD", lang: "en", zone: "us" },
  { code: "CA", label: "Canada", currency: "CAD", lang: "en", zone: "ca" },
  { code: "AU", label: "Australia", currency: "AUD", lang: "en", zone: "au" },
];

export const DEFAULT_MARKET = "NL";

/** Empty string = tag not installed. No fake IDs, no silent double firing. */
export const ANALYTICS = {
  ga4: "",
  googleAds: "",
  metaPixel: "",
  tiktokPixel: "",
  pinterestTag: "",
  debug: PREVIEW_MODE,
};
