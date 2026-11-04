/**
 * Layerline Worker: serves the static Astro site and three API routes.
 *
 *   POST /api/checkout  cart -> Stripe Checkout Session (prices from products.json, never the browser)
 *   POST /api/upload    one photo/logo -> R2, returns its key (used by product pages)
 *   POST /api/quote     custom build / business sample request (+ files) -> R2 (+ optional email)
 *
 * Secrets / bindings (see README "Going live"):
 *   STRIPE_SECRET_KEY  secret  (sk_test_… while testing, sk_live_… when live)
 *   UPLOADS            R2 bucket for files and requests
 *   SEND_EMAIL         optional Email Routing binding; NOTIFY_TO = your verified address
 */
import data from '../src/data/products.json';
import { stripeWebhook, orderStatus } from './stripe';
import { adminApi, authoriseAdmin } from './admin';
import { priceLine, subtotal, type PricedLine } from '../src/lib/pricing';
import type { Product } from '../src/lib/products';

interface SendEmail { send(message: unknown): Promise<void> }
export interface Env {
  ASSETS: { fetch(req: Request): Promise<Response> };
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUD?: string;
  TAX_READY?: string;
  UPLOADS?: R2Bucket;
  SEND_EMAIL?: SendEmail;
  NOTIFY_TO?: string;
  NOTIFY_FROM?: string;
  FREE_SHIPPING_FROM?: string;
  SHIPPING_CANADA?: string;
}

const products = data.products as Product[];
const MAX_FILE = 25 * 1024 * 1024;
const OK_TYPES = /^(image\/(jpeg|png|webp|heic|heif|gif|svg\+xml)|application\/(pdf|octet-stream|sla|vnd\.ms-pki\.stl|step|vnd\.ms-package\.3dmanufacturing-3dmodel\+xml)|model\/(stl|3mf|step|obj)|text\/plain)$/;
const OK_EXT = /\.(jpe?g|png|webp|heic|heif|gif|svg|pdf|stl|3mf|step|stp|obj)$/i;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
      if (!await authoriseAdmin(req, env)) return json({ error: 'Private area. Sign in through Cloudflare Access.' }, 403);
      return env.ASSETS.fetch(req);
    }
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(req);
    try {
      if (url.pathname === '/api/stripe-webhook' && req.method === 'POST') return await stripeWebhook(req, env);
      if (url.pathname.startsWith('/api/admin/')) return await adminApi(req, env, url);
      if (url.pathname === '/api/order-status' && req.method === 'GET') return await orderStatus(url, env);
    } catch (e) { console.error('Private API or payment processing failed'); return json({ error: 'Please retry shortly.' }, 500); }
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    // Same-origin only (blocks other sites posting to these endpoints).
    const origin = req.headers.get('origin');
    if (origin && new URL(origin).host !== url.host) return json({ error: 'Forbidden' }, 403);
    try {
      if (url.pathname === '/api/checkout') return await checkout(req, env, url);
      if (url.pathname === '/api/upload') return await upload(req, env);
      if (url.pathname === '/api/quote') return await quote(req, env);
      return json({ error: 'Not found' }, 404);
    } catch (err) {
      const msg = err instanceof UserError ? err.message : 'Something went wrong. Please try again.';
      if (!(err instanceof UserError)) console.error(err);
      return json({ error: msg }, err instanceof UserError ? 400 : 500);
    }
  },
};

class UserError extends Error {}

/* ---------- Checkout ---------- */
export function buildCheckoutParams(lines: PricedLine[], origin: string, env: Pick<Env, 'FREE_SHIPPING_FROM' | 'SHIPPING_CANADA'>, attribution: Record<string, string> = {}) {
  const p = new URLSearchParams();
  const cents = (n: number) => String(Math.round(n * 100));
  p.set('mode', 'payment');
  p.set('payment_method_types[0]', 'card');
  p.set('success_url', `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`);
  p.set('cancel_url', `${origin}/shop?checkout=cancelled`);
  p.set('allow_promotion_codes', 'true');
  p.set('billing_address_collection', 'auto');
  p.set('phone_number_collection[enabled]', 'true');
  p.set('shipping_address_collection[allowed_countries][0]', 'CA');
  let i = 0;
  for (const l of lines) {
    p.set(`line_items[${i}][quantity]`, String(l.quantity));
    p.set(`line_items[${i}][price_data][currency]`, 'cad');
    p.set(`line_items[${i}][price_data][unit_amount]`, cents(l.unit));
    p.set(`line_items[${i}][price_data][product_data][name]`, l.product.name);
    if (l.description) p.set(`line_items[${i}][price_data][product_data][description]`, l.description);
    i++;
    if (l.setup) {
      p.set(`line_items[${i}][quantity]`, '1');
      p.set(`line_items[${i}][price_data][currency]`, 'cad');
      p.set(`line_items[${i}][price_data][unit_amount]`, cents(l.setup));
      p.set(`line_items[${i}][price_data][product_data][name]`, `Logo setup — ${l.product.name}`);
      i++;
    }
  }
  const sub = subtotal(lines);
  const free = Number(env.FREE_SHIPPING_FROM ?? 100);
  const ship = Number(env.SHIPPING_CANADA ?? 12);
  const options: [string, number, number, number][] = [
    ['Free pickup — Toronto (east end)', 0, 1, 2],
    [sub >= free ? 'Canada Post tracked — free' : 'Canada Post tracked', sub >= free ? 0 : ship, 3, 9],
  ];
  options.forEach(([name, amount, min, max], j) => {
    const k = `shipping_options[${j}][shipping_rate_data]`;
    p.set(`${k}[type]`, 'fixed_amount');
    p.set(`${k}[display_name]`, name);
    p.set(`${k}[fixed_amount][amount]`, cents(amount));
    p.set(`${k}[fixed_amount][currency]`, 'cad');
    p.set(`${k}[delivery_estimate][minimum][unit]`, 'business_day');
    p.set(`${k}[delivery_estimate][minimum][value]`, String(min));
    p.set(`${k}[delivery_estimate][maximum][unit]`, 'business_day');
    p.set(`${k}[delivery_estimate][maximum][value]`, String(max));
  });
  // Order details for you in the Stripe dashboard (500 chars per value, 50 keys max).
  lines.slice(0, 20).forEach((l, n) => {
    p.set(`metadata[line_${n + 1}]`, `${l.quantity}× ${l.product.slug} | ${Object.entries(l.options).map(([k, v]) => `${k}=${v}`).join('; ')}`.slice(0, 500));
    if (l.files.length) p.set(`metadata[files_${n + 1}]`, l.files.join(' ').slice(0, 500));
  });
  p.set('metadata[made_to_order]', String(lines.some((l) => l.product.type === 'made-to-order')));
  for (const [k, v] of Object.entries(attribution).slice(0, 8)) p.set(`metadata[${k.slice(0, 30)}]`, String(v).slice(0, 200));
  p.set('payment_intent_data[description]', `Layerline order: ${lines.map((l) => `${l.quantity}× ${l.product.name}`).join(', ')}`.slice(0, 1000));
  return p;
}

async function checkout(req: Request, env: Env, url: URL) {
  if (env.STRIPE_SECRET_KEY?.startsWith('sk_live_') && env.TAX_READY !== 'true') return json({ error: 'Live checkout is awaiting the studio’s tax setup. Please request a quote.' }, 503);
  if (!env.UPLOADS) return json({ error: 'Order records are not available. Please try later.' }, 503);
  if (!env.STRIPE_SECRET_KEY) return json({ error: 'Checkout isn’t switched on yet. Please email us to order.' }, 503);
  const body = (await req.json().catch(() => null)) as { items?: unknown[]; attribution?: Record<string, string> } | null;
  if (!body?.items?.length) throw new UserError('Your bag is empty.');
  if (body.items.length > 30) throw new UserError('Too many items in one order.');
  const lines = body.items.map((it) => {
    try { return priceLine(products, it as Parameters<typeof priceLine>[1]); } catch (e) { throw new UserError((e as Error).message); }
  });
  if (env.STRIPE_SECRET_KEY.startsWith('sk_live_') && lines.some(l=>!l.product.productionReady)) return json({ error: 'This product is still in sample testing. Please request a quote.' }, 409);
  const attribution = Object.fromEntries(Object.entries(body.attribution ?? {}).filter(([k]) => /^(utm_\w+|fbclid|gclid|ttclid)$/.test(k)));
  const params = buildCheckoutParams(lines, url.origin, env, attribution);
  const id = `LL-${crypto.randomUUID()}`;
  await env.UPLOADS.put(`pending/${id}.json`, JSON.stringify({ id, createdAt: new Date().toISOString(), attribution, lines: lines.map(l => ({ slug: l.product.slug, name: l.product.name, quantity: l.quantity, unit: l.unit, setup: l.setup, options: l.options, files: l.files, estimatedMaterialCost: l.product.materialCost, printHours: l.product.printHours })) }));
  params.set('metadata[source]', 'layerline');
  params.set('metadata[order_id]', id);
  // Live tax setup is confirmed separately before TAX_READY is enabled.
  if (env.STRIPE_SECRET_KEY.startsWith('sk_live_')) params.set('automatic_tax[enabled]', 'true');
  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, 'content-type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  const session = (await res.json()) as { url?: string; error?: { message?: string } };
  if (!res.ok || !session.url) {
    console.error('Stripe checkout failed');
    return json({ error: 'Checkout couldn’t start. Please try again in a minute.' }, 502);
  }
  return json({ url: session.url });
}

/* ---------- Uploads ---------- */
function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.\-]+/g, '-').replace(/-+/g, '-').slice(-60) || 'file';
}
function checkFile(f: File) {
  if (f.size > MAX_FILE) throw new UserError(`${f.name} is over 25 MB.`);
  if (!OK_EXT.test(f.name) || (f.type && !OK_TYPES.test(f.type))) throw new UserError(`${f.name} isn’t a supported file type.`);
}
async function upload(req: Request, env: Env) {
  if (!env.UPLOADS) return json({ error: 'Uploads aren’t set up yet.' }, 503);
  const form = await req.formData();
  const f = form.get('file');
  if (!(f instanceof File)) throw new UserError('No file received.');
  checkFile(f);
  const month = new Date().toISOString().slice(0, 7);
  const key = `uploads/${month}/${crypto.randomUUID()}-${safeName(f.name)}`;
  await env.UPLOADS.put(key, await f.arrayBuffer(), { httpMetadata: { contentType: f.type || 'application/octet-stream' } });
  return json({ key });
}

/* ---------- Quote requests ---------- */
export function requestId(now = Date.now()) {
  return `LL-${crypto.randomUUID()}`;
}

async function quote(req: Request, env: Env) {
  const form = await req.formData();
  if (String(form.get('company_website') ?? '')) return json({ id: requestId() }); // honeypot: pretend success
  const email = String(form.get('email') ?? '').trim();
  const name = String(form.get('name') ?? '').trim();
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new UserError('Please add your name and a valid email.');
  if (!env.UPLOADS && !env.SEND_EMAIL) return json({ error: 'Requests aren’t switched on yet. Please email hello@layerline.ca.' }, 503);

  const id = requestId();
  const fields: Record<string, string | string[]> = {};
  const files: File[] = [];
  for (const [k, v] of form.entries()) {
    if (v instanceof File) { if (v.size) files.push(v); continue; }
    if (k === 'company_website') continue;
    const val = String(v).slice(0, 2000);
    fields[k] = k in fields ? [...([] as string[]).concat(fields[k]), val] : val;
  }
  if (files.length > 10) throw new UserError('Please send 10 files or fewer.');
  files.forEach(checkFile);

  const saved: string[] = [];
  if (env.UPLOADS) {
    for (const f of files) {
      const key = `request-files/${id}/${crypto.randomUUID()}-${safeName(f.name)}`;
      await env.UPLOADS.put(key, await f.arrayBuffer(), { httpMetadata: { contentType: f.type || 'application/octet-stream' } });
      saved.push(key);
    }
    await env.UPLOADS.put(`requests/${id}/request.json`, JSON.stringify({ id, receivedAt: new Date().toISOString(), fields, files: saved }, null, 2), { httpMetadata: { contentType: 'application/json' } });
  }

  if (env.SEND_EMAIL && env.NOTIFY_TO) {
    try {
      const { EmailMessage } = await import('cloudflare:email');
      const from = env.NOTIFY_FROM ?? `requests@${new URL(req.url).hostname}`;
      const text = [`New ${fields.kind ?? 'request'} ${id}`, '', ...Object.entries(fields).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`), '', `Files (${saved.length}): ${saved.join(', ') || 'none'}`].join('\n');
      const raw = [`From: Layerline <${from}>`, `To: ${env.NOTIFY_TO}`, `Reply-To: ${email}`, `Subject: ${id} — ${fields.type ?? fields.kind ?? 'New request'} from ${name}`.replace(/[\r\n]/g, ' '), `Message-ID: <${id}.${Date.now()}@${new URL(req.url).hostname}>`, `Date: ${new Date().toUTCString()}`, 'MIME-Version: 1.0', 'Content-Type: text/plain; charset=utf-8', '', text].join('\r\n');
      await env.SEND_EMAIL.send(new EmailMessage(from, env.NOTIFY_TO, raw));
    } catch (e) {
      console.error('Email notify failed', e);
    }
  }
  return json({ id });
}
