# Product Plan: 10 Product Types That Can Reach $100/Month in Sales

Nov 11, 2026 · Adds to `research-2026-11.md` and `business-plan.md`. Does not change `products.json`, prices or `productionReady`.

**Test used:** can one product type reach **$100 CAD a month in total sales** on one printer? That is 2–5 sales a month for most items below.

**Bottom line:** personalised and functional prints pass the test. Generic toys and trinkets do not. Seven of the ten types are already in the catalogue. Three are gaps worth testing.

**Limits of this research:** the numbers are marketplace-wide (Etsy, eBay), mostly USD or GBP, and several "what sells" lists are written by printer makers. Nothing here is Layerline's own sales data. Treat every figure as a starting guess until `launch/sample-log.csv` and real orders say otherwise.

## The ten, ranked for Layerline

"Sales for $100" uses current catalogue base prices in CAD, rounded up.

| # | Product type | Why it passes | In catalogue? | Sales for $100 |
|---|---|---|---|---|
| 1 | Custom name signs and desk plates | Crowded, but personalisation protects price. 1–3 h prints. AMS does two colours with no painting. | Yes: Wall Name Sign $39, Desk Nameplate $29, Personalised Headphone Stand $39 | 3–4 |
| 2 | Photo lithophane lamps | Each order uses the buyer's own photo, so nobody can undercut with the same file. 2–5 h, unattended. | Yes: Lithophane Photo Box $55, Pet Memorial Light $45 | 2–3 |
| 3 | Board game inserts | US$25–$90 each. Thin competition per game, loyal buyers. Slow: 8–20 h across parts. | **Gap** | 2–3 (est.) |
| 4 | Hobby tools and jigs | Underserved. Source suggests US$15–$40. 1–4 h. | **Gap** (custom form only) | 3–5 (est.) |
| 5 | Replacement parts and clips | Very thin competition, hard to find elsewhere. 20 min–2 h. | Via `/custom` ($25 minimum) | 4 |
| 6 | Light-up signs and lamps | Top 3D-printed type on eBay by revenue: 1,372 sales in 30 days, median US$39.99. | Yes: LED Name Sign $55, ON AIR Light Box $45, Moon Lamp $49 | 2–3 |
| 7 | Keycaps and keyboard parts | Low competition, segment pays well. 30 min–3 h. | **Gap** | Unknown |
| 8 | Fitted organisers (made for one drawer, tool or device) | eBay home/workshop organisers: 1,166 sales in 30 days, median US$16.99. Generic end is saturated, so fit is the product. | Yes: Battery Mounts $28, Tool Holders $24, Gridfinity Drawer Kit $39, Stream Deck Stand $29, Controller Wall Mounts $25 | 3–5 |
| 9 | Pet and aquarium fittings | Low competition in specific sizes. 1–6 h. | **Gap** (Pet Memorial Light is a gift, not a fitting) | Unknown |
| 10 | Personalised holiday decor | One seller's case study found Christmas decor the most profitable seasonal item, sold in bursts. | **Gap** | Unknown |

Catalogue items that sit outside the ten: Skadis Hooks ($12, needs 9 sales), Under-Desk Headphone Hook ($16, needs 7), QR Review Stand ($25, needs 4 but is the best B2B lead-in), Cottage Lake Topo Map ($89, needs 2). Keep them; judge them in January with the rest.

## What this changes

1. **No new launch products.** The catalogue already covers the strongest types. The checklist order (QR stand, nameplate, hook first) stands.
2. **Lead the holiday push with types 1, 2 and 6.** They are gifts, they are personalised, and they are already built into the site. Custom cutoff is still Dec 4.
3. **One holiday test from the gaps: personalised ornament or tree topper (type 10).** Own design, colour-by-layer, small and cheap to ship. Adult decor wording only, per the no-child-marketing rule. Only worth it if a sample is photographed by about Nov 20.
4. **January candidates, in this order:** board game inserts, hobby jigs, pet/aquarium fittings, keycaps. Add one at a time, as the 90-day plan already says ("add one runner-up").
5. **Use the `/custom` form as the test bed.** Replacement parts and jigs arrive as requests first. A request that repeats twice becomes a catalogue product.

## Notes on the gap candidates

- **Board game inserts:** pick two or three popular games and design original inserts. Name them "compatible with [game]. Not affiliated with [publisher]", no box art or logos. Long prints, so price per print-hour needs checking against signs before committing.
- **Hobby jigs:** choose one hobby Cameron can fit-test in person. Sells best in that hobby's own groups, not general marketplaces.
- **Keycaps:** print one test set first. Whether FDM surface quality is good enough to charge for is unverified.
- **Pet/aquarium fittings:** aquarium parts sit in water with live animals, so material choice and safety claims need separate research before any listing. Do not list until that is done.
- **Ornaments:** seasonal, so plan stock and storage. Anything left on Dec 22 waits a year.

## Skip

- **Articulated flexi animals:** prices reportedly fell about two-thirds in three years (one dragon about £14 → £4.50). Also toy-like, which conflicts with the CCPSA no-kids rule.
- **Generic phone stands and cable clips:** down to a few dollars.
- **Cosplay props and armour:** 20–60 h per kit, high IP risk.
- **Statues, busts, licensed characters:** sell well on eBay but depend on other people's IP.

## Rules (unchanged, repeated because they decide what is allowed)

- Etsy: 3D-printed items must be the seller's original design. A bought commercial licence does not count.
- Any file marked "NC", and MakerWorld's Standard Digital File License, cannot be printed for sale anywhere.
- Own-site and local sales of licensed designs are fine while the licence is active.

## January review

For each product type, record from `launch/sample-log.csv` and the admin sales CSV: units sold, sales in CAD, print hours, profit per print-hour. Keep the top two earners per print-hour, drop the weakest, add the first January candidate.

## Sources

- Trendlytic, "12 3D Printed Items That Still Sell on Etsy in 2026": https://www.trendlytic.io/blog/3d-printed-items-to-sell-on-etsy
- ZIK Analytics, "Best Selling 3D Printed Items: 8 Types That Sell on eBay" (30 days to Oct 1, 2026: 41,120 sales, US$827,820, 2,556 sellers): https://www.zikanalytics.com/blog/?p=25749
- 3D Printed Decor, 2026 case study: https://www.3dprinteddecor.com/make-money-selling-3d-printed-decor-case-study-2026/
- STLRepo, "Understanding 3D Model Licensing": https://stlrepo.com/guides/3d-model-licensing
