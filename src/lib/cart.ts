import { site } from '../config/site';

export type CartItem = {
  /** Unique per slug + chosen options */
  key: string;
  slug: string;
  name: string;
  /** Display price only. The Worker re-prices every line from products.json. */
  price: number;
  quantity: number;
  options: Record<string, string>;
  /** R2 keys of uploaded photos/logos */
  files?: string[];
  madeToOrder?: boolean;
};

/* Backend: browser storage. The cart is just a list; checkout happens on Stripe. */
export function getCart(): CartItem[] {
  try {
    const v = JSON.parse(localStorage.getItem(site.cart.storageKey) ?? '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
function save(items: CartItem[]) {
  try { localStorage.setItem(site.cart.storageKey, JSON.stringify(items)); } catch {}
  window.dispatchEvent(new CustomEvent('cart:change', { detail: items }));
  return items;
}
export function addToCart(item: Omit<CartItem, 'key'>) {
  const key = [item.slug, ...Object.entries(item.options).map(([k, v]) => `${k}:${v}`), ...(item.files ?? [])].join('|');
  const items = getCart();
  const line = items.find((i) => i.key === key && !item.files?.length);
  if (line) line.quantity += item.quantity;
  else items.push({ ...item, key });
  return save(items);
}
export function setQuantity(key: string, quantity: number) {
  return save(getCart().map((i) => (i.key === key ? { ...i, quantity: Math.min(quantity, 50) } : i)).filter((i) => i.quantity > 0));
}
export function clearCart() { return save([]); }

export async function checkout(items: CartItem[]): Promise<string> {
  const res = await fetch(site.api.checkout, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      items: items.map(({ slug, quantity, options, files }) => ({ slug, quantity, options, files })),
      attribution: Object.fromEntries(
        [...new URLSearchParams(location.search)].filter(([k]) => /^(utm_|fbclid|gclid|ttclid)/.test(k)),
      ),
    }),
  });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error || 'Checkout is not available right now.');
  return data.url;
}

/* Analytics */
type Tracked = Window & { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void };
export function trackAdd(item: Omit<CartItem, 'key'>) {
  const w = window as Tracked;
  const value = item.price * item.quantity;
  const items = [{ item_id: item.slug, item_name: item.name, price: item.price, quantity: item.quantity }];
  if (site.analytics.gtmId && Array.isArray(w.dataLayer)) { w.dataLayer.push({ ecommerce: null }); w.dataLayer.push({ event: 'add_to_cart', ecommerce: { currency: site.currency, value, items } }); }
  w.gtag?.('event', 'add_to_cart', { currency: site.currency, value, items });
  w.fbq?.('track', 'AddToCart', { currency: site.currency, value, content_ids: [item.slug], content_type: 'product' });
}
