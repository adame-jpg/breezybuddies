/** Homepage section renderers. Each one returns markup from catalog data. */
import { CLAIMS, POLICY } from "./config.js";
import {
  BUDDIES,
  BUNDLES,
  FAQ,
  FEATURES,
  HOW_IT_WORKS,
  IS_SAMPLE_REVIEWS,
  REVIEWS,
  UGC,
  UNIT_PRICE,
  bundleListPrice,
  bundlePrice,
  buddyById,
  reviewAverage,
} from "./catalog.js";
import { has, t } from "./i18n.js";
import { money } from "./store.js";
import { asset, escape, icon, picture, stars } from "./ui.js";

export const buddyCard = (buddy) => `
  <article class="card" style="--accent:${buddy.accent};--accent-soft:${buddy.accentSoft}" data-reveal>
    <a class="card__media" href="${asset(`product.html?buddy=${buddy.id}`)}"
       aria-label="${escape(buddy.name)} — ${t("shop.detail")}">
      ${buddy.badgeKey ? `<span class="card__badge">${t(buddy.badgeKey)}</span>` : ""}
      ${picture({
        src: asset(buddy.image),
        alt: `${buddy.name} — ${t(buddy.animalKey)}`,
        widths: [450, 900],
        sizes: "(min-width: 1000px) 300px, (min-width: 640px) 40vw, 45vw",
        width: 450,
        height: 450,
      })}
    </a>
    <div class="card__body">
      <p class="card__animal">${t(buddy.animalKey)}</p>
      <h3 class="card__name">${escape(buddy.name)}</h3>
      <p class="card__price">${money(UNIT_PRICE)}</p>
      <button type="button" class="btn btn--primary btn--block" data-add-buddy="${buddy.id}">
        ${t("shop.pick")}
      </button>
      <a class="card__link" href="${asset(`product.html?buddy=${buddy.id}`)}">${t("shop.detail")}</a>
    </div>
  </article>`;

export const renderShop = () => `
  <div class="wrap">
    <header class="sec-head">
      <h2 class="sec-title" data-reveal>${t("shop.title")}</h2>
      <p class="sec-sub" data-reveal>${t("shop.sub")}</p>
    </header>
    <div class="grid-cards">${BUDDIES.map(buddyCard).join("")}</div>
  </div>`;

export const renderHow = () => `
  <div class="wrap">
    <header class="sec-head">
      <h2 class="sec-title" data-reveal>${t("how.title")}</h2>
      <p class="sec-sub" data-reveal>${t("how.sub")}</p>
    </header>
    <ol class="steps">
      ${HOW_IT_WORKS.map(
        (step, i) => `
        <li class="step" data-reveal>
          <span class="step__num">${i + 1}</span>
          <span class="step__icon">${icon(step.icon, 28)}</span>
          <h3 class="step__title">${t(step.titleKey)}</h3>
          <p class="step__body">${t(step.bodyKey)}</p>
        </li>`
      ).join("")}
    </ol>
  </div>`;

export const renderFeatures = () => `
  <div class="wrap">
    <header class="sec-head">
      <h2 class="sec-title" data-reveal>${t("feature.title")}</h2>
    </header>
    <div class="grid-features">
      ${FEATURES.filter((f) => f.show)
        .map(
          (f) => `
        <article class="feature" data-reveal>
          <span class="feature__icon">${icon(f.icon, 24)}</span>
          <h3 class="feature__title">${t(f.titleKey)}</h3>
          <p class="feature__body">${t(f.bodyKey)}</p>
        </article>`
        )
        .join("")}
    </div>
  </div>`;

export const renderUgc = () => `
  <div class="wrap">
    <header class="sec-head sec-head--left">
      <h2 class="sec-title" data-reveal>${t("ugc.title")}</h2>
      <p class="sec-sub" data-reveal>${t("ugc.sub")}</p>
    </header>
    <div class="reel">
      ${UGC.map(
        (item) => `
        <figure class="vcard" data-reveal>
          <div class="vcard__media">
            ${picture({
              src: asset(item.src),
              alt: t(item.titleKey),
              widths: [420, 720],
              sizes: "(min-width: 900px) 300px, 70vw",
              width: 420,
              height: 747,
            })}
            <span class="vcard__play">${icon("play", 22)}</span>
          </div>
          <figcaption class="vcard__cap">
            <strong>${t(item.titleKey)}</strong>
            <span>${escape(item.handle)}</span>
          </figcaption>
        </figure>`
      ).join("")}
      <figure class="vcard vcard--slot" data-reveal>
        <div class="vcard__media vcard__media--empty">
          <span>${icon("play", 26)}</span>
          <p>${t("ugc.slot")}</p>
        </div>
      </figure>
    </div>
  </div>`;

export const renderBundles = () => `
  <div class="wrap">
    <header class="sec-head">
      <h2 class="sec-title" data-reveal>${t("bundle.title")}</h2>
      <p class="sec-sub" data-reveal>${t("bundle.sub")}</p>
    </header>
    <div class="grid-bundles">
      ${BUNDLES.map((bundle) => {
        const price = bundlePrice(bundle);
        const list = bundleListPrice(bundle);
        const saved = Math.round((list - price) * 100) / 100;
        return `
        <article class="bundle${bundle.tagKey === "bundle.popular" ? " bundle--hero" : ""}" data-reveal>
          ${bundle.tagKey ? `<span class="bundle__tag">${t(bundle.tagKey)}</span>` : ""}
          <div class="bundle__stack" aria-hidden="true">
            ${BUDDIES.slice(0, bundle.units)
              .map(
                (b, i) =>
                  `<span class="bundle__chip" style="--accent-soft:${b.accentSoft};--i:${i}">${picture(
                    {
                      src: asset(b.image),
                      alt: "",
                      widths: [450],
                      sizes: "64px",
                      width: 64,
                      height: 64,
                    }
                  )}</span>`
              )
              .join("")}
          </div>
          <h3 class="bundle__title">${t(bundle.labelKey)}</h3>
          <p class="bundle__sub">${t(bundle.subKey)}</p>
          <p class="bundle__price">
            <strong>${money(price)}</strong>
            ${saved > 0 ? `<span class="strike">${money(list)}</span>` : ""}
          </p>
          ${
            bundle.units > 1
              ? `<p class="bundle__each">${t("bundle.each", {
                  price: money(price / bundle.units),
                })}</p>`
              : ""
          }
          ${saved > 0 ? `<p class="bundle__save">${t("bundle.save", { amount: money(saved) })}</p>` : ""}
          <a class="btn ${bundle.tagKey === "bundle.popular" ? "btn--primary" : "btn--soft"} btn--block"
             href="${asset(`product.html?bundle=${bundle.id}`)}">${t("bundle.choose")}</a>
        </article>`;
      }).join("")}
    </div>
  </div>`;

export const renderReviews = () => {
  const avg = reviewAverage();
  return `
  <div class="wrap">
    <header class="sec-head">
      <h2 class="sec-title" data-reveal>${t("reviews.title")}</h2>
      <p class="sec-sub" data-reveal>
        ${stars(avg, 18)}
        <span>${t("reviews.sub", { avg: avg.toString().replace(".", ","), count: REVIEWS.length })}</span>
      </p>
      ${IS_SAMPLE_REVIEWS ? `<p class="note note--warn">${t("reviews.sample")}</p>` : ""}
    </header>
    <div class="reel reel--reviews">
      ${REVIEWS.map((review) => {
        const buddy = buddyById(review.buddy);
        return `
        <figure class="review" data-reveal>
          ${
            review.photo
              ? `<div class="review__photo">${picture({
                  src: asset(review.photo),
                  alt: "",
                  widths: [420],
                  sizes: "(min-width: 900px) 300px, 74vw",
                  width: 420,
                  height: 320,
                })}</div>`
              : ""
          }
          <blockquote class="review__body">
            ${stars(review.rating)}
            <p>${t(review.bodyKey)}</p>
          </blockquote>
          <figcaption class="review__meta">
            <span class="review__avatar" style="--accent-soft:${buddy.accentSoft}">${picture({
              src: asset(buddy.image),
              alt: "",
              widths: [450],
              sizes: "36px",
              width: 36,
              height: 36,
            })}</span>
            <span>
              <strong>${escape(review.name)}</strong>
              <span class="review__country">${escape(review.country)} · ${escape(buddy.name)}</span>
            </span>
          </figcaption>
        </figure>`;
      }).join("")}
    </div>
  </div>`;
};

/** An answer is only shown when we can actually stand behind it. */
export const faqAnswer = (entry) => {
  const key = `faq.${entry.id}.a`;
  const claim = entry.claim ? CLAIMS[entry.claim] : null;
  if (claim && (claim.value === null || claim.value === undefined)) return t("faq.tbc");
  if (!has(key)) return t("faq.tbc");
  if (entry.id === "shipping") {
    return t(key, {
      eu: `${POLICY.shipping.eu.min}–${POLICY.shipping.eu.max}`,
      us: `${POLICY.shipping.us.min}–${POLICY.shipping.us.max}`,
    });
  }
  if (entry.id === "returns") return t(key, { days: POLICY.returnsDays });
  return t(key);
};

export const renderFaq = () => `
  <div class="wrap wrap--narrow">
    <header class="sec-head">
      <h2 class="sec-title" data-reveal>${t("faq.title")}</h2>
      <p class="sec-sub" data-reveal>${t("faq.sub")}</p>
    </header>
    <div class="faq">
      ${FAQ.map(
        (entry) => `
        <details class="faq__item" data-reveal>
          <summary>
            <span>${t(`faq.${entry.id}.q`)}</span>
            ${icon("chevronDown", 20)}
          </summary>
          <div class="faq__answer"><p>${faqAnswer(entry)}</p></div>
        </details>`
      ).join("")}
    </div>
  </div>`;

export const renderTrust = () => {
  const items = [
    { icon: "truck", title: t("trust.worldwide"), body: t("trust.worldwide.body") },
    { icon: "lock", title: t("trust.secure"), body: t("trust.secure.body") },
    { icon: "chat", title: t("trust.support"), body: t("trust.support.body") },
  ];
  if (POLICY.returnsConfirmed) {
    items.push({
      icon: "refresh",
      title: t("trust.returns", { days: POLICY.returnsDays }),
      body: t("trust.returns.body", { days: POLICY.returnsDays }),
    });
  }
  return `
  <div class="wrap">
    <div class="trust">
      ${items
        .map(
          (item) => `
        <div class="trust__item" data-reveal>
          <span class="trust__icon">${icon(item.icon, 22)}</span>
          <div>
            <h3>${item.title}</h3>
            <p>${item.body}</p>
          </div>
        </div>`
        )
        .join("")}
    </div>
  </div>`;
};

const SOCIAL_TILES = [
  { src: "assets/img/lifestyle/hero-afterschool", widths: [700, 1100], ratio: "1/1" },
  { src: "assets/img/products/on-mug", widths: [500, 1000], ratio: "1/1" },
  { src: "assets/img/ugc/soup", widths: [420, 720], ratio: "1/1" },
  { src: "assets/img/lifestyle/family-tea", widths: [700, 1400], ratio: "1/1" },
  { src: "assets/img/ugc/breakfast", widths: [420, 720], ratio: "1/1" },
  { src: "assets/img/brand/lineup", widths: [800, 1600], ratio: "1/1" },
];

export const renderSocial = () => `
  <div class="wrap">
    <header class="sec-head">
      <h2 class="sec-title" data-reveal>${t("ugc.title")}</h2>
      <p class="sec-sub" data-reveal>${escape("@breezybuddies")}</p>
    </header>
    <div class="social">
      ${SOCIAL_TILES.map(
        (tile) => `
        <figure class="social__tile" data-reveal>
          ${picture({
            src: asset(tile.src),
            alt: "",
            widths: tile.widths,
            sizes: "(min-width: 900px) 220px, 33vw",
          })}
        </figure>`
      ).join("")}
    </div>
  </div>`;

/** JSON-LD for the FAQ block — only questions with a real answer. */
export const faqSchema = () => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((entry) => ({
    "@type": "Question",
    name: t(`faq.${entry.id}.q`),
    acceptedAnswer: { "@type": "Answer", text: faqAnswer(entry) },
  })),
});
