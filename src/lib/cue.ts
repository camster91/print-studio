/**
 * Every add-to-bag button catches the light: a glint crosses it shortly after it comes into
 * view, then again every few seconds while it stays in view, and stops when it
 * leaves. The glint itself is in global.css. Off with reduced motion.
 */

const EVERY = 6000;

if (matchMedia('(prefers-reduced-motion: no-preference)').matches && 'IntersectionObserver' in window) {
  const timers = new Map<Element, number>();

  const cue = (btn: HTMLElement) => {
    btn.classList.remove('is-cue');
    void btn.offsetWidth;
    btn.classList.add('is-cue');
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const btn = entry.target as HTMLElement;
        if (entry.isIntersecting && !timers.has(btn)) {
          window.setTimeout(() => cue(btn), 700);
          timers.set(btn, window.setInterval(() => cue(btn), EVERY));
        } else if (!entry.isIntersecting && timers.has(btn)) {
          clearInterval(timers.get(btn));
          timers.delete(btn);
        }
      }
    },
    { threshold: 0.6 },
  );

  document.querySelectorAll<HTMLElement>('[data-cue]').forEach((btn) => io.observe(btn));
}
