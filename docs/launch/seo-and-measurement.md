# Search and measurement handoff

## Implemented

Product JSON-LD uses the real default selected price from the shared price function, CAD, unique name/description, images and product URL. No fake rating, availability or review counts. All image previews remain labelled. Product options may change the total; the visible default matches the schema.

Canonical host is https://layerline.ca. Sitemap: https://layerline.ca/sitemap-index.xml . Admin and success pages are noindex and excluded from sitemap. Old M18/DeWalt/Ryobi slugs and the former nursery slug redirect to their merged/adult-use equivalents.

## Search Console - Cameron verification

1. Add a Domain property `layerline.ca` in https://search.google.com/search-console . Sign in yourself if prompted.
2. Obtain the exact DNS TXT token. Add only that token to this zone, then verify. Do not invent the verification value. Cloudflare domain ownership alone is not Search Console verification.
3. Submit `sitemap-index.xml`. Check home, shop and a product with URL Inspection and request indexing if eligible.
4. Run the Rich Results Test on a product after deploy. A local JSON parse is not proof of Google eligibility or indexing. Google may omit unready catalogue items until real product photos and purchasable offers exist.

## Google Business Profile draft

Name: Layerline Studio. Primary category: 3D printing service, if offered in the category picker. Service area: Toronto / Scarborough; nearby areas only if actually served. Contact hello@layerline.ca. Website https://layerline.ca/?utm_source=google&utm_medium=organic&utm_campaign=gbp . Hours: appointment-only until Cameron confirms hours. Hide the home address if not a staffed, signed storefront that meets Google's rules. Cameron must create/claim, choose the real address and finish verification; do not create a duplicate.

Description: “Layerline Studio makes custom 3D prints in Toronto. We create personalised signs, photo lithophanes, desk accessories, QR stands and practical storage pieces for adults and local businesses. Send a file, sketch or measurements for a quote. We confirm options and send a proof before personalised work is printed. Toronto pickup is by appointment, with shipping within Canada.”

Local content targets: 3D printing Toronto; custom 3D print Toronto; lithophane Toronto; fits Milwaukee M18 battery mount Canada. Brand names describe fit, never affiliation.

## Measurement

Cloudflare Web Analytics already exists for layerline.ca and is enabled with automatic installation. Do not install another beacon for the same property. It provides traffic/performance, not GA4 ecommerce custom events.

Site now prepares view_item, add_to_cart, begin_checkout and server-verified purchase events. Optional GA/GTM IDs remain blank; events are sent only after analytics consent. Purchase is only recorded for a paid live Layerline session; test mode is excluded and reloads are deduplicated. Google/Meta tracking remains off. To use GA4, Cameron must choose/create a Layerline property and approve the consent setup. No fake analytics ID was added.

UTM source/medium/campaign/content persist for this tab in sessionStorage and accompany the server's order snapshot. We do not collect contact details, uploaded files or personalisation as analytics. Monthly: Cloudflare traffic → live Stripe orders by UTM → revenue excluding tax → actual fees/refunds/parts/postage → net and net per print-hour. Unknown fees/costs are explicitly provisional.

Channel URLs:
- Instagram: `/?utm_source=instagram&utm_medium=social&utm_campaign=launch`
- Marketplace: `/shop/?utm_source=facebook&utm_medium=marketplace&utm_campaign=launch`
- Counter card: `/business/?utm_source=local&utm_medium=counter_card&utm_campaign=launch`
- Etsy: keep Etsy transactions on Etsy; do not place an off-platform checkout incentive in listings.
