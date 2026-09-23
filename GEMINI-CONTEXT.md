# BreezyBuddies — full project context (for Gemini / other LLMs)

Paste this block as system/context before your actual ask. Last synced: Aug 2026.

---

## 1. One-sentence product

**BreezyBuddies** = cute cartoon **clip-on food coolers** (mini USB fans shaped like animals) that clip onto kids’ mugs/bowls and blow so hot drinks/soup don’t burn tongues. International one-product DTC dropshipping brand (EU shop currency EUR, sell US/UK/rich markets).

Reference competitor look/feel: [BlowBuddy](https://notoilcup.com/products/blowbuddy). Wife (Isa) found AliExpress suppliers; husband (Adam) builds store/tech.

---

## 2. Origin & who

- Started as a separate project from **World of Molds** (another Shopify dropship store — never mix themes/stores).
- First deliverable: static demo storefront so Isa could preview brand + UX without Shopify complexity.
- Then: real Shopify store on Horizon theme with a custom landing section mirroring the demo.

People: Adam (builder), Isa (product/sourcing). Working brand name until final pick.

---

## 3. Brand & naming (open decisions)

| Item | Status |
|------|--------|
| Working name | **BreezyBuddies** |
| Alternate considered | Cool Critter Club (logo mock), “The Breezies” |
| Taglines | **Sip. Eat. Repeat.** / *It’s a Breezy Fest!* |
| Domains preferred (check free) | `breezybuddies.com`, `shopbreezies.com`, `heybreezies.com`, `coolsipcrew.com` |
| Taken / avoid | `thebreezies.com`, `breezies.com` reportedly taken |
| Legal / VAT / address | Still TODO placeholders in demo config |
| Shop display name | Still may show as “My Store” — rename when brand locked |

Tone: playful kids/parents brand, warm cream + coral + mint, not sterile tech. Not purple-on-white generic AI look. Fonts: **Baloo 2** (display) + **Nunito Sans** (body).

Colors (tokens): cream `#fff8ee`, coral `#ff6b8a`, mint `#7ddbd0`, yellow `#ffd85a`, ink `#28252d`.

---

## 4. Infrastructure

| | |
|--|--|
| GitHub | `https://github.com/adame-jpg/breezybuddies` |
| Local path | `~/Projects/breezybuddies` |
| Shopify store | `prvhrc-gr.myshopify.com` |
| Admin | https://admin.shopify.com/store/prvhrc-gr |
| Live theme | Horizon ID `#197905449337` |
| Theme on disk | `shopify/theme/` |
| Auth historically | Shopify CLI as `info@aemdesign.nl` (re-auth on new machine as needed) |
| Static demo | Root of repo (`index.html`, `assets/`, etc.) — also mirrored at `adame-jpg.github.io/breezybuddies/` |
| Currency | EUR on shop |

Theme push example:
```sh
shopify theme push --store prvhrc-gr.myshopify.com --theme 197905449337 \
  --path shopify/theme --allow-live
```

Dropshipping: map Ali URLs via **CJ Dropshipping** or **DSers**. Store **not yet** in DSers MCP list last check — connect `prvhrc-gr` still open.

---

## 5. What we already built

### A. Static preview storefront (vanilla HTML/CSS/JS)
- Multi-page: home, product, cart, policies placeholders
- Design system: `bb-tokens` style (cream/coral/mint), generated character art → webp
- Catalog, cart with honest bundle math (no fake compare-at), i18n keys for EN/NL/DE/… (preview)
- Analytics stubs (dataLayer / gtag ready, IDs TODO)
- Preview mode banners; claims gated where unverified
- Character images generated in consistent 3D toy-product style

### B. Shopify live storefront
- Horizon theme customized
- Custom section `sections/bb-landing.liquid` + CSS/assets `bb-*`
- Homepage (`templates/index.json`) = **only** the BB landing (not stock Horizon homepage)
- Landing blocks: announce bar, nav, hero, how-it-works, shop-by-family, family moment, features, UGC, bundles, reviews, FAQ, trust, newsletter, footer
- Store password was an issue (Admin API can’t toggle) — user turned off Preferences; store returned HTTP 200

### C. Product ops docs & data
- `AGENTS.md` — store identity for AI agents
- `PRODUCT-OFFERING.md` — families, characters, what NOT to sell
- `shopify/supplier-map.csv` — handle → AliExpress URL
- `shopify/create-products.json` — product create payload reference
- Named SKUs created on Shopify; some still on temp Ali images; biscuit archived
- Static `assets/js/catalog.js` aligned to character lineup

---

## 6. Product architecture (important)

**One physical product type:** clip-on mug/bowl animal cooler (USB).  
**Variants = characters** (animal + color skins), not different gadgets.

### Families
| Family | Meaning | In line? |
|--------|---------|----------|
| **A — Classic Clip Buddies** | Same BlowBuddy-like form factor | YES — core |
| **B — 3-Speed Premium Cat** | Different body, 3 speeds | Keep separate / draft “Pro” — don’t mix on same PDP |
| **C — Non-clip fans** | Hand/desk fans | NO — out of brand |

### Launch characters (Family A), ~€19.95 each
**Pets:** Mochi Cat (`mochi`), Coco Pup (`coco`)  
**Zoo:** Ellie Elephant (`ellie`), Mango Monkey (`mango`), Chili Red Panda (`chili`), Bao Panda (`bao`)  
**Dinos:** Dino Mint (`dino-mint`), Dino Grape (`dino-grape`)  
**Cartoons:** Flip Frog (`flip`), Blossom Bunny (`blossom`)  
**Optional / draft Family B:** Plum Kitty (`plum`) → Ali `1005012451454105` — keep draft

### Bundles
- 1× €19.95  
- 2-pack ~12.5% off  
- 3-pack ~20% off  

### Isa’s key Ali item IDs
- Frog `1005012905772511`
- Elephant `1005012768339991` (+ related baby listing `1005012898423285`)
- 3-speed cat `1005012451454105` (Family B)
- Other characters mapped in `shopify/supplier-map.csv` (multi-animal listings — pick color/variant carefully)

### Explicitly NOT in the shop
Loose folding fans, desk fans without clip-on mug use-case, generic USB fans without character.

---

## 7. Design / creative direction

- Look: soft 3D toy / kids DTC — cream studio backgrounds, rosy cheeks characters, lifestyle kids+mugs
- Hero: full-bleed brand + product, not dashboard clutter
- Reference demo art already in theme assets (`bb-hero.webp`, `bb-mochi.webp`, `bb-ellie.webp`, UGC shots, etc.)
- Next creative need: real PDP photos in same 3D cartoon style (many SKUs still temporary Ali marketplace images)
- Avoid: Inter/Roboto-default look; purple gradient AI cliché; fake scarcity badges; mixing Family B body into Classic grid

---

## 8. Open TODOs (as of last session)

1. Lock final brand name + buy domain  
2. Rename Shopify shop from placeholder  
3. Connect DSers or CJ to `prvhrc-gr` and map every SKU from supplier-map  
4. Per-character: confirm exact Ali color/variant + real lifestyle/PDP art  
5. Decide Family B “Pro” launch vs never  
6. Fill legal: company name, address, VAT, support email on real domain  
7. Analytics pixels (Meta/TikTok/GA)  
8. Checkout/shipping profiles for US/UK/EU  
9. aem-portal unrelated; World of Molds is a **different** store (`0trrqz-jn` / Tinker theme) — do not confuse

---

## 9. Separation rules (hard)

- **BreezyBuddies** ≠ **World of Molds** ≠ **Chillgear** ≠ **FightOrbit**
- Breezy theme path `shopify/theme`, store `prvhrc-gr`, Horizon `#197905449337`
- WoM is molds/casting supplies — different repo, different Shopify

---

## 10. Repo map (where things live)

```
breezybuddies/
  AGENTS.md                 # agent identity
  PRODUCT-OFFERING.md       # catalog strategy
  index.html, assets/, pages/   # static demo
  shopify/
    theme/                  # Horizon + bb-landing
    supplier-map.csv
    create-products.json
```

---

## 11. How to help (default stance for the model)

When asked to continue Breezy work: preserve brand tokens and Family A focus; prefer Shopify + dropship ops or landing/PDP polish; don’t invent new product categories; don’t overwrite WoM; ask before buying domains or pushing live theme if destructive; honest pricing (no fake strikethrough); characters stay cute kids-safe.

---

END OF CONTEXT
