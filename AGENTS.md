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

Preferred free domains to buy: `breezybuddies.com`, `shopbreezies.com`, `heybreezies.com`, `coolsipcrew.com`

## Products ↔ AliExpress (temp — tweak later)

See `shopify/create-products.json` and `shopify/supplier-map.csv`.

## Push theme

```sh
shopify theme push --store prvhrc-gr.myshopify.com --theme 197905449337 \
  --path shopify/theme --allow-live --only config/settings_data.json
```

## Dropshipping

Connect **CJ Dropshipping** or **DSers** to `prvhrc-gr` (not yet in DSers MCP store list). Map each product to the Ali URL in supplier-map.csv.
