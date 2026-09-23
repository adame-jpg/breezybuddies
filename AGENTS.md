# BreezyBuddies (working name)

Cute cartoon **food cooler buddies** that clip onto mugs/bowls and blow so kids don’t burn their tongues.

| | |
|---|---|
| Store | `prvhrc-gr.myshopify.com` |
| Admin | https://admin.shopify.com/store/prvhrc-gr |
| Live theme | Horizon `#197905449337` |
| Theme path | `shopify/theme` |
| Currency (shop) | EUR (sell to US/UK/rich markets) |

## Brand (placeholder until final name)

Working brand: **BreezyBuddies** · tagline **Sip. Eat. Repeat.** / *It’s a Breezy Fest!*

Preferred free domains to buy: `heybreezies.com`, `shopbreezies.com`, `breezysip.com`, `breezyfest.com`, `coolsipcrew.com`, `coolsipclub.com`, `littlebreezers.com`, `buddybreeze.com`, `breezyclip.com`, `thebreezycrew.com`

Note: `breezybuddies.com` is taken (Sep 2026). Isa picks via `pages/isa-social-playbook.html` name vote.

## Products ↔ AliExpress (temp — tweak later)

See `shopify/create-products.json` and `shopify/supplier-map.csv`.

## Push theme

```sh
shopify theme push --store prvhrc-gr.myshopify.com --theme 197905449337 \
  --path shopify/theme --allow-live --only config/settings_data.json
```

## Theme commerce components (Aug 2026)

- Sticky quick-add: `snippets/bb-sticky-quick-add.liquid` + `bb-commerce.js`
- Cart drawer: `snippets/bb-cart-drawer.liquid`
- PDP: section `bb-pdp` + template `product.breezy.json` (assign per product in admin)
- FAQ/trust: `snippets/bb-faq-trust.liquid`
- Styles: `assets/bb-commerce.css`

Bundle display math: 1× €19.95 · 2× ~12.5% · 3× ~20% (“Meest gekozen door ouders”). Configure Shopify automatic discounts so checkout matches display.
