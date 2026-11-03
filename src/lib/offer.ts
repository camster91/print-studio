// Carries the visitor's ad parameters onto every [data-offer] link and reports
// [data-track] clicks to whichever of GTM, Meta Pixel and GA4 is loaded.

const CARRIED = /^(utm_[a-z]+|fbclid|gclid|gbraid|wbraid|ttclid|msclkid|twclid|li_fat_id)$/;

type Tag = (...args: unknown[]) => void;
const w = window as unknown as { dataLayer?: unknown[]; fbq?: Tag; gtag?: Tag };

const carried = [...new URLSearchParams(location.search)].filter(([key]) => CARRIED.test(key));
if (carried.length) {
  document.querySelectorAll<HTMLAnchorElement>('a[data-offer]').forEach((link) => {
    const url = new URL(link.href, location.href);
    for (const [key, value] of carried) {
      if (!url.searchParams.has(key)) url.searchParams.set(key, value);
    }
    link.href = url.toString();
  });
}

document.addEventListener('click', (event) => {
  const cta = (event.target as Element | null)?.closest<HTMLElement>('[data-track]')?.dataset.track;
  if (!cta) return;
  if (Array.isArray(w.dataLayer)) w.dataLayer.push({ event: 'cta_click', cta });
  w.fbq?.('trackCustom', 'CTAClick', { cta });
  w.gtag?.('event', 'cta_click', { cta });
});
