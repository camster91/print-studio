const NBSP = ' ';
const NB_HYPHEN = '‑';

const isWord = (t: string) => /[\p{L}\p{N}]/u.test(t);

const hard = (w: string) => w.replace(/-/g, NB_HYPHEN);

function toWords(tokens: string[]): string[] {
  const words: string[] = [];
  let pending = '';
  for (const t of tokens) {
    if (!isWord(t)) {
      pending = pending ? `${pending}${NBSP}${t}` : t;
      continue;
    }
    words.push(pending ? `${pending}${NBSP}${t}` : t);
    pending = '';
  }
  if (pending) {
    if (words.length) words[words.length - 1] += `${NBSP}${pending}`;
    else words.push(pending);
  }
  return words;
}

export function noOrphan(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  const words = toWords(clean.split(' '));

  if (words.length < 2) return clean;
  if (words.length === 2) return words.map(hard).join(NBSP);

  return words.slice(0, -2).join(' ') + ' ' + words.slice(-2).map(hard).join(NBSP);
}

export function noOrphanLines(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  const words = toWords(clean.split(' '));

  if (words.length < 2) return clean;
  if (words.length <= 3) return words.map(hard).join(NBSP);

  const len = (from: number, to: number) =>
    words.slice(from, to).reduce((n, w) => n + w.length, 0) + (to - from - 1);

  const best: { max: number; triples: number; cut: number }[] = new Array(words.length + 1);
  best[words.length] = { max: 0, triples: 0, cut: 0 };
  for (let i = words.length - 1; i >= 0; i--) {
    let pick: { max: number; triples: number; cut: number } | null = null;
    for (const size of [2, 3]) {
      const rest = best[i + size];
      if (!rest) continue;
      const cand = {
        max: Math.max(len(i, i + size), rest.max),
        triples: rest.triples + (size === 3 ? 1 : 0),
        cut: i + size,
      };
      if (!pick || cand.max < pick.max || (cand.max === pick.max && cand.triples < pick.triples)) {
        pick = cand;
      }
    }
    best[i] = pick as { max: number; triples: number; cut: number };
  }

  const groups: string[] = [];
  for (let i = 0; i < words.length; i = best[i].cut) {
    groups.push(words.slice(i, best[i].cut).map(hard).join(NBSP));
  }
  return groups.join(' ');
}

export function noOrphanAll<T extends Record<string, unknown>>(
  items: T[],
  keys: (keyof T)[],
  tie: (text: string) => string = noOrphan,
): T[] {
  return items.map((item) => {
    const out = { ...item };
    for (const k of keys) {
      if (typeof out[k] === 'string') out[k] = tie(out[k] as string) as T[keyof T];
    }
    return out;
  });
}
