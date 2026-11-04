# Current Layerline catalogue - Nov 4, 2026

17 products. All are **made to order / sample testing**, with `productionReady: false` until Cameron verifies the file, fit, parts and photos. No shelf stock has been verified. Prices and production costs are draft estimates.

| Product | Base CAD | Main options |
|---|---:|---|
| Battery Mounts | $28 | Brand: Milwaukee M18, DeWalt 20V MAX, Ryobi ONE+, Makita 18V LXT, Bosch 18V, Ridgid 18V, Craftsman V20, Ego 56V; Pack: 1 mount, 5-pack, 10-pack; Mount style: Screw-in, Pegboard clip, French cleat |
| Tool Holders | $24 | Brand: Milwaukee M18, DeWalt 20V MAX, Ryobi ONE+, Makita 18V LXT, Bosch 18V, Ridgid 18V, Craftsman V20; Pack: 1 holder, 5-pack, 10-pack; Mount style: Screw-in, Pegboard clip, French cleat |
| Skadis Hooks | $12 | Pack: 8-pack, 16-pack, 24-pack; Hook mix: Mixed set, Straight hooks, Shelves + cup holders, Cable clips |
| Under-Desk Headphone Hook | $16 | Desk thickness: Up to 25 mm, 25–45 mm, 45–60 mm; Style: Single hook, Double hook |
| Controller Wall Mounts | $25 | Controller: PS5 DualSense, Xbox Series, Switch Pro, Mixed (tell us below); Pack: 2-pack, 4-pack, 6-pack |
| Stream Deck Stand | $29 | Device: Stream Deck MK.2, Stream Deck Mini, Stream Deck XL, Stream Deck +; Angle: 30°, 45°, 60° |
| ON AIR Light Box | $45 | Size: Standard · 20 cm, Large · 30 cm |
| Moon Lamp | $49 | Size: 10 cm, 15 cm, 20 cm; Stand: Light wood, Black, No stand |
| Lithophane Photo Box | $55 | Light: Warm white, Colour-changing + remote; Size: 80 mm, 100 mm, 150 mm |
| Pet Memorial Light | $45 | Shape: Circle, Heart, Rectangle; Base: Black, White, Grey |
| LED Name Sign | $55 | Size: Small · 30 cm, Large · 45 cm; Font: Script, Bold sans, Retro; Mount: Wall, Desk stand |
| Personalised Headphone Stand | $39 | Font: Bold sans, Script, Block |
| Desk Nameplate | $29 | Style: Wedge, Flat with stand |
| Wall Name Sign | $39 | Font: Rounded, Script, Block; Extras: Plain |
| QR Review Stand | $25 | Shape: Rectangle, Arch |
| Cottage Lake Topo Map | $89 | Size: 20 × 20 cm, 30 × 30 cm; Frame: Natural wood, Black, No frame |
| Gridfinity Drawer Kit | $39 | Bin mix: Mixed sizes, Small parts, Tools, Kitchen utensils |

## Slug changes

- `m18-battery-mount-5-pack`, `dewalt-20v-battery-mount-6-pack` → `battery-mounts`.
- `ryobi-tool-holder-5-pack` → `tool-holders`.
- `nursery-wall-name-sign` → `wall-name-sign` (adult decor; no child marketing).
- All old paths have permanent redirects. Brand names describe fit only; no affiliation or logos.

## Price decisions

Current QR bulk code is $20 each for 3+, so three cost $60 before extras. Earlier research said $59: Cameron must choose before launch. Logo setup is $15 per line with an uploaded logo, NFC +$15 each. See `launch/price-review.csv`; this lists maximum variable cost for a 60% margin, not verified actual margin.

## Photos

Five real shots per product: hero, detail, scale, in use, options; LED products also lit and unlit. Save `public/products/<slug>/01-hero.jpg` onwards. Update `images` and optional `optionImages`, or `images` on a choice/size value. AI previews retain the Preview image tag until replaced. Real photos have not been supplied.

## Files and release

Original prototype OpenSCAD/STL files are in `models/`. They are not production-approved. Battery/tool interfaces need measured, fit-tested geometry. Each LED assembly needs the actual approved module. Samples/photos/actual costs go in `launch/sample-log.csv`. Full preparation checklist: `launch/cameron-checklist.md`.
