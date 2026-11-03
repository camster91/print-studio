/**
 * Headings, labels and paragraphs marked `data-reveal` come in the first time
 * they scroll into view. A heading marked `data-reveal='lines'` rises line by
 * line from behind its own baseline; everything else lifts in, one after the
 * other. Only content still below the fold is armed, so nothing already on
 * screen blinks, and without scripts or with reduced motion it is all simply
 * there.
 */

const wantsMotion = matchMedia('(prefers-reduced-motion: no-preference)').matches;

function splitLines(el: HTMLElement) {
  const text = el.textContent?.trim() ?? '';
  el.dataset.text = text;
  el.textContent = '';
  // Split on ordinary spaces only: a no-break space keeps its two words
  // together here too, so the lines match the text once it is restored.
  const words = text.split(/[ \t\r\n]+/).map((word, i, all) => {
    const span = document.createElement('span');
    span.textContent = word;
    el.append(span);
    if (i < all.length - 1) el.append(' ');
    return span;
  });

  const lines: string[][] = [];
  let top = Number.NaN;
  for (const word of words) {
    if (!(Math.abs(word.offsetTop - top) < 3)) {
      lines.push([]);
      top = word.offsetTop;
    }
    lines[lines.length - 1].push(word.textContent ?? '');
  }

  el.textContent = '';
  lines.forEach((line, i) => {
    const mask = document.createElement('span');
    mask.className = 'reveal-line';
    const inner = document.createElement('span');
    inner.className = 'reveal-line__text';
    inner.style.setProperty('--line', String(i));
    inner.textContent = line.join(' ');
    mask.append(inner);
    el.append(mask);
  });
  return lines.length;
}

function restore(el: HTMLElement) {
  el.textContent = el.dataset.text ?? el.textContent;
  delete el.dataset.text;
  el.removeAttribute('data-armed');
  el.classList.remove('is-in');
}

if (wantsMotion && 'IntersectionObserver' in window) {
  const items = [...document.querySelectorAll<HTMLElement>('[data-reveal]')].filter(
    (el) => el.getBoundingClientRect().top > innerHeight,
  );

  const io = new IntersectionObserver(
    (entries) => {
      let order = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        io.unobserve(el);
        const delay = order++ * 120;
        el.style.setProperty('--reveal-delay', `${delay}ms`);
        if (el.dataset.reveal === 'lines') {
          const count = splitLines(el);
          setTimeout(() => restore(el), delay + 1100 + count * 90);
        }
        requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-in')));
      }
    },
    { rootMargin: '0px 0px -12% 0px' },
  );

  items.forEach((el) => {
    // A heading with markup inside (a line break, an italic word) rises as
    // one block: splitting it would lose that markup.
    if (el.dataset.reveal === 'lines' && el.children.length) el.dataset.reveal = '';
    el.setAttribute('data-armed', '');
    io.observe(el);
  });
}
