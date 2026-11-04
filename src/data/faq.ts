import { site } from '../config/site';

export const faq = [
  { q: 'How long does an order take?', a: 'In-stock items ship in 1–2 business days or are ready for Toronto pickup. Made-to-order items take 5–7 business days after you approve the proof. Rush is 2–3 days for +25%.' },
  { q: 'Do I need a 3D file?', a: 'No. Send a photo, a sketch with measurements, or just describe it. If it needs to be designed from scratch we quote the design time separately (from $25).' },
  { q: 'Will I see it before you print it?', a: 'Yes. Every personalised and custom order gets a digital proof by email first. One change is included.' },
  { q: 'Is it strong enough for my garage or car?', a: 'Garage mounts are printed in PETG with thick walls. Anything that lives in a hot car is printed in ASA. Decor and desk items use PLA, which is for indoor use.' },
  { q: 'Are the LED products safe?', a: 'LED production requires a cUL/CSA/cETL-approved USB module and a matching approved power supply. We confirm the actual module before production. We never wire mains power.' },
  { q: 'Do you ship outside Canada?', a: `We ship across Canada (free over $${site.freeShippingFrom}) and offer free pickup in Toronto's east end. US orders are quoted on request because of new US customs rules.` },
  { q: 'What won’t you print?', a: 'Weapons or weapon parts, keys, copyrighted characters or logos you don’t own, real people’s faces without consent, and medical, car-safety or load-bearing parts.' },
];
