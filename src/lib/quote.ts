import { site } from '../config/site';

/** Sends a custom build or business request (with files) to the Worker. */
export async function submitQuote(data: FormData, kind: string): Promise<{ id: string }> {
  data.set('kind', kind);
  data.set('page', location.pathname);
  let res: Response;
  try {
    res = await fetch(site.api.quote, { method: 'POST', body: data });
  } catch {
    throw new Error(`Couldn't reach us. Please email ${site.email} instead.`);
  }
  const json = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
  if (!res.ok || !json.id) throw new Error(json.error || `Something went wrong. Please email ${site.email}.`);
  return { id: json.id };
}
