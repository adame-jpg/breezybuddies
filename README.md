# BreezyBuddies — shop preview

Een complete, internationale one-product webshop als **statische site**: geen build,
geen framework, geen database. Bedoeld om te laten zien hoe de winkel eruit kan zien
en aanvoelen, voordat we kiezen tussen Shopify of WooCommerce.

Merknaam staat op één plek (`assets/js/config.js` → `BRAND.name`). Wil je
"Cool Critter Club" in plaats van "BreezyBuddies"? Eén regel aanpassen.

## Online zetten

```sh
cd ~/Projects/breezybuddies
npm run deploy
```

Dat draait `npx vercel --prod`. De eerste keer vraagt Vercel om in te loggen
(GitHub/Google/e-mail, gratis) en of het een nieuw project is → alles enter.
Daarna krijg je een URL zoals `https://breezybuddies.vercel.app` die je kunt
doorsturen. Elke volgende `npm run deploy` zet de nieuwe versie live.

Liever Netlify? `netlify.toml` staat er al klaar: `npx netlify deploy --prod`.

## Lokaal bekijken

```sh
npm run dev     # http://localhost:4321
```

De site gebruikt ES-modules, dus openen via `file://` werkt niet — draai altijd
de dev-server.

## Controleren voor je deployt

```sh
npm run check
```

Controleert of alle vijf talen dezelfde sleutels hebben, of elke afbeelding die
de code opvraagt echt bestaat, en of geen enkele interne link kapot is.

## Wat er in zit

| | |
|---|---|
| Pagina's | homepage, productpagina, FAQ, verzending, retour, privacy, voorwaarden, cookies, contact, order volgen, over ons |
| Talen | Engels (standaard), Nederlands, Duits, Frans, Spaans |
| Markten | NL, BE, DE, FR, ES, GB, US, CA, AU met EUR/USD/GBP/CAD/AUD |
| Winkelwagen | slide-out drawer, staffelprijzen, gratis-verzendmeter, cross-sell |
| Karakters | 6 varianten die alle zes echt in de leverancierslijst staan |
| Analytics | GA4 / Meta / TikTok / Pinterest hooks, nog zonder ID's |

### Mapstructuur

```
index.html                homepage
product.html              productpagina
pages/                    beleid + support (gegenereerd via tools/build-pages.py)
assets/css/               tokens.css (design tokens), base.css, components.css
assets/js/config.js       alle zakelijke instellingen + TODO's
assets/js/catalog.js      producten, bundels, FAQ, reviews
assets/js/i18n.js         de vijf talen
assets/js/store.js        markt + winkelwagen (localStorage)
assets/js/chrome.js       header, footer, menu, landkeuze
assets/js/cart.js         winkelwagen-drawer
assets/js/sections.js     homepage-secties
assets/js/pdp.js          productpagina
assets/img/               webp + jpg, meerdere breedtes
reference/                de originele AliExpress-screenshots (alleen referentie)
tools/                    build- en testscripts (niet gelinkt vanaf de site)
```

## Preview-modus

`PREVIEW_MODE = true` in `assets/js/config.js` zorgt voor:

- een gele balk bovenaan: "Design preview — sample prices, checkout switched off"
- afrekenen doet niets behalve een melding tonen
- de reviews staan gelabeld als voorbeeldtekst

Zet die vlag pas op `false` als er echt betaald kan worden.

## Wat nog echte informatie nodig heeft

Alles staat op `pages/launch-checklist.html` (niet gelinkt vanaf de winkel, en
`noindex`). Kort samengevat:

- bedrijfsnaam, adres, KvK/btw — nu overal `TODO` in de voettekst en voorwaarden
- CE/EN71-certificering, BPA-documentatie, IP-rating → zolang die er niet zijn,
  blijven de claims over leeftijd, waterdicht en materiaal automatisch verborgen
- batterijduur: opmeten en in `CLAIMS.batteryMinutes` zetten, dan verschijnt het
  FAQ-antwoord van zichzelf
- echte foto's en 9:16 video's in plaats van de gegenereerde beelden
- echte reviews (`IS_SAMPLE_REVIEWS = false`)
- prijzen en valuta uit het platform halen; de koersen in `config.js` zijn
  placeholders voor de preview

## Afbeeldingen opnieuw genereren

De bronbestanden staan buiten deze repo. Na het vervangen van de bronnen:

```sh
npm run images   # webp + jpg in meerdere breedtes
npm run pages    # beleidspagina's opnieuw uitschrijven
```

## Later naar Shopify of WooCommerce

De datalaag is er al op ingericht: `catalog.js` bevat per karakter een
`supplierVariant` die één-op-één matcht met de variantnaam in de
leverancierslijst, en `config.js` bevat alle beleidsregels als losse waarden.
Bij het overzetten worden `index.html` en `product.html` een theme-template en
`sections.js` de losse secties — de teksten, prijzen en afbeeldingen kunnen
mee zoals ze zijn.
