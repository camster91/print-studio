# Stride

Product page for Sola Stride, an everyday sneaker: gallery, colour and size pickers, reviews, FAQ
and a closing call to action. Static Astro site — no server, no database; the build emits plain
HTML, CSS and JS.

## Quick start

Requires **Node >= 24** (pinned in `engines`).

```bash
npm install
npm run dev       # local dev server
npm run build     # production build into dist/
npm run preview   # serves the built dist/ locally
```

`dist/` is a plain static bundle with the CSS inlined into the page: any static host or CDN serves
it as-is. `public/_headers` sets long-lived caching for the hashed files in `/_astro/` and a week
for `/assets/`.

The canonical origin lives in `site` in `astro.config.mjs`, overridable with the `SITE_URL` env var
at build time. The canonical link, `og:url`, the absolute `og:image`, the sitemap and the sitemap
line in `robots.txt` all derive from it — set it before building for production.

## Project structure

```
src/
  assets/fonts/   Anton, Inter and Geist, self-hosted and trimmed to the characters the page uses
  components/     one .astro component per section, plus the top bar, the product tabs, the
                  stars, the phone buy bar and the analytics tags
  config/         site.ts — name, price, discount, promo code, checkout and legal links, analytics IDs
  layouts/        BaseLayout.astro — head, fonts, SEO and Open Graph
  lib/            the cart, the entrances, the button glint, the offer links and the
                  line-break helper
  pages/          index.astro — the single route — and robots.txt.ts
  styles/         global.css — tokens, reset, type buckets, buttons, entrance states
public/
  assets/icons/   the SVG icons
  assets/images/  the product and lifestyle photography (AVIF), the large ones in two widths
  _headers        cache rules for the static host
  favicon.*       the tab icon: SVG, with PNG and ICO fallbacks
  apple-touch-icon.png  the home-screen icon on iOS
  og-default.jpg  the image shown when the page is shared
```

The sitemap comes from `@astrojs/sitemap` and `robots.txt` from `src/pages/robots.txt.ts`. Both
point at whatever `site` resolves to, so neither needs editing when the domain changes.

### Design system

Everything visual is driven from `src/styles/global.css`:

- **Tokens** — colours, fonts, radii and the container padding, as custom properties on `:root`;
  the padding and the radii step down at each breakpoint. No hex value is written anywhere else.
- **Type buckets** — every text style is a class (`t-display`, `t-title`, `t-body`…) with a fixed
  `rem` size per breakpoint. Components pick a bucket and never set their own `font-size`.
- **Breakpoints** — 991px, 767px and 479px, desktop-first: tablet, mobile and small mobile.
- **Hover** — every `:hover` rule sits behind
  `(min-width: 992px) and (hover: hover) and (pointer: fine)`, so touch devices never get a state
  stuck after a tap.

### Sales settings

**Everything that changes per product or campaign is in `src/config/site.ts`**: the brand name,
the current and previous price, the discount badge, the promo text and code in the top bar, the
product shown in the cart, the checkout URL the cart's Checkout button points to, the three legal
links and the analytics IDs (`analytics`: Google Tag Manager, Meta Pixel and GA4).
Each tag is only emitted when its ID is set.

The "Copy Code" button copies `promo.code` to the clipboard.

### Cart

"Add to bag" and the heart are real buttons. Adding a product opens the cart drawer (quantities,
remove, subtotal and a Checkout link to `checkoutUrl`), and the cart icon in the top bar opens it
too. On phones a green bar with the product, the price and its own "Add to bag" slides up once the
hero's button has scrolled away, and hides again over the closing section. Out of the box the cart
and the favourites live in the visitor's browser (`localStorage`), so the page works with no
backend.

The Checkout link carries the visitor's ad parameters (`utm_*`, `fbclid`, `gclid`, `ttclid`…) on to
`checkoutUrl`, so the store sees where the sale came from.

**To connect a store, replace only the `/* Backend */` section of `src/lib/cart.ts`** — `getCart`,
`addToCart`, `updateQuantity` (a quantity of 0 removes the line), `getFavorites` and
`saveFavorite`. Each returns a promise; the buttons, the drawer, the count badge and the analytics
events keep working unchanged.
The product id, name, price and image are in `product` in `site.ts`; the line id adds the selected
colour and size (`sola-stride-black-8-uk`).

### Analytics

`src/components/Analytics.astro` loads whichever of GTM, Meta Pixel and GA4 has an ID in `site.ts`.

- **Cart events:** `add_to_cart` and `add_to_wishlist` go to GA4 and to the GTM dataLayer in GA4's
  ecommerce shape, and to the Pixel as `AddToCart` and `AddToWishlist`.
- **Button clicks:** every element with `data-track` reports its click as `cta_click` (GTM, GA4) and
  `CTAClick` (Pixel), with the name below.

| `data-track` | Where |
|---|---|
| `cta-hero` | "Add to bag" in the hero |
| `cta-sticky` | "Add to bag" in the phone bar |
| `cta-final` | "Add to bag" in the closing section |
| `cta-checkout` | "Checkout" in the cart |

### Images

The photography is AVIF in `public/assets/images/`. The product render and the lifestyle photo
ship as the full file and a `-768` version, with `srcset` and `sizes` so phones download the
smaller one. The first gallery image loads eagerly with high priority; everything below the fold
is lazy.

### Fonts

The three families are served through Astro's font API: the `@font-face` rules and a preload for
Anton and Inter go straight into the page, with metric-matched fallbacks so the text does not move
when the font arrives. The files in `src/assets/fonts/` are subsets — Inter to weights 400–700,
Geist to the letters of the three footer links. If that footer text changes, re-subset Geist from
the `@fontsource-variable/geist` package or point `astro.config.mjs` back at its full file.

### Motion

No animation library: everything is CSS plus a few lines of script.

- **Entrances** (`src/lib/reveal.ts`): headings marked `data-reveal="lines"` rise line by line; text,
  cards and rows marked `data-reveal` lift 12px as they fade in; photos marked `data-reveal="image"`
  only fade; stars marked `data-reveal="stars"` light up one by one. Only what starts below the fold
  is armed, so nothing on screen blinks, and without scripts everything is simply there.
- **Hero photo:** it settles into place on load, and is visible from the first frame.
- **Buttons** (`src/lib/cue.ts`): a diagonal glint crosses each "Add to bag" shortly after it comes
  into view, then every few seconds while it stays in view.
- **Closing section:** the two "New arrival" tapes run in a loop in opposite directions, and the
  shoe drops onto them the first time the section comes into view.
- The trust band is a CSS marquee. The reviews scroll sideways with snap, the arrows move one card
  at a time, and a mouse can drag them.

With `prefers-reduced-motion: reduce` nothing is hidden, nothing loops and nothing glints.

## Licenses

**This repository ships no license file for its own source.** Treat the code and the design as
proprietary to the client unless stated otherwise.

Third-party assets and their terms:

| What | License | Where |
|---|---|---|
| Anton | SIL Open Font License 1.1 | `src/assets/fonts/` |
| Inter | SIL Open Font License 1.1 | `src/assets/fonts/` |
| Geist | SIL Open Font License 1.1 | `src/assets/fonts/` |

All typefaces are self-hosted from the site itself; no request goes to a third-party font service.

The table does not cover the photography, the product renders or the brand name and logo, which
belong to the client.
