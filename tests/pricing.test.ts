import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { priceLine, unitPrice, subtotal } from '../src/lib/pricing.ts';

const products = JSON.parse(readFileSync(new URL('../src/data/products.json', import.meta.url), 'utf8')).products;
const p = (slug: string) => products.find((x: any) => x.slug === slug);

test('base price for in-stock item', () => {
  const l = priceLine(products, { slug: 'm18-battery-mount-5-pack', quantity: 2, options: { Colour: 'Red' } });
  assert.equal(l.unit, 28);
  assert.equal(subtotal([l]), 56);
});

test('size option sets the price', () => {
  assert.equal(unitPrice(p('lithophane-photo-box'), { Size: '150 mm' }), 69);
  assert.equal(unitPrice(p('lithophane-photo-box'), { Size: '80 mm' }), 45);
  const l = priceLine(products, { slug: 'lithophane-photo-box', quantity: 1, options: {} });
  assert.equal(l.options.Size, '100 mm');
  assert.equal(l.unit, 55);
});

test('bulk tier and add-on and setup fee', () => {
  const l = priceLine(products, { slug: 'qr-review-stand', quantity: 3, options: { Link: 'g.page/x', 'NFC tap': 'Yes' }, files: ['uploads/2026-11/abc-logo.svg'] });
  assert.equal(l.unit, 20 + 15);
  assert.equal(l.setup, 15);
  const d = priceLine(products, { slug: 'desk-nameplate', quantity: 10, options: { Text: 'Sam Lee' } });
  assert.equal(d.unit, 22);
});

test('browser cannot set its own price or bad options', () => {
  const l = priceLine(products, { slug: 'on-air-light-box', quantity: 1, options: { price: '1' } as any });
  assert.equal(l.unit, 45);
  assert.throws(() => priceLine(products, { slug: 'm18-battery-mount-5-pack', quantity: 1, options: { Colour: 'Gold' } }), /not a valid colour/);
  assert.throws(() => priceLine(products, { slug: 'nope', quantity: 1 }), /Unknown product/);
  assert.throws(() => priceLine(products, { slug: 'on-air-light-box', quantity: 0 }), /Quantity/);
  assert.throws(() => priceLine(products, { slug: 'on-air-light-box', quantity: 999 }), /Quantity/);
  assert.throws(() => priceLine(products, { slug: 'led-name-sign', quantity: 1, options: {} }), /add the text/);
});

test('file keys are filtered', () => {
  const l = priceLine(products, { slug: 'pet-memorial-light', quantity: 1, options: { Text: 'Rex' }, files: ['uploads/2026-11/a.jpg', '../../etc/passwd', 'https://evil'] });
  assert.deepEqual(l.files, ['uploads/2026-11/a.jpg']);
});
