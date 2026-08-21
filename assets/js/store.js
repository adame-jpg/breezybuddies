/**
 * Client-side state: market (country/language/currency) and basket.
 * Persisted in localStorage so the preview survives a refresh.
 */
import { CURRENCIES, DEFAULT_MARKET, MARKETS, POLICY } from "./config.js";
import { BUNDLES, UNIT_PRICE, buddyById } from "./catalog.js";
import { DEFAULT_LANG, DICTS, setLang } from "./i18n.js";

const KEY = "bb:state:v1";

const listeners = new Set();

const initial = {
  market: DEFAULT_MARKET,
  lang: DEFAULT_LANG,
  currency: "EUR",
  lines: [], // [{ buddyId, qty }]
};

const load = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!raw) return { ...initial };
    return {
      market: MARKETS.some((m) => m.code === raw.market) ? raw.market : initial.market,
      lang: DICTS[raw.lang] ? raw.lang : initial.lang,
      currency: CURRENCIES[raw.currency] ? raw.currency : initial.currency,
      lines: Array.isArray(raw.lines)
        ? raw.lines
            .filter((l) => l && typeof l.buddyId === "string")
            .map((l) => ({ buddyId: l.buddyId, qty: Math.max(1, Math.min(20, Number(l.qty) || 1)) }))
        : [],
    };
  } catch {
    return { ...initial };
  }
};

export const state = load();

const persist = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* private browsing — the preview still works, it just forgets */
  }
};

const emit = (reason) => {
  persist();
  listeners.forEach((fn) => fn(state, reason));
};

export const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

/* ---------------------------------------------------------------- market */

export const marketConfig = () => MARKETS.find((m) => m.code === state.market) || MARKETS[0];

export const setMarket = (code) => {
  const market = MARKETS.find((m) => m.code === code);
  if (!market) return;
  state.market = market.code;
  state.currency = market.currency;
  state.lang = setLang(market.lang);
  emit("market");
};

export const setLanguage = (code) => {
  state.lang = setLang(code);
  emit("lang");
};

export const setCurrency = (code) => {
  if (!CURRENCIES[code]) return;
  state.currency = code;
  emit("currency");
};

/* ------------------------------------------------------------------ money */

export const money = (amountEur) => {
  const { symbol, locale, rate } = CURRENCIES[state.currency];
  const value = amountEur * rate;
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${symbol}${formatted}`;
};

/* ----------------------------------------------------------------- basket */

/** Volume tiers come straight from the bundle table, so the maths always agree. */
const tiers = [...BUNDLES].sort((a, b) => b.units - a.units);

export const discountFor = (qty) => (tiers.find((tier) => qty >= tier.units) || { discount: 0 }).discount;

export const cartCount = () => state.lines.reduce((sum, l) => sum + l.qty, 0);

export const cartTotals = () => {
  const qty = cartCount();
  const list = qty * UNIT_PRICE;
  const discount = discountFor(qty);
  const total = Math.round(list * (1 - discount) * 100) / 100;
  return {
    qty,
    list: Math.round(list * 100) / 100,
    total,
    saved: Math.round((list - total) * 100) / 100,
    discount,
    freeShipping: qty >= POLICY.freeShippingFromUnits,
    unitsToFreeShipping: Math.max(0, POLICY.freeShippingFromUnits - qty),
  };
};

export const addToCart = (buddyId, qty = 1) => {
  const line = state.lines.find((l) => l.buddyId === buddyId);
  if (line) line.qty = Math.min(20, line.qty + qty);
  else state.lines.push({ buddyId, qty });
  emit("add");
};

export const addMany = (buddyIds) => {
  buddyIds.forEach((id) => {
    const line = state.lines.find((l) => l.buddyId === id);
    if (line) line.qty = Math.min(20, line.qty + 1);
    else state.lines.push({ buddyId: id, qty: 1 });
  });
  emit("add");
};

export const setQty = (buddyId, qty) => {
  const next = Math.max(0, Math.min(20, qty));
  const index = state.lines.findIndex((l) => l.buddyId === buddyId);
  if (index === -1) return;
  if (next === 0) state.lines.splice(index, 1);
  else state.lines[index].qty = next;
  emit("qty");
};

export const removeLine = (buddyId) => setQty(buddyId, 0);

/** A character that is not in the basket yet, for the cart cross-sell. */
export const suggestion = () => {
  const inCart = new Set(state.lines.map((l) => l.buddyId));
  const candidate = ["mochi", "dino-mint", "ellie", "biscuit", "coco", "dino-grape"].find(
    (id) => !inCart.has(id)
  );
  return candidate ? buddyById(candidate) : null;
};

setLang(state.lang);
