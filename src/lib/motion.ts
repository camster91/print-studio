import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Site-wide motion:
 * - Lenis smooth scroll, synced to GSAP's ticker
 * - [data-reveal] fade/lift on scroll (only for things below the fold)
 * - [data-split] headline lines rise from a mask ("layer by layer")
 * - [data-marquee] infinite loop
 * - [data-progress] bar fills while its section scrolls
 * Everything is skipped with prefers-reduced-motion.
 */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export let lenis: Lenis | null = null;

function startLenis() {
  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')!;
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis?.scrollTo(el as HTMLElement, { offset: -80 });
    }),
  );
}

function splitLines(el: HTMLElement) {
  // Wrap each word, then group words that share a line into masked rows.
  const words = (el.textContent ?? '').trim().split(/\s+/);
  const accent = el.dataset.accent?.toLowerCase();
  el.innerHTML = words
    .map((w) => `<span class="w${accent && w.toLowerCase().replace(/[^a-z]/g, '') === accent ? ' accent' : ''}">${w}</span>`)
    .join(' ');
  const spans = [...el.querySelectorAll<HTMLElement>('.w')];
  const lines: HTMLElement[][] = [];
  let top = -1;
  spans.forEach((s) => {
    if (s.offsetTop !== top) { lines.push([]); top = s.offsetTop; }
    lines.at(-1)!.push(s);
  });
  el.innerHTML = lines
    .map((l) => `<span class="line" style="display:block;overflow:hidden;padding-bottom:0.04em"><span class="line__in" style="display:block">${l.map((s) => s.outerHTML).join(' ')}</span></span>`)
    .join('');
  return [...el.querySelectorAll<HTMLElement>('.line__in')];
}

function reveals() {
  const fold = window.innerHeight;
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    const below = el.getBoundingClientRect().top > fold * 0.9;
    if (!below) { gsap.set(el, { opacity: 1, y: 0 }); return; }
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
      delay: Number(el.dataset.delay ?? 0),
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    const lines = splitLines(el);
    gsap.from(lines, {
      yPercent: 105, duration: 0.9, ease: 'power4.out', stagger: 0.09,
      scrollTrigger: el.getBoundingClientRect().top > window.innerHeight ? { trigger: el, start: 'top 85%', once: true } : undefined,
    });
  });
  document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((group) => {
    gsap.from(group.children, {
      y: 24, opacity: 0, scale: 0.9, duration: 0.6, ease: 'back.out(1.6)', stagger: 0.05,
      scrollTrigger: { trigger: group, start: 'top 85%', once: true },
    });
  });
}

function marquees() {
  document.querySelectorAll<HTMLElement>('[data-marquee]').forEach((track) => {
    track.innerHTML += track.innerHTML; // duplicate for a seamless loop
    const tween = gsap.to(track, { xPercent: -50, duration: Number(track.dataset.marquee || 30), ease: 'none', repeat: -1 });
    ScrollTrigger.create({
      onUpdate: (self) => gsap.to(tween, { timeScale: 1 + Math.min(Math.abs(self.getVelocity()) / 800, 3), duration: 0.2, overwrite: true, onComplete: () => { gsap.to(tween, { timeScale: 1, duration: 0.8 }); } }),
    });
  });
}

function progressBars() {
  document.querySelectorAll<HTMLElement>('[data-progress]').forEach((bar) => {
    const section = bar.closest('section') ?? bar;
    const steps = section.querySelectorAll<HTMLElement>('[data-step]');
    gsap.fromTo(bar, { scaleX: 0 }, {
      scaleX: 1, ease: 'none', transformOrigin: 'left center',
      scrollTrigger: {
        trigger: section, start: 'top 60%', end: 'bottom 70%', scrub: true,
        onUpdate: (st) => steps.forEach((s, i) => s.classList.toggle('is-lit', st.progress >= i / steps.length)),
      },
    });
  });
}

export function startMotion() {
  if (reduced) return;
  gsap.registerPlugin(ScrollTrigger);
  startLenis();
  document.fonts.ready.then(() => {
    document.documentElement.classList.add('js-motion');
    reveals();
    marquees();
    progressBars();
    ScrollTrigger.refresh();
  });
}
