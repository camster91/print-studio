import Stripe from 'stripe';
import type { Env } from './index.ts';

export const stripeClient = (key: string) => new Stripe(key, { httpClient: Stripe.createFetchHttpClient(), maxNetworkRetries: 2 });
export const jsonResponse = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
export type PrintLine = { slug: string; name: string; quantity: number; unit: number; setup: number; options: Record<string, string>; files: string[]; estimatedMaterialCost: number; printHours: number };
export type Snapshot = { id: string; createdAt: string; lines: PrintLine[]; attribution: Record<string, string> };
export type PaidOrder = Snapshot & { sessionId: string; paidAt: string; live: boolean; total: number; tax: number; shipping: number; discount: number; fee: number | null; customer: Stripe.Checkout.Session.CustomerDetails | null; delivery: unknown; shippingChoice: string; notifiedAt?: string };

export async function sendAlert(env: Env, subject: string, text: string, replyTo?: string) {
  if (!env.SEND_EMAIL || !env.NOTIFY_TO) throw new Error('Order notification is not configured');
  const { EmailMessage } = await import('cloudflare:email');
  const from = env.NOTIFY_FROM ?? 'requests@layerline.ca';
  const clean = (v: string) => v.replace(/[\r\n]/g, ' ');
  const raw = [`From: Layerline <${from}>`, `To: ${env.NOTIFY_TO}`, ...(replyTo ? [`Reply-To: ${clean(replyTo)}`] : []), `Subject: ${clean(subject)}`, `Message-ID: <${crypto.randomUUID()}@layerline.ca>`, `Date: ${new Date().toUTCString()}`, 'MIME-Version: 1.0', 'Content-Type: text/plain; charset=utf-8', '', text].join('\r\n');
  await env.SEND_EMAIL.send(new EmailMessage(from, env.NOTIFY_TO, raw));
}

export function orderEmail(order: PaidOrder) {
  return [order.live ? 'PAID ORDER' : 'TEST ORDER — DO NOT PRINT', order.id, `Stripe: ${order.sessionId}`, `Paid: ${order.paidAt}`, `Total CAD: ${(order.total / 100).toFixed(2)}`, `Tax: ${(order.tax / 100).toFixed(2)}; shipping: ${(order.shipping / 100).toFixed(2)}; discount: ${(order.discount / 100).toFixed(2)}`, `Shipping choice: ${order.shippingChoice}`, `Customer: ${JSON.stringify(order.customer)}`, `Deliver to: ${JSON.stringify(order.delivery)}`, '', ...order.lines.flatMap((line, i) => [`${i + 1}. ${line.quantity} × ${line.name} (${line.slug})`, `Unit CAD: ${line.unit}; setup CAD: ${line.setup}`, ...Object.entries(line.options).map(([k, v]) => `${k}: ${v}`), `Private R2 files: ${line.files.join(', ') || 'none — ask customer if needed'}`, '']), 'Check fit, artwork rights and LED approval before printing. Send a proof for personalised work.', 'Private requests and files: https://layerline.ca/admin/'].join('\n');
}

export async function stripeWebhook(req: Request, env: Env, notify: typeof sendAlert = sendAlert) {
  if (!env.STRIPE_WEBHOOK_SECRET || !env.STRIPE_SECRET_KEY || !env.UPLOADS || !env.SEND_EMAIL || !env.NOTIFY_TO) return jsonResponse({ error: 'Webhook not configured' }, 503);
  const raw = await req.text();
  if (raw.length > 1024 * 1024) return jsonResponse({ error: 'Too large' }, 413);
  const stripe = stripeClient(env.STRIPE_SECRET_KEY);
  let event: Stripe.Event;
  try { event = await stripe.webhooks.constructEventAsync(raw, req.headers.get('stripe-signature') ?? '', env.STRIPE_WEBHOOK_SECRET, 300, Stripe.createSubtleCryptoProvider()); }
  catch { return jsonResponse({ error: 'Invalid signature' }, 400); }
  if (!['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type)) return jsonResponse({ received: true });
  const session = event.data.object as Stripe.Checkout.Session;
  // This Stripe account is shared: ignore other businesses, unpaid and mismatched-mode events.
  if (session.metadata?.source !== 'layerline' || session.payment_status !== 'paid') return jsonResponse({ received: true });
  if (session.livemode !== env.STRIPE_SECRET_KEY.startsWith('sk_live_')) return jsonResponse({ error: 'Mode mismatch' }, 400);
  const id = session.metadata.order_id;
  if (!/^LL-[a-f0-9-]{36}$/.test(id ?? '')) return jsonResponse({ error: 'Missing order ID' }, 400);
  const bucket = env.UPLOADS;
  const month = new Intl.DateTimeFormat('en-CA',{timeZone:'America/Toronto',year:'numeric',month:'2-digit'}).format(new Date(event.created * 1000));
  const prefix = session.livemode ? 'orders' : 'test-orders';
  const indexKey = `order-index/${prefix}/${session.id}.json`;
  const fallbackKey = `${prefix}/${month}/${session.id}.json`;
  async function storedOrder() {
    const index = await bucket.get(indexKey);
    const key = index ? (await index.json<{key:string}>()).key : fallbackKey;
    const record = await bucket.get(key);
    return {key,order:record ? await record.json<PaidOrder>() : null};
  }
  // Look up by session before the short-lived draft: paid records outlive artwork/drafts.
  if ((await storedOrder()).order?.notifiedAt) return jsonResponse({ received: true });
  const lockKey = `locks/${session.id}.json`;
  const lock = await env.UPLOADS.put(lockKey, JSON.stringify({ at: Date.now() }), { onlyIf: { etagDoesNotMatch: '*' } });
  if (!lock) return jsonResponse({ error: 'Order processing; retry' }, 503);
  try {
    // Another event may have finished while this delivery was waiting for the lock.
    const {key,order:previous} = await storedOrder();
    if (previous?.notifiedAt) return jsonResponse({ received: true });
    const saved = await bucket.get(`pending/${id}.json`);
    const snapshot = saved ? await saved.json<Snapshot>() : previous;
    if (!snapshot) return jsonResponse({ error: 'Missing print record; retry or reconcile manually' }, 500);
    const full = await stripe.checkout.sessions.retrieve(session.id, { expand: ['shipping_cost.shipping_rate', 'payment_intent.latest_charge.balance_transaction'] });
    if (full.payment_status !== 'paid' || full.metadata?.order_id !== id || full.metadata?.source !== 'layerline') throw new Error('Invalid paid session');
    const intent = typeof full.payment_intent === 'object' ? full.payment_intent : null;
    const charge = intent && typeof intent.latest_charge === 'object' ? intent.latest_charge : null;
    const balance = charge && typeof charge.balance_transaction === 'object' ? charge.balance_transaction : null;
    const rate = full.shipping_cost?.shipping_rate;
    const order: PaidOrder = { ...previous, ...snapshot, sessionId: full.id, live: full.livemode, paidAt: previous?.paidAt ?? new Date(event.created * 1000).toISOString(), total: full.amount_total ?? 0, tax: full.total_details?.amount_tax ?? 0, discount: full.total_details?.amount_discount ?? 0, shipping: full.total_details?.amount_shipping ?? 0, fee: balance?.fee ?? null, customer: full.customer_details, delivery: full.collected_information?.shipping_details ?? null, shippingChoice: typeof rate === 'object' && rate ? rate.display_name ?? 'See Stripe' : 'See Stripe' };
    // Keep a stable record location even when a second paid event arrives in a later month.
    await bucket.put(indexKey,JSON.stringify({key}),{httpMetadata:{contentType:'application/json'}});
    await env.UPLOADS.put(key, JSON.stringify(order), { httpMetadata: { contentType: 'application/json' } });
    await notify(env, `${order.live ? '' : '[TEST] '}Paid ${order.id} — CAD ${(order.total / 100).toFixed(2)}`, orderEmail(order), order.customer?.email ?? undefined);
    order.notifiedAt = new Date().toISOString();
    await env.UPLOADS.put(key, JSON.stringify(order), { httpMetadata: { contentType: 'application/json' } });
    return jsonResponse({ received: true });
  } finally { await env.UPLOADS.delete(lockKey); }
}

export async function orderStatus(url: URL, env: Env) {
  const id = url.searchParams.get('session_id') ?? '';
  if (!/^cs_(test_|live_)?[a-zA-Z0-9]{10,250}$/.test(id) || !env.STRIPE_SECRET_KEY) return jsonResponse({ paid: false }, 400);
  const s = await stripeClient(env.STRIPE_SECRET_KEY).checkout.sessions.retrieve(id);
  if (s.metadata?.source !== 'layerline' || s.payment_status !== 'paid') return jsonResponse({ paid: false });
  // No customer details or file keys on this public confirmation endpoint.
  return jsonResponse({ paid: true, live: s.livemode, transaction_id: s.id, value: (s.amount_total ?? 0) / 100, currency: 'CAD' });
}
