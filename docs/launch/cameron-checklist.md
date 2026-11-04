# Cameron's launch checklist

Decisions confirmed this session: keep the full 17-product catalogue; create a separate Layerline Stripe account. All catalogue products are now made to order until real stock is recorded. No real checkout is allowed for a product until `productionReady: true` is set after checks.

## Do these first

1. Create and activate the separate Layerline Stripe account yourself. Add your bank and business details. Use Layerline Studio / LAYERLINE / hello@layerline.ca, turn receipt emails on, and confirm your GST/HST registration with your bookkeeper. Do not paste secret keys into GitHub, email or chat. Keep them in Worker secrets. Ashbi test mode stays available for testing.
2. Tell us the exact Bambu model, nozzle and available bed size; the stock PLA/PETG colours; your LED module model plus a clear Canadian approval-mark photo; which real batteries/controllers/devices you can fit-test. Large 450 mm signs need a split design; do not promise a single-piece print.
3. Print the first three non-electrical samples: QR stand, desk nameplate, under-desk hook. Review prototypes in `models/` before slicing. Then print the remaining 14 products after files and parts are confirmed. Test every sold brand/mount interface and every mechanically different style; colour-only changes can share a tested geometry.
4. Fill `sample-log.csv`: actual hours, model plus purge grams, failed grams, part cost, packaging and fit. All catalogue hours/costs are still estimates. Use `price-review.csv` to approve options. At 60% margin, all variable costs must fit in 40% of selling price (36% of list price with LAUNCH10). Stripe/Etsy fees, shipping subsidy, LED and packaging all count.
5. Photograph each finished product: hero, layer detail, scale, in use and options. Lamps: lit and unlit. No customer photo/face without consent. Save `public/products/<slug>/01-hero.jpg` onwards; include exact option names in a note. Preview labels stay on AI renders until replaced.
6. Pack and weigh one small, medium and large order. Get Canada Post quotes from your real origin postal code to local, Ontario, Quebec, western Canada and a remote destination. Confirm whether $12 / free at $100 covers them. Confirm pickup days/times (by appointment only is the current wording).
7. Sign into Search Console and Google Business Profile yourself if needed. For GBP, use a service area and hide the home address unless you meet storefront rules. Verification is yours to complete.
8. Approve the Etsy, Marketplace, Instagram, outreach and review-request drafts before they are posted or sent. Open the seller/social accounts yourself. Do not post drafts with missing photos, source ownership, fit or electrical checks.

## Production order

- Plate 1: QR stand rectangle + arch coupons; nameplate; wall lettering. Check QR scan on two phones, normal counter lighting and at an angle. Confirm links with the shop, including exact Google review destination. No invented links.
- Plate 2: lithophane panels 80/100/150 mm test strips, box fit and LED clearance. Test with an approved USB module, never printed electrical contacts or mains wiring.
- Plate 3: exact-model battery/tool fit coupons in PETG. Confirm retention, clearance, fasteners, pull direction and mounting substrate before a loaded test. Do not sell an untested interface.
- Plate 4+: one per remaining catalogue item; then mechanical variants and each LED module. Batch only after one reliable unit exists. Keep white lithophane filament free of dark purge.
- Trial stock is not sale stock until inspection passes. Log failures and repeat prints rather than silently replacing estimates.

## Images to send

17 products × 5 shots, plus lit/unlit for LED items; desktop hero and business counter shots can reuse your best real photos. A few good photos at a time are useful; do not wait for the entire shoot.
