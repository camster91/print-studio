# Tenth Layer

Home-based 3D printing studio in Toronto: personalized signs, lithophane light boxes,
QR/NFC stands for local businesses, and battery/tool wall mounts — plus custom builds on request.

## What's here

- `docs/business-plan.md` — products, pricing, production rules, 90-day plan
- `docs/research-2026-11.md` — market, shipping, legal, licensing and production research (Nov 2026)
- `docs/design-direction.md` — website design direction (Dribbble research + Figma prototype)
- `docs/stride-template-readme.md` — notes from the Stride Astro template this site starts from
- `src/`, `public/` — the website (Astro, static, deploys to Cloudflare Workers)

## Website stack

- Astro (static) on Cloudflare Workers (`wrangler.jsonc`, `.github/workflows/deploy.yml`)
- GSAP + ScrollTrigger (motion), Lenis (smooth scroll), Swiper (carousels)
- Custom build request form (uploads, dimensions, colours, budget, deadline)

## Status

1. Plan + research — done
2. Design prototype in Figma — first pass done (https://www.figma.com/design/zgikhuRluw2ekbDlHqkG2H)
3. Build the site from the Stride template — next

```bash
npm install
npm run dev
```
