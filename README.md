# Layerline Studio

Home-based 3D print studio in Toronto: personalised signs, lithophane light boxes, QR/NFC stands for
local businesses, garage mounts, and custom builds on request.

- **Website:** Astro (static) + one Cloudflare Worker for `/api/*`, deployed to Cloudflare Workers
- **Payments:** Stripe only (Stripe Checkout for the shop, Stripe invoices for approved custom quotes)
- **Motion:** GSAP + ScrollTrigger, Lenis smooth scroll, Swiper carousels
- **Design:** [Figma prototype](https://www.figma.com/design/zgikhuRluw2ekbDlHqkG2H)

## Docs

- `docs/business-plan.md` — products, pricing, production rules, 90-day plan
- `docs/research-2026-11.md` — market, shipping, legal, licensing and production research
- `docs/catalog.md` — researched launch catalog, custom-order prices, photo shoot plan
- `docs/design-direction.md` — design system, shop model, Figma screen list

## Pages

| URL | What |
| --- | --- |
| `/` | Home (hero, shop, lithophane slider, how it works, LED rail, business, colours, FAQ, custom CTA) |
| `/shop` | All products with type + category filters (`?type=in-stock`, `?category=gifts`) |
| `/products/<slug>` | Product page: options, photo/logo upload, add to bag |
| `/custom` | 5-step custom build request with uploads and live estimate (saves progress) |
| `/business` | Business products, bulk pricing, free sample form |
| `/about`, `/policies`, `/checkout/success`, 404 | |

## Editing content

- **Products and prices:** `src/data/products.json` (the Worker reads the same file, so prices can't be faked in the browser). Card text: `blurbs` in `src/lib/products.ts`.
- **Photos:** add `"images": ["/products/<slug>/01-hero.jpg", ...]` to a product and put the files in `public/products/<slug>/`. Until then each photo shows a labelled placeholder.
- **Reviews:** `src/data/reviews.json` — real reviews only. The section stays hidden while it's empty.
- **FAQ:** `src/data/faq.ts`. **Shop settings** (email, holiday cutoff, shipping): `src/config/site.ts`.

## Run it

Needs Node 22+ (24 in CI).

```bash
npm install
npm run dev          # site only, http://localhost:4321 (API routes won't work here)
npm test             # pricing + validation tests
npm run dev:worker   # build + run site AND /api/* locally with wrangler (http://localhost:8787)
```

For `dev:worker`, put a Stripe **test** key in `.dev.vars` (git-ignored):

```
STRIPE_SECRET_KEY=sk_test_...
```

Uploads and quote requests are stored in a local R2 simulation while developing.

## Going live (one-time setup)

1. **Stripe:** create an account at stripe.com (Canada, CAD). Copy the secret key (start with `sk_test_…`).
2. **Cloudflare:**
   ```bash
   npx wrangler login
   npx wrangler r2 bucket create layerline-uploads
   npx wrangler secret put STRIPE_SECRET_KEY
   npm run deploy
   ```
3. **Domain:** add `layerline.ca` as a custom domain on the `layerline` Worker. Set the GitHub repo variable
   `SITE_URL=https://layerline.ca` and secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` so every push to
   `main` tests, builds and deploys.
4. **Request emails (optional):** turn on Email Routing for the domain, verify your inbox, then in `wrangler.jsonc`
   uncomment `send_email` and set `NOTIFY_TO`. Without it, requests are still saved in R2 under `requests/<id>/`.
5. When test orders work end to end, swap in the `sk_live_…` key with `wrangler secret put STRIPE_SECRET_KEY`.

### How an order flows

1. Bag lives in the browser (`localStorage`).
2. Checkout posts the bag to `/api/checkout`. The Worker re-prices every line from `products.json`, validates
   options, and creates a Stripe Checkout Session (CAD, Canada shipping or free Toronto pickup, phone number,
   promo codes). Personalisation and uploaded file keys go in the Stripe line description + metadata.
3. Stripe emails the receipt; you see the order and its options in the Stripe dashboard.
4. Uploaded photos/logos are in R2 at the keys shown in the order metadata.

### Custom quotes

`/custom` and the business sample form post to `/api/quote`. Each request gets an ID like `LL-0IF9OD` and is saved
to R2 as `requests/<id>/request.json` plus its files (and emailed to you if step 4 is set up). Reply with a price and
proof, then send a Stripe invoice (or take e-Transfer) when they approve.

## Licenses

Fonts: Anton, Inter and JetBrains Mono (SIL Open Font License 1.1), self-hosted. Site code started from the Stride
Astro template (`docs/stride-template-readme.md`).
