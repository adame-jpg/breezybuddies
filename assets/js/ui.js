/** Small DOM/markup helpers shared by every component. */

/** Policy pages live one level down, so links and assets need a prefix. */
export const BASE = /\/pages\//.test(window.location.pathname) ? "../" : "";
export const asset = (path) => `${BASE}${path}`;

export const escape = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

export const mount = (selector, html) => {
  const node = $(selector);
  if (node) node.innerHTML = html;
  return node;
};

/**
 * Responsive <picture>. The widest entry in `widths` is the unsuffixed file
 * (see tools/build-images.py), the rest are `-<width>` variants.
 */
export const picture = ({
  src,
  alt,
  widths = [],
  sizes = "100vw",
  width,
  height,
  className = "",
  loading = "lazy",
  priority = false,
}) => {
  const widest = Math.max(...widths);
  const srcset = (ext) =>
    widths
      .map((w) => `${src}${w === widest ? "" : `-${w}`}.${ext} ${w}w`)
      .join(", ");
  const attrs = [
    `src="${src}.jpg"`,
    `alt="${escape(alt)}"`,
    width ? `width="${width}"` : "",
    height ? `height="${height}"` : "",
    className ? `class="${className}"` : "",
    priority ? 'fetchpriority="high" decoding="sync"' : `loading="${loading}" decoding="async"`,
  ]
    .filter(Boolean)
    .join(" ");

  return `<picture>
      <source type="image/webp" srcset="${srcset("webp")}" sizes="${sizes}">
      <source type="image/jpeg" srcset="${srcset("jpg")}" sizes="${sizes}">
      <img ${attrs}>
    </picture>`;
};

const ICONS = {
  clip: '<path d="M8 13V7a4 4 0 0 1 8 0v8a6 6 0 0 1-12 0V9"/>',
  aim: '<circle cx="12" cy="12" r="7"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
  breeze: '<path d="M4 9h9a3 3 0 1 0-3-3M4 15h12a3 3 0 1 1-3 3"/>',
  usb: '<rect x="3" y="8" width="15" height="9" rx="2.5"/><path d="M20 11.5v2.4"/><path d="m10.6 10.2-1.9 3h2.6l-1.4 2.6" stroke-width="1.5"/>',
  heart: '<path d="M12 20s-7-4.4-7-9.2A4 4 0 0 1 12 8a4 4 0 0 1 7 2.8C19 15.6 12 20 12 20z"/>',
  gift: '<rect x="4" y="9" width="16" height="11" rx="2"/><path d="M4 13h16M12 9v11"/><path d="M12 9S10.5 4 8 5.5 12 9 12 9zM12 9s1.5-5 4-3.5S12 9 12 9z"/>',
  star: '<path d="m12 4 2.4 5 5.6.7-4 3.9 1 5.4-5-2.7-5 2.7 1-5.4-4-3.9 5.6-.7z" fill="currentColor" stroke="none"/>',
  cart: '<path d="M5 7h14l-1.3 10.2a2 2 0 0 1-2 1.8H8.3a2 2 0 0 1-2-1.8z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  check: '<path d="m5 13 4 4 10-10"/>',
  truck: '<path d="M3 7h11v9H3zM14 11h4l3 3v2h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  chat: '<path d="M20 12a7 7 0 0 1-7 7H9l-4 3v-4.6A7 7 0 0 1 13 5a7 7 0 0 1 7 7z"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v4h-4"/>',
  arrow: '<path d="M5 12h13M13 6l6 6-6 6"/>',
  play: '<path d="M9 6l9 6-9 6z" fill="currentColor" stroke="none"/>',
  instagram:
    '<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.4"/><circle cx="16.8" cy="7.2" r="1" fill="currentColor" stroke="none"/>',
  tiktok:
    '<path d="M14 4v9.2a3.2 3.2 0 1 1-2.6-3.14"/><path d="M14 4c.4 2.2 1.9 3.6 4 3.8"/>',
  pinterest: '<path d="M12 20c4.4 0 8-3.6 8-8s-3.6-8-8-8-8 3.6-8 8c0 3.2 1.9 6 4.6 7.3"/><path d="M10 20l2.4-8"/><path d="M9.6 13.4c-.6-1.6.2-3.6 2.2-4 1.8-.4 3.4.7 3.4 2.6 0 2-1.2 3.6-2.8 3.6-1 0-1.7-.7-1.5-1.6"/>',
};

export const icon = (name, size = 24) =>
  `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"
     aria-hidden="true" focusable="false">${ICONS[name] || ""}</svg>`;

export const stars = (rating, size = 15) =>
  `<span class="stars" role="img" aria-label="${rating} / 5">${Array.from(
    { length: 5 },
    (_, i) => `<span class="star${i < Math.round(rating) ? " is-on" : ""}">${icon("star", size)}</span>`
  ).join("")}</span>`;

/** The wordmark is drawn, not an image file, so it stays crisp everywhere. */
export const logo = (brand, { compact = false } = {}) => `
  <span class="logo${compact ? " logo--compact" : ""}">
    <span class="logo__mark" aria-hidden="true">
      <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <circle cx="20" cy="20" r="19" fill="var(--mint-soft)"/>
        <path d="M9 16h11a4 4 0 1 0-4-4" stroke="var(--coral)" stroke-width="2.6"
              stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9 24h14a4 4 0 1 1-4 4" stroke="var(--coral)" stroke-width="2.6"
              stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="29" cy="13" r="2.4" fill="var(--yellow)"/>
      </svg>
    </span>
    <span class="logo__text">${escape(brand)}</span>
  </span>`;

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Fires once when an element scrolls into view — used for reveal animations. */
export const observeReveal = (root = document) => {
  const targets = $$("[data-reveal]", root);
  if (!targets.length) return;
  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -40px 0px", threshold: 0 }
  );
  targets.forEach((el) => io.observe(el));
};
