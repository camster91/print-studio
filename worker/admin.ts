import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { Env } from './index.ts';
import { jsonResponse, type PaidOrder } from './stripe.ts';

export async function authoriseAdmin(req: Request, env: Env) {
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD || !/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(env.ACCESS_TEAM_DOMAIN)) return false;
  const token = req.headers.get('cf-access-jwt-assertion');
  if (!token) return false;
  try {
    const issuer = `https://${env.ACCESS_TEAM_DOMAIN}`;
    const { payload } = await jwtVerify(token, createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`)), { issuer, audience: env.ACCESS_AUD, algorithms: ['RS256'] });
    return payload.email === 'cameron@ashbi.ca';
  } catch { return false; }
}

export function csvCell(v: unknown) {
  let s = String(v ?? '');
  if (/^[\s]*[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replaceAll('"', '""')}"`;
}
const states = ['new', 'quoted', 'approved', 'printing', 'done'];
export async function adminApi(req: Request, env: Env, url: URL) {
  if (!await authoriseAdmin(req, env)) return jsonResponse({ error: 'Forbidden' }, 403);
  if (!env.UPLOADS) return jsonResponse({ error: 'Storage unavailable' }, 503);
  const bucket = env.UPLOADS;
  if (req.method !== 'GET' && req.headers.get('origin') !== url.origin) return jsonResponse({ error: 'Forbidden' }, 403);
  const route = url.pathname.slice('/api/admin/'.length);
  if (route === 'file' && req.method === 'GET') {
    const key = url.searchParams.get('key') ?? '';
    if (!/^(uploads|request-files|requests|orders|test-orders)\/[a-zA-Z0-9_./-]+$/.test(key) || key.includes('..')) return jsonResponse({ error: 'Invalid file' }, 400);
    const object = await bucket.get(key);
    if (!object) return jsonResponse({ error: 'File not found' }, 404);
    return new Response(object.body, { headers: { 'content-type': 'application/octet-stream', 'content-disposition': `attachment; filename="${key.split('/').pop()}"`, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } });
  }
  if (route === 'status' && req.method === 'POST') {
    const body = await req.json() as { id: string; status: string };
    if (!/^LL-[a-zA-Z0-9-]{6,40}$/.test(body.id) || !states.includes(body.status)) return jsonResponse({ error: 'Invalid status' }, 400);
    if (!await bucket.get(`requests/${body.id}/request.json`)) return jsonResponse({ error: 'Request not found' }, 404);
    await bucket.put(`statuses/${body.id}.json`, JSON.stringify({ status: body.status, updatedAt: new Date().toISOString() }));
    return jsonResponse({ saved: true });
  }
  const month = url.searchParams.get('month') ?? new Date().toISOString().slice(0, 7);
  if (!/^20\d{2}-(0[1-9]|1[0-2])$/.test(month)) return jsonResponse({ error: 'Invalid month' }, 400);
  if (route === 'expense' && req.method === 'POST') {
    const body = await req.json() as Record<string, unknown>;
    const fields = ['filament', 'led', 'packaging', 'postage', 'other', 'refunds', 'feeAdjustment'];
    const costs: Record<string, number | string> = { month, updatedAt: new Date().toISOString() };
    for (const field of fields) {
      const n = Number(body[field] ?? 0);
      if (!Number.isFinite(n) || n < 0 || n > 100000) return jsonResponse({ error: 'Costs must be positive CAD amounts' }, 400);
      costs[field] = Math.round(n * 100);
    }
    await bucket.put(`expenses/${month}.json`, JSON.stringify(costs));
    return jsonResponse({ saved: true });
  }
  if (route === 'list' && req.method === 'GET') {
    const kind = url.searchParams.get('kind') ?? 'requests';
    if (!['requests', 'orders', 'test-orders'].includes(kind)) return jsonResponse({ error: 'Invalid list' }, 400);
    const listing = await bucket.list({ prefix: kind === 'requests' ? 'requests/' : `${kind}/${month}/`, cursor: url.searchParams.get('cursor') ?? undefined, limit: 100 });
    const keys = listing.objects.filter(o => kind !== 'requests' || o.key.endsWith('/request.json'));
    const records = await Promise.all(keys.map(async o => {
      const obj = await bucket.get(o.key); if (!obj) return null;
      const record = await obj.json<Record<string, unknown>>();
      const status = record.id ? await bucket.get(`statuses/${record.id}.json`) : null;
      return { ...record, createdAt: record.createdAt, receivedAt: record.receivedAt, status: status ? (await status.json<{ status: string }>()).status : 'new', key: o.key };
    }));
    return jsonResponse({ records: records.filter(Boolean).sort((a, b) => String(b?.createdAt ?? b?.receivedAt).localeCompare(String(a?.createdAt ?? a?.receivedAt))), cursor: listing.truncated ? listing.cursor : null });
  }
  if ((route === 'export' || route === 'profit') && req.method === 'GET') {
    let cursor: string | undefined;
    const orders: PaidOrder[] = [];
    do {
      const page = await bucket.list({ prefix: `orders/${month}/`, cursor, limit: 100 });
      for (const o of page.objects) { const obj = await bucket.get(o.key); if (obj) orders.push(await obj.json<PaidOrder>()); }
      cursor = page.truncated ? page.cursor : undefined;
    } while (cursor);
    const expenseObj = await bucket.get(`expenses/${month}.json`);
    const costs = expenseObj ? await expenseObj.json<Record<string, number>>() : {};
    if (route === 'profit') {
      const sales = orders.reduce((n, o) => n + o.total - o.tax, 0);
      const knownFees = orders.reduce((n, o) => n + (o.fee ?? 0), 0);
      const spend = Object.entries(costs).filter(([k]) => !['month', 'updatedAt'].includes(k)).reduce((n, [,v]) => n + Number(v), 0);
      return jsonResponse({ month, sales: sales / 100, stripeFees: knownFees / 100, missingFeeCount: orders.filter(o => o.fee === null).length, costs, costsRecorded: !!expenseObj, net: (sales - knownFees - spend) / 100, goal: '70–100 CAD; provisional until all costs, refunds and fees are entered' });
    }
    const rows: unknown[][] = [['paid_at', 'order_id', 'stripe_session', 'sales_including_shipping_CAD', 'tax_CAD', 'shipping_charged_CAD', 'discount_CAD', 'Stripe_fee_CAD', 'utm_source', 'products']];
    for (const o of orders) rows.push([o.paidAt, o.id, o.sessionId, o.total / 100, o.tax / 100, o.shipping / 100, o.discount / 100, o.fee === null ? '' : o.fee / 100, o.attribution.utm_source, o.lines.map(l => `${l.quantity} × ${l.name}`).join('; ')]);
    return new Response(rows.map(r => r.map(csvCell).join(',')).join('\r\n'), { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="layerline-${month}.csv"`, 'cache-control': 'no-store' } });
  }
  return jsonResponse({ error: 'Not found' }, 404);
}
