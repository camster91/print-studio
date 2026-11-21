# Layerline catalogue and production plan

Updated November 21, 2026. Layerline sells standard designs made to order and accepts custom projects for quoting. The production plan assumes one Bambu Lab P2S. Add capacity estimates from measured jobs before promising dispatch dates.

## Deployed

The catalogue contains 19 made-to-order products, including the Fold Vase, Tide Centrepiece and cottage terrain map. Product pages collect design-specific inputs and link to a custom request with the starting design filled in. The shop has 39 additional concept images for variation comparisons. Staff can search the catalogue, print a paid order’s job sheet, and update its overall production stage. The admin also handles custom requests, cost entry, sales exports and private payment settings. Product definitions still live in GitHub. [Storefront and studio changes](https://github.com/camster91/print-studio/pull/24) · [Payment settings](https://github.com/camster91/print-studio/pull/25)

## Launch verification

- **Studio owner:** Save the live Stripe secret and matching endpoint signing secret in [private payment settings](https://layerline.ca/api/admin/payment-settings). Keep credentials out of GitHub. Confirm the live endpoint receives the two supported Checkout completion events.
- **Checkout:** The last production smoke test returned HTTP 503 before Stripe opened. After configuration, open checkout for a standard product and confirm a live Stripe session with the expected CAD price and tax handling. This check does not require a charge. Verify signed order creation and duplicate-event handling in test mode separately.
- **Workshop:** Slice and print the vase and bowl on the installed P2S. Record material, elapsed time, stability and packing cost. For the vase, check glass insert fit. Replace concept previews with sample photos as available. Sample approval and permission to accept made-to-order purchases are tracked separately.

## Implementation backlog

| Priority | Work | Acceptance check |
| --- | --- | --- |
| 1 | Create persistent jobs for individual paid order lines. Store quantity, file revision, printer, due date, stage and reprint history. Support older paid records. | A vase and bowl produce two jobs. A repeated webhook produces no extra jobs. Staff can fail and reprint the bowl while the vase stays finished and the charge stays the same. |
| 2 | Connect custom requests, versioned quotes, artwork, proof approval and paid invoices to production. | The approved revision and print instructions reach the same queue as catalogue orders. An unpaid invoice creates no production job. |
| 3 | Add packing slips, pickup, partial shipments, carrier references and private customer tracking. | Ship one item and hold the other. The customer sees the correct quantities and status. Private artwork keys and internal notes stay behind studio access. |
| 4 | Add catalogue editing in admin for designs, variants, prices, images, production inputs, materials, inserts, print profiles and lead times. | Staff publish one revision to both storefront and checkout. Previously purchased orders retain their original price, selections and file revision. |
| 5 | Track filament by finish, inserts, packaging, printer availability, rejects and actual cost per job. | A queued order shows missing materials or the next available machine time. A reprint consumes materials and hours once and appears in margin reporting. |

**End-to-end release check:** Order a vase and bowl in test mode, print the sheet, reprint the bowl, pack both, and follow the shipment through customer tracking. Repeat with pickup and partial shipment. Exercise concurrent staff edits and expired artwork before marking the production workflow complete.

## Collection and capacity

Use Maison SIA's sculptural silhouettes and the Sheyn Bloz as aesthetic references. Develop original geometry and photograph actual samples. Start with a matte taupe fold vase (230 mm tall, retail test CAD 175), then a chalk decorative tide bowl (210 mm wide, CAD 145), a low companion vase (170 mm tall, CAD 95; pair CAD 245) and a graphite heron (CAD 125). Prioritize the vase and bowl. Test a glass insert for fresh stems. Style the pair together for a shop-the-room purchase. Keep lighting for later fixture development. Test framed terrain at CAD 199, with larger lodge commissions individually quoted.

Assumed printer: Bambu Lab P2S, nominal 256 × 256 × 256 mm. The 280–300 mm inspiration piece exceeds upright build height. Target 140 × 120 × 230 mm for the first vase and 210 × 155 × 70 mm for the bowl. Slice the actual model with the installed nozzle and plate, including brim, support and toolhead clearances. Quote oversized work after testing joints or an alternative orientation. Record elapsed hours, grams, rejects, insert fit, stability and packed shipping weight. Hold only consumables and samples. Set dispatch estimates from available machine hours and materials. Prices and dimensions are prototype targets.

References: [Maison SIA](https://maisonsia.com/), [Bloz reference](https://maisonsia.com/products/bloz-vase-in-deep-taupe-30-cm), [Bambu Lab P2S](https://blog.bambulab.com/the-icon-redefined-meet-the-p2s-a-completely-reengineered-version-of-the-ultra-productive-p1-series/), [terrain price benchmark](https://www.keywaydesigns.com/products/3d-terrain-art).
