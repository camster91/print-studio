# Design Direction

**Figma prototype:** https://www.figma.com/design/zgikhuRluw2ekbDlHqkG2H — frames: Home — Desktop 1440, Custom Build Steps 2–5 + Thank you (desktop, stacked in order), Home — Mobile 390, Motion notes, Components (Button, SpecTag, Swatch, PhotoPlaceholder, ProductCard) and colour variables.

From Dribbble + real 3D-print sites research (Nov 3, 2026). Base template: Stride (Astro). Motion: GSAP + ScrollTrigger, Lenis, Swiper.

## References

| Ref | Borrow |
| --- | --- |
| [Harktech quote page](https://harktech.co.uk/printing) | 4-step trust strip, finish cards, live price after every change, "No preference" colour |
| [Kobee quote](https://kobee.com.au/3d-printing/quote) | File drop zone with formats + size limit, sticky "Your quote" panel, "no file? we design from a sketch" |
| [Filterfotograf lithophane](https://www.filterfotograf.de/en/products/lithophane-3d-bild-personalisiert) | "What is a lithophane?", 4-step how it works, size presets (beat it with lit/unlit preview) |
| [Prusa](https://www.prusa3d.com/) | Product cards lead with who it's for + one-line benefit |
| [Bambu Lab](https://bambulab.com/en) | Filament / colour guide as content |
| [3YOURMIND shot](https://dribbble.com/florianstrasser) | Technical, spec-led presentation |
| [Industry 4.0 homepage](https://dribbble.com/shots/6357051-Industry-4-0-Company-Homepage-Design-Direction) | Grid + mono labels |
| [Quote process cards](https://dribbble.com/shots/21844962-Insurance-Brand-Quote-Process-Cards), [Multistep form](https://dribbble.com/shots/17295367-AlphaDebit-Multistep-Form-UI) | Card-per-step flow with progress |

## Tokens

| Token | Hex | Use |
| --- | --- | --- |
| paper | #F4F2EE | page background |
| surface | #FFFFFF | cards, form |
| ink | #141414 | text |
| grid | #D9D5CE | build-plate grid, borders |
| accent | #FF5B1F | "hot nozzle" orange: CTAs, highlights |
| chamber | #1B1C1E | dark sections |
| glow-cyan / glow-magenta | #3DF5E8 / #FF3DA8 | LED sign showcase only |
| filament swatches | #FF5B1F #FFD23F #2EC4B6 #3A86FF #8338EC #F4F2EE #141414 | colour picker, colour wall |

Type: **Anton** (display, uppercase) · **Inter** (body) · **JetBrains Mono** (specs, mm callouts, step numbers).

Motifs: 10 mm build-plate grid backgrounds · thin layer lines on display text and dark bands · dimension callouts ("← 180 mm →") on photos · nozzle-path SVG line between sections · spec tags ("0.2 MM · PLA · 4 H") · spool swatch chips.

Photos: products on paper-coloured seamless, 3/4 top angle · in-context (salon counter, garage wall) · lithophanes always lit/unlit · LED signs in a dark room · layer-line macros.

## Homepage order

1. Hero — Anton headline revealed layer by layer (GSAP masks), product photo with mm callouts, CTAs: Shop / Start a custom build
2. Trust marquee — Printed in Toronto · Local pickup · 5–7 day turnaround · reviews
3. Shop by product — 4 cards (Swiper on mobile)
4. Lithophane lit/unlit — drag or scroll-scrubbed light (ScrollTrigger scrub)
5. How it works — pinned 4 steps (Upload → Proof → Print → Pickup/Ship), nozzle path draws, print fills layer by layer
6. LED sign showcase — dark chamber section, glow, horizontal Swiper
7. For businesses — QR/NFC stands, bulk pricing, free sample offer
8. Filament colour wall — swatches stagger in
9. Reviews — Swiper
10. FAQ — accordion
11. Custom build CTA — big Anton on build-plate grid, form step 1 inline
12. Footer

Lenis everywhere, synced to the ScrollTrigger ticker. With reduced motion: no smoothing, no pinning, nothing hidden.

## Custom build form

- 5 steps with progress: (1) What are we making — cards incl. "Something else" · (2) Upload — drop zone, thumbnails, "No file? Describe or sketch it" · (3) Size, colour, quantity — W×H×D mm, preset chips, spool swatches + "Let us choose", stepper with bulk tiers · (4) Budget + deadline — chips, rush +25% · (5) Contact + review — consents
- Desktop: sticky summary panel with a live "starting from" estimate (labelled estimate; final quote within 24 h)
- Progress saved in localStorage

## Custom build screens (in Figma)

| Screen | What's on it |
| --- | --- |
| Step 1 What | Inline on the homepage CTA: 6 option cards (sign, stand, lithophane, part, organiser, something else) |
| Step 2 Files | Drop zone (JPG/PNG/HEIC/SVG/PDF/STL/3MF/STEP, 25 MB), upload progress, photo tip, "No file? Describe it", reference link, photo-rights checkbox |
| Step 3 Size & colour | Size presets + W×H×D, mm/in toggle, spool swatches + "Let us choose", brand hex, material, quantity stepper with bulk tiers |
| Step 4 Budget & date | Holiday cutoff banner (Dec 4), budget chips, Flexible / By a date / Rush +25%, design help ($0 / from $25), delivery (pickup / Canada / US on request) |
| Step 5 Contact | Name, email, phone, postal code, preferred contact, review list with Edit links, no-refund + newsletter checkboxes, "Nothing is charged yet" |
| Thank you | Request number, 24 h promise, 3 next steps (proof → approve → print) |

Every step shows the dark "Your request" panel with a live estimate that fills in as the visitor goes.
