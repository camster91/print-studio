/**
 * Shared pricing + validation. Used by the product page (display) and by the
 * Worker (the real price sent to Stripe). The browser's prices are never trusted.
 */
import type { Product } from './products';

export type LineInput = {
  slug: string;
  quantity: number;
  options?: Record<string, string>;
  files?: string[];
};

export type PricedLine = {
  product: Product;
  quantity: number;
  unit: number; // CAD per item
  setup: number; // one-time CAD for this line
  description: string;
  options: Record<string, string>;
  files: string[];
};

const MAX_QTY = 50;
const MAX_TEXT = 60;

export function unitPrice(p: Product, options: Record<string, string> = {}, quantity = 1): number {
  let unit = p.price;
  const size = p.options.size?.find((s) => s.label === options.Size);
  if (size) unit = size.price;
  else if (p.bulk?.length) {
    const tier = [...p.bulk].sort((a, b) => b.min - a.min).find((t) => quantity >= t.min);
    if (tier) unit = tier.price;
  }
  for (const a of p.addOns ?? []) if (options[a.label] === 'Yes') unit += a.price;
  return Math.round(unit * 100) / 100;
}

export function priceLine(products: Product[], input: LineInput): PricedLine {
  const product = products.find((p) => p.slug === input.slug);
  if (!product) throw new Error(`Unknown product: ${String(input.slug).slice(0, 40)}`);
  const quantity = Math.floor(Number(input.quantity));
  if (!Number.isFinite(quantity) || quantity < 1 || quantity > MAX_QTY) throw new Error(`Quantity for ${product.name} must be 1–${MAX_QTY}.`);

  const raw = input.options ?? {};
  const options: Record<string, string> = {};
  const allowed: Record<string, string[] | 'text'> = {};
  if (product.options.size) allowed.Size = product.options.size.map((s) => s.label);
  if (product.options.colour) allowed.Colour = product.options.colour;
  if (product.options.frameColour) allowed['Frame colour'] = product.options.frameColour;
  if (product.options.text) allowed.Text = 'text';
  if (product.options.link) allowed.Link = 'text';
  if (product.options.place) allowed.Place = 'text';
  if (product.options.drawer) allowed.Drawer = 'text';
  allowed['Gift note'] = 'text';
  for (const a of product.addOns ?? []) allowed[a.label] = ['Yes', 'No'];

  for (const [k, v] of Object.entries(raw)) {
    const rule = allowed[k];
    if (!rule) continue; // ignore unknown keys
    const value = String(v ?? '').trim();
    if (!value) continue;
    if (rule === 'text') options[k] = value.slice(0, k === 'Gift note' ? 200 : MAX_TEXT);
    else if (rule.includes(value)) options[k] = value;
    else throw new Error(`"${value}" is not a valid ${k.toLowerCase()} for ${product.name}.`);
  }
  if (product.options.size && !options.Size) options.Size = product.options.size.find((s) => s.price === product.price)?.label ?? product.options.size[0].label;
  if (product.type === 'made-to-order' && product.options.text && !options.Text) throw new Error(`Please add the text for your ${product.name}.`);

  const files = (input.files ?? []).filter((f) => typeof f === 'string' && /^uploads\/[\w\-./]+$/.test(f)).slice(0, 10);
  const unit = unitPrice(product, options, quantity);
  const setup = product.setupFee && files.length ? product.setupFee : 0;
  const description = [
    ...Object.entries(options).map(([k, v]) => `${k}: ${v}`),
    files.length ? `${files.length} file(s) uploaded` : '',
    product.type === 'made-to-order' ? 'Made to order · proof by email before printing' : 'In stock',
  ].filter(Boolean).join(' · ').slice(0, 480);

  return { product, quantity, unit, setup, description, options, files };
}

export function subtotal(lines: PricedLine[]) {
  return lines.reduce((n, l) => n + l.unit * l.quantity + l.setup, 0);
}
