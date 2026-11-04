import data from '../data/products.json';
import { site } from '../config/site';

export type ProductType = 'in-stock' | 'made-to-order';
export type SizeOption = { label: string; price: number; images?: string[] };
/** A choice value: plain label, or a label that sets the price (`price`) or adds to it (`add`). */
export type ChoiceValue = string | { label: string; price?: number; add?: number; images?: string[] };
export type Choice = { name: string; values: ChoiceValue[] };
export type Field = { name: string; label: string; placeholder?: string; max?: number; required?: boolean };
export { valueLabel, valuePrice, valueAdd, defaultValue } from './pricing';
import { valuePrice } from './pricing';
export type Product = {
  slug: string;
  productionReady?: boolean;
  name: string;
  fits?: string;
  type: ProductType;
  category: string;
  price: number;
  priceFrom?: boolean;
  bulk?: { min: number; price: number }[];
  setupFee?: number;
  addOns?: { label: string; price: number }[];
  materialCost: number;
  printHours: number;
  material: string;
  colours: number;
  led?: boolean;
  safety?: string;
  credit?: string;
  images?: string[];
  optionImages?: Record<string, Record<string, string[]>>;
  options: {
    colour?: string[];
    frameColour?: string[];
    size?: SizeOption[];
    photos?: number;
    text?: string;
    link?: string;
    logo?: boolean;
    place?: string;
    drawer?: string;
    choices?: Choice[];
    fields?: Field[];
  };
};

export const products = data.products as Product[];

export const categories: Record<string, string> = {
  gifts: 'Gifts',
  streamers: 'Streamers',
  desk: 'Desk',
  garage: 'Garage',
  home: 'Home',
  business: 'Business',
};

export const audience: Record<string, string> = {
  gifts: 'For gifts',
  streamers: 'For streamers',
  desk: 'For your desk',
  garage: 'For your garage',
  home: 'For your home',
  business: 'For business',
};

export const typeLabel: Record<ProductType, string> = {
  'in-stock': 'In stock',
  'made-to-order': 'Made to order',
};

/** Copy shown on cards and product pages. Edit freely. */
export const blurbs: Record<string, string> = {
  'battery-mounts': 'Click-in wall mounts for your tool batteries. Pick your brand. Screws included.',
  'tool-holders': 'Hang drills, drivers and saws by the battery slot. Pick your brand.',
  'skadis-hook-8-pack': 'Snap-in hooks for IKEA Skadis pegboards.',
  'under-desk-headphone-hook': 'Screws under any desk. Headphones off the desk.',
  'controller-wall-mount-4-pack': 'Show off four controllers on the wall.',
  'stream-deck-stand': 'Angled stand for your Stream Deck. Pick your model and angle.',
  'on-air-light-box': 'Classic ON AIR light box, or your own words. USB powered.',
  'moon-lamp-10cm': 'Real NASA elevation data, lit from inside.',
  'lithophane-photo-box': 'Four of your photos that glow when lit.',
  'pet-memorial-light': 'Your pet’s photo and name, softly lit.',
  'led-name-sign': 'Your name or channel, lit. USB powered.',
  'personalised-headphone-stand': 'A desk stand with your name on it.',
  'desk-nameplate': 'Two-colour wedge with your name and title.',
  'wall-name-sign': 'Raised lettering for your studio, office or home wall.',
  'qr-review-stand': 'Your logo plus a Google review or payment QR.',
  'cottage-lake-topo-map': 'Your lake or cottage area in 3D layers.',
  'gridfinity-drawer-kit': 'Bins and baseplate cut to fit your drawer.',
};

export const money = (n: number) =>
  new Intl.NumberFormat(site.locale, { style: 'currency', currency: site.currency, maximumFractionDigits: n % 1 ? 2 : 0 }).format(n);

export function priceLabel(p: Product) {
  if (p.options.size?.length) return `From ${money(Math.min(...p.options.size.map((s) => s.price)))}`;
  const priced = (p.options.choices ?? []).flatMap((c) => c.values.map(valuePrice)).filter((n): n is number => typeof n === 'number');
  if (priced.length) return `From ${money(Math.min(...priced))}`;
  if (p.priceFrom) return `From ${money(p.price)}`;
  if (p.bulk?.length && p.slug === 'qr-review-stand') return `${money(p.price)} · 3+ $20 each`;
  return money(p.price);
}

export function specLabel(p: Product) {
  const bits = [p.material, `${p.printHours < 2 ? p.printHours : Math.round(p.printHours)} H`];
  if (p.led) bits.push('USB LED');
  return bits.join(' · ');
}

export const bySlug = (slug: string) => products.find((p) => p.slug === slug);

export const filamentColours: Record<string, string> = {
  Black: '#141414',
  White: '#f4f2ee',
  Grey: '#8e8b84',
  Red: '#d92b2b',
  Yellow: '#ffd23f',
  Green: '#3a9b4a',
  'Nozzle Orange': '#ff5b1f',
  Lagoon: '#2ec4b6',
  'Signal Blue': '#3a86ff',
  Ultraviolet: '#8338ec',
};
