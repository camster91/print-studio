import type { Env } from './index.ts';

const recordKey = 'private-settings/stripe-v1';
type Credentials = { STRIPE_SECRET_KEY: string; STRIPE_WEBHOOK_SECRET: string };

async function wrappingKey(env: Env) {
  const hex = env.PAYMENT_SETTINGS_KEY;
  if (!hex || !/^[0-9a-f]{64}$/.test(hex)) throw new Error('Payment settings key unavailable');
  const bytes = Uint8Array.from(hex.match(/../g)!, pair => parseInt(pair, 16));
  return crypto.subtle.importKey('raw', bytes, 'AES-GCM', false, ['encrypt','decrypt']);
}

export async function paymentEnv(env: Env): Promise<Env> {
  const stored = await env.UPLOADS?.get(recordKey);
  if (!stored) return env;
  const bytes = new Uint8Array(await stored.arrayBuffer());
  const plain = await crypto.subtle.decrypt({name:'AES-GCM', iv:bytes.slice(0,12)}, await wrappingKey(env), bytes.slice(12));
  const credentials: Credentials = JSON.parse(new TextDecoder().decode(plain));
  return { ...env, ...credentials };
}

function page(message: string, status = 200) {
  return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Payment settings · Layerline</title>
<style>body{font:1rem/1.55 system-ui;color:#20201e;background:#f6f4ef;max-width:38rem;margin:3rem auto;padding:0 1rem}form{background:white;padding:1.5rem;border-radius:1rem}label,input{display:block}input{box-sizing:border-box;width:100%;padding:.7rem;margin:.4rem 0 1rem}button{padding:.7rem 1rem}a{color:inherit}</style>
<main><a href="/admin/">← Studio desk</a><h1>Payment settings</h1><p role="status">${message}</p><form method="post" action="/api/admin/payment-settings" autocomplete="off"><label>Live Stripe secret key<input type="password" required name="key" maxlength="256" placeholder="sk_live_…" autocomplete="new-password"></label><label>Live webhook signing secret<input type="password" required name="webhook" maxlength="256" placeholder="whsec_…" autocomplete="new-password"></label><p>Use the signing secret for <code>https://layerline.ca/api/stripe-webhook</code>. Saving replaces both payment credentials together.</p><button>Save live payment credentials</button></form></main></html>`, {status,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','referrer-policy':'no-referrer','content-security-policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",'x-content-type-options':'nosniff'}});
}

export async function paymentSettings(req: Request, env: Env) {
  if (!env.UPLOADS || !env.PAYMENT_SETTINGS_KEY) return page('Secure storage is unavailable.',503);
  if (req.method === 'GET') {
    const saved = await env.UPLOADS.head(recordKey);
    return page(saved ? 'Studio payment credentials are saved. Enter both keys to replace them.' : 'Enter the keys from the studio’s live Stripe account.');
  }
  if (req.method !== 'POST') return page('Method unavailable.',405);
  if (!req.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded')) return page('Submit the payment settings form.',415);
  const data = await req.formData();
  const key = String(data.get('key') ?? '').trim();
  const webhook = String(data.get('webhook') ?? '').trim();
  if (!/^sk_live_[A-Za-z0-9]{12,240}$/.test(key) || !/^whsec_[A-Za-z0-9]{12,240}$/.test(webhook)) return page('Enter a live secret key and webhook signing secret.',400);
  const account = await fetch('https://api.stripe.com/v1/account',{headers:{authorization:'Bearer '+key}});
  if (!account.ok || !(await account.json() as {charges_enabled?:boolean}).charges_enabled) return page('Stripe could not confirm that this account can accept charges. Check the key and account activation.',400);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plain = new TextEncoder().encode(JSON.stringify({STRIPE_SECRET_KEY:key,STRIPE_WEBHOOK_SECRET:webhook}));
  const cipher = await crypto.subtle.encrypt({name:'AES-GCM',iv}, await wrappingKey(env),plain);
  const bytes = new Uint8Array(12+cipher.byteLength);
  bytes.set(iv); bytes.set(new Uint8Array(cipher),12);
  await env.UPLOADS.put(recordKey,bytes);
  return new Response(null,{status:303,headers:{location:'/api/admin/payment-settings','cache-control':'no-store'}});
}
