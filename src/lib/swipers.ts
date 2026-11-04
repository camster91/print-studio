import Swiper from 'swiper';
import { Navigation, Pagination, FreeMode, A11y, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';

/**
 * [data-swiper="cards"]   product cards: a carousel on phones, a grid on desktop
 * [data-swiper="rail"]    horizontal rail with arrows + pagination (LED signs, reviews)
 * [data-swiper="gallery"] product gallery with thumbnails
 * [data-swiper="hero"]    home hero: fading photo slider (autoplay off for reduced motion)
 */
export function startSwipers() {
  document.querySelectorAll<HTMLElement>('[data-swiper="hero"]').forEach((el) => {
    const root = el.closest('[data-swiper-root]') ?? el.parentElement!;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    new Swiper(el, {
      modules: [Pagination, A11y, Autoplay, EffectFade],
      effect: 'fade', fadeEffect: { crossFade: true }, speed: still ? 0 : 700, loop: true,
      autoplay: still ? false : { delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true },
      pagination: { el: root.querySelector<HTMLElement>('[data-pagination]'), clickable: true },
    });
  });

  document.querySelectorAll<HTMLElement>('[data-swiper="rail"]').forEach((el) => {
    const root = el.closest('[data-swiper-root]') ?? el.parentElement!;
    new Swiper(el, {
      modules: [Navigation, Pagination, FreeMode, A11y],
      slidesPerView: 1.15,
      spaceBetween: 16,
      freeMode: { enabled: true, sticky: true },
      grabCursor: true,
      navigation: { prevEl: root.querySelector<HTMLElement>('[data-prev]'), nextEl: root.querySelector<HTMLElement>('[data-next]') },
      pagination: { el: root.querySelector<HTMLElement>('[data-pagination]'), clickable: true },
      breakpoints: { 768: { slidesPerView: 2.2, spaceBetween: 20 }, 1200: { slidesPerView: 3.2, spaceBetween: 20 } },
    });
  });

  const mq = window.matchMedia('(max-width: 767px)');
  const cards: Swiper[] = [];
  const syncCards = () => {
    cards.splice(0).forEach((s) => s.destroy(true, true));
    if (!mq.matches) return;
    document.querySelectorAll<HTMLElement>('[data-swiper="cards"]').forEach((el) => {
      cards.push(new Swiper(el, { modules: [Pagination, A11y], slidesPerView: 1.15, spaceBetween: 12, pagination: { el: el.parentElement?.querySelector<HTMLElement>('[data-pagination]'), clickable: true } }));
    });
  };
  syncCards();
  mq.addEventListener('change', syncCards);

  document.querySelectorAll<HTMLElement>('[data-swiper="gallery"]').forEach((el) => {
    const thumbs = [...(el.parentElement?.querySelectorAll<HTMLButtonElement>('[data-thumb]') ?? [])];
    const sw = new Swiper(el, { modules: [A11y], slidesPerView: 1, spaceBetween: 0 });
    const mark = () => thumbs.forEach((t, i) => t.setAttribute('aria-current', String(i === sw.activeIndex)));
    thumbs.forEach((t, i) => t.addEventListener('click', () => sw.slideTo(i)));
    sw.on('slideChange', mark);
    mark();
  });
}
