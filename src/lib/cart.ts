import { site } from '../config/site';
import { noOrphan } from './typography';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

/* Backend */
export async function getCart(): Promise<CartItem[]> {
  return readLocal<CartItem[]>(site.cart.storageKey, []);
}

export async function addToCart(item: CartItem): Promise<CartItem[]> {
  const items = await getCart();
  const line = items.find((i) => i.id === item.id);
  if (line) line.quantity += item.quantity;
  else items.push(item);
  writeLocal(site.cart.storageKey, items);
  return items;
}

export async function updateQuantity(id: string, quantity: number): Promise<CartItem[]> {
  const items = (await getCart())
    .map((i) => (i.id === id ? { ...i, quantity } : i))
    .filter((i) => i.quantity > 0);
  writeLocal(site.cart.storageKey, items);
  return items;
}

export async function getFavorites(): Promise<string[]> {
  return readLocal<string[]>(`${site.cart.storageKey}-favorites`, []);
}

export async function saveFavorite(id: string, saved: boolean): Promise<void> {
  const ids = new Set(await getFavorites());
  if (saved) ids.add(id);
  else ids.delete(id);
  writeLocal(`${site.cart.storageKey}-favorites`, [...ids]);
}

function readLocal<T extends unknown[]>(key: string, fallback: T): T {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? 'null');
    return Array.isArray(value) ? (value as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/* Tracking */
type Tracked = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
};

// GTM reads the GA4 ecommerce shape from the dataLayer; gtag and the Pixel get their own calls.
const toGtm = (event: string, ecommerce: Record<string, unknown>) => {
  const w = window as Tracked;
  if (!site.analytics.gtmId || !Array.isArray(w.dataLayer)) return;
  w.dataLayer.push({ ecommerce: null });
  w.dataLayer.push({ event, ecommerce });
};

function trackAdd(item: CartItem) {
  const w = window as Tracked;
  const value = item.price * item.quantity;
  const items = [{ item_id: item.id, item_name: item.name, price: item.price, quantity: item.quantity }];
  toGtm('add_to_cart', { currency: site.currency, value, items });
  w.gtag?.('event', 'add_to_cart', { currency: site.currency, value, items });
  w.fbq?.('track', 'AddToCart', {
    currency: site.currency,
    value,
    content_ids: [item.id],
    content_name: item.name,
    content_type: 'product',
  });
}

function trackFavorite(id: string) {
  const w = window as Tracked;
  toGtm('add_to_wishlist', { currency: site.currency, items: [{ item_id: id }] });
  w.gtag?.('event', 'add_to_wishlist', { currency: site.currency, items: [{ item_id: id }] });
  w.fbq?.('track', 'AddToWishlist', { content_ids: [id], content_type: 'product' });
}

/* Drawer */
const DONE_MS = 2000;
const OPEN_MS = 450;
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: site.currency });

function itemFor(button: HTMLElement): CartItem {
  const options = [
    ...document.querySelectorAll<HTMLElement>('[data-cart-option][aria-pressed="true"], [data-cart-option]:checked'),
  ];
  const { id = '', name = '', price = '0', image } = button.dataset;
  return {
    id: [id, ...options.map((o) => o.dataset.id)].join('-'),
    name: options.length ? `${name} — ${options.map((o) => o.dataset.name).join(' / ')}` : name,
    price: Number(price),
    quantity: 1,
    image: options.find((o) => o.dataset.image)?.dataset.image ?? image,
  };
}

export function startCart() {
  const drawer = document.querySelector<HTMLDialogElement>('[data-cart]');
  const lines = document.querySelector<HTMLElement>('[data-cart-lines]');
  const template = document.querySelector<HTMLTemplateElement>('[data-cart-line]');
  const empty = document.querySelector<HTMLElement>('[data-cart-empty]');
  const foot = document.querySelector<HTMLElement>('[data-cart-foot]');
  const subtotal = document.querySelector<HTMLElement>('[data-cart-subtotal]');
  const status = document.querySelector<HTMLElement>('[data-cart-status]');
  const announce = (text: string) => status && (status.textContent = text);

  const paint = (items: CartItem[], bump = false) => {
    const count = items.reduce((n, i) => n + i.quantity, 0);
    document.querySelectorAll<HTMLElement>('[data-cart-count]').forEach((badge) => {
      badge.textContent = String(count);
      badge.hidden = count === 0;
      if (!bump) return;
      badge.classList.remove('is-bumped');
      void badge.offsetWidth;
      badge.classList.add('is-bumped');
    });
    document.querySelectorAll<HTMLElement>('[data-cart-open]').forEach((open) => {
      open.toggleAttribute('data-has-items', count > 0);
      open.setAttribute('aria-label', count ? `Cart, ${count} items` : 'Cart');
    });
    if (!lines || !template) return;
    lines.replaceChildren(
      ...items.map((item) => {
        const row = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
        row.querySelector('[data-line-name]')!.textContent = noOrphan(item.name);
        if (item.image) row.querySelector<HTMLImageElement>('[data-line-image]')!.src = item.image;
        row.querySelector('[data-line-price]')!.textContent = money.format(item.price * item.quantity);
        row.querySelector('[data-line-qty]')!.textContent = String(item.quantity);
        row.querySelectorAll<HTMLElement>('[data-line-step]').forEach((step) =>
          step.addEventListener('click', () => change(item, item.quantity + Number(step.dataset.lineStep))),
        );
        const remove = row.querySelector<HTMLElement>('[data-line-remove]')!;
        remove.setAttribute('aria-label', `Remove ${item.name}`);
        remove.addEventListener('click', () => change(item, 0));
        return row;
      }),
    );
    if (empty) empty.hidden = items.length > 0;
    if (foot) foot.hidden = items.length === 0;
    if (subtotal) subtotal.textContent = money.format(items.reduce((n, i) => n + i.price * i.quantity, 0));
  };

  const change = async (item: CartItem, quantity: number) => {
    try {
      paint(await updateQuantity(item.id, quantity));
      announce(quantity ? `${item.name}: ${quantity} in cart.` : `${item.name} removed from cart.`);
    } catch {
      announce('Could not update the cart. Please try again.');
    }
  };

  const open = () => {
    if (!drawer || drawer.open) return;
    drawer.showModal();
    document.documentElement.style.overflow = 'hidden';
  };
  const close = () => drawer?.close();
  document.querySelectorAll('[data-cart-open]').forEach((button) => button.addEventListener('click', open));

  document.querySelectorAll('[data-cart-close]').forEach((el) => el.addEventListener('click', close));
  drawer?.addEventListener('click', (event) => event.target === drawer && close());
  drawer?.addEventListener('close', () => (document.documentElement.style.overflow = ''));

  getCart().then((items) => paint(items));

  document.querySelectorAll<HTMLButtonElement>('[data-add-to-cart]').forEach((button) => {
    let timer = 0;
    button.addEventListener('click', async () => {
      if (button.dataset.state === 'adding') return;
      clearTimeout(timer);
      button.dataset.state = 'adding';
      const item = itemFor(button);
      try {
        const items = await addToCart(item);
        paint(items, true);
        trackAdd(item);
        button.dataset.state = 'added';
        window.setTimeout(open, OPEN_MS);
        announce(`${item.name} added to cart.`);
      } catch {
        button.dataset.state = 'error';
        announce('Could not add to cart. Please try again.');
      }
      timer = window.setTimeout(() => delete button.dataset.state, DONE_MS);
    });
  });

  getFavorites().then((favorites) => {
    document.querySelectorAll<HTMLButtonElement>('[data-favorite]').forEach((button) => {
      const id = button.dataset.favorite ?? '';
      button.setAttribute('aria-pressed', String(favorites.includes(id)));
      button.addEventListener('click', async () => {
        const saved = button.getAttribute('aria-pressed') !== 'true';
        button.setAttribute('aria-pressed', String(saved));
        try {
          await saveFavorite(id, saved);
          if (saved) trackFavorite(id);
          announce(saved ? 'Saved to favorites.' : 'Removed from favorites.');
        } catch {
          button.setAttribute('aria-pressed', String(!saved));
          announce('Could not update favorites. Please try again.');
        }
      });
    });
  });
}
