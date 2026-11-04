import { site } from '../config/site';
import {track,campaign} from './analytics';
import {products} from './products';
import {cartDisplayPrice} from './cart-pricing';

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
  items=items.map(item=>({...item,price:cartDisplayPrice(products,item)}));
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
  track('begin_checkout',{currency:site.currency,value:items.reduce((n,i)=>n+i.price*i.quantity,0),items:items.map(i=>({item_id:i.slug,item_name:i.name,price:i.price,quantity:i.quantity}))});
  const res = await fetch(site.api.checkout, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      items: items.map(({ slug, quantity, options, files }) => ({ slug, quantity, options, files })),
      attribution: campaign(),
    }),
  });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error || 'Checkout is not available right now.');
  return data.url;
}

/* Analytics */
export function trackAdd(item: Omit<CartItem, 'key'>) {
  track('add_to_cart',{currency:site.currency,value:item.price*item.quantity,items:[{item_id:item.slug,item_name:item.name,price:item.price,quantity:item.quantity}]});
}
