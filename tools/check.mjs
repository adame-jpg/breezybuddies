/**
 * Pre-deploy sanity check: translation coverage, image variants that the
 * markup asks for, and internal links that actually resolve.
 *
 *   node tools/check.mjs
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const problems = [];
const fail = (message) => problems.push(message);

/* ------------------------------------------------------- translation keys */

const { DICTS, LANGS, DEFAULT_LANG } = await import("../assets/js/i18n.js");

const base = Object.keys(DICTS[DEFAULT_LANG]);
LANGS.forEach(({ code }) => {
  const dict = DICTS[code];
  if (!dict) return fail(`i18n: no dictionary for "${code}"`);
  const missing = base.filter((key) => !(key in dict));
  const extra = Object.keys(dict).filter((key) => !base.includes(key));
  if (missing.length) fail(`i18n[${code}]: missing ${missing.length} keys → ${missing.slice(0, 6).join(", ")}`);
  if (extra.length) fail(`i18n[${code}]: unknown keys → ${extra.slice(0, 6).join(", ")}`);
});

/* -------------------------------------------------------- catalog images */

const { BUDDIES, GALLERY, UGC, REVIEWS } = await import("../assets/js/catalog.js");

const imageStems = new Set([
  ...BUDDIES.map((b) => b.image),
  ...GALLERY.map((g) => g.src),
  ...UGC.map((u) => u.src),
  ...REVIEWS.map((r) => r.photo).filter(Boolean),
]);

imageStems.forEach((stem) => {
  ["webp", "jpg"].forEach((ext) => {
    if (!existsSync(join(root, `${stem}.${ext}`))) fail(`asset missing: ${stem}.${ext}`);
  });
});

/* ------------------------------------------------- html links and sources */

const htmlFiles = [];
const walk = (dir) => {
  readdirSync(dir).forEach((entry) => {
    if (["node_modules", ".git", ".screens", "reference", "assets", "tools"].includes(entry)) return;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (entry.endsWith(".html")) htmlFiles.push(full);
  });
};
walk(root);

const isExternal = (value) => /^(https?:|mailto:|tel:|#|data:)/.test(value);

htmlFiles.forEach((file) => {
  const html = readFileSync(file, "utf8");
  const dir = dirname(file);
  const rel = relative(root, file);

  [...html.matchAll(/(?:href|src)="([^"]+)"/g)].forEach(([, value]) => {
    if (isExternal(value)) return;
    const [path] = value.split("#");
    if (!path) return;
    if (!existsSync(resolve(dir, path))) fail(`${rel}: broken reference → ${value}`);
  });

  [...html.matchAll(/srcset="([^"]+)"/g)].forEach(([, value]) => {
    value.split(",").forEach((part) => {
      const url = part.trim().split(/\s+/)[0];
      if (!url || isExternal(url)) return;
      if (!existsSync(resolve(dir, url))) fail(`${rel}: broken srcset entry → ${url}`);
    });
  });

  if (!/name="description"/.test(html)) fail(`${rel}: no meta description`);
  if (!/<h1[ >]/.test(html) && !/id="pdp-form"/.test(html)) fail(`${rel}: no <h1>`);
});

/* -------------------------------------------------- image paths built in js */

const jsFiles = readdirSync(join(root, "assets/js")).filter((f) => f.endsWith(".js"));
jsFiles.forEach((name) => {
  const source = readFileSync(join(root, "assets/js", name), "utf8");
  [...source.matchAll(/"(assets\/img\/[^"]+)"/g)].forEach(([, stem]) => {
    if (/\.(webp|jpg|svg)$/.test(stem)) {
      if (!existsSync(join(root, stem))) fail(`assets/js/${name}: missing ${stem}`);
    } else if (!existsSync(join(root, `${stem}.webp`))) {
      fail(`assets/js/${name}: missing ${stem}.webp`);
    }
  });
});

/* ------------------------------------------------------------------ report */

if (problems.length) {
  console.error(`\n✖ ${problems.length} problem(s):\n`);
  problems.forEach((p) => console.error(`  - ${p}`));
  process.exit(1);
}

console.log(
  `✔ ${LANGS.length} languages complete (${base.length} keys), ` +
    `${imageStems.size} image sets present, ${htmlFiles.length} pages linked correctly.`
);
