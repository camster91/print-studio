import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { priceLine, unitPrice, subtotal } from '../src/lib/pricing.ts';

const products = JSON.parse(readFileSync(new URL('../src/data/products.json', import.meta.url), 'utf8')).products;
const p = (slug: string) => products.find((x: any) => x.slug === slug);

test('base price for in-stock item', () => {
  const l = priceLine(products, { slug: 'battery-mounts', quantity: 2, options: { Colour: 'Red' } });
  assert.equal(l.unit, 28);
  assert.equal(l.options.Pack, '5-pack');
  assert.equal(l.options.Brand, 'Milwaukee M18');
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
  assert.throws(() => priceLine(products, { slug: 'battery-mounts', quantity: 1, options: { Colour: 'Gold' } }), /not a valid colour/);
  assert.throws(() => priceLine(products, { slug: 'nope', quantity: 1 }), /Unknown product/);
  assert.throws(() => priceLine(products, { slug: 'on-air-light-box', quantity: 0 }), /Quantity/);
  assert.throws(() => priceLine(products, { slug: 'on-air-light-box', quantity: 999 }), /Quantity/);
  assert.throws(() => priceLine(products, { slug: 'led-name-sign', quantity: 1, options: {} }), /add the text/);
});

test('file keys are filtered', () => {
  const l = priceLine(products, { slug: 'pet-memorial-light', quantity: 1, options: { Text: 'Rex' }, files: ['uploads/2026-11/a.jpg', '../../etc/passwd', 'https://evil'] });
  assert.deepEqual(l.files, ['uploads/2026-11/a.jpg']);
});

test('choices set or add to the price, and are checked', () => {
  assert.equal(unitPrice(p('battery-mounts'), { Pack: '10-pack', Brand: 'Makita 18V LXT' }), 49);
  assert.equal(unitPrice(p('battery-mounts'), { Pack: '1 mount' }), 8);
  assert.equal(unitPrice(p('stream-deck-stand'), { Device: 'Stream Deck XL' }), 29 + 6);
  assert.equal(unitPrice(p('led-name-sign'), { Size: 'Large · 45 cm' }), 79);
  assert.equal(unitPrice(p('lithophane-photo-box'), { Size: '150 mm', Light: 'Colour-changing + remote' }), 69 + 8);
  assert.throws(() => priceLine(products, { slug: 'tool-holders', quantity: 1, options: { Brand: 'Hilti' } }), /not a valid brand/);
  const l = priceLine(products, { slug: 'desk-nameplate', quantity: 1, options: { Text: 'Sam', 'Second line': 'x'.repeat(99) } });
  assert.equal(l.options['Second line'].length, 30);
  assert.equal(l.options.Style, 'Wedge');
});

test('long QR links stay complete and traversal or malformed files are rejected',()=>{
  const link='https://example.test/'+ 'x'.repeat(300);
  const line=priceLine(products,{slug:'qr-review-stand',quantity:1,options:{Link:link},files:['uploads/../private.json']});
  assert.equal(line.options.Link,link);assert.deepEqual(line.files,[]);
  assert.throws(()=>priceLine(products,{slug:'qr-review-stand',quantity:1,files:'bad' as never}),/Invalid files/);
});

import {cartDisplayPrice} from '../src/lib/cart-pricing.ts';
test('bag display reprices bulk quantities and keeps setup charged once',()=>{
  assert.equal(cartDisplayPrice(products,{slug:'qr-review-stand',quantity:3,options:{Link:'https://example.test'},files:['uploads/2026-11/logo.png']}),25);
  assert.equal(cartDisplayPrice(products,{slug:'qr-review-stand',quantity:1,options:{Link:'https://example.test'},files:['uploads/2026-11/logo.png']}),40);
  assert.equal(cartDisplayPrice(products,{slug:'desk-nameplate',quantity:10,options:{Text:'Cam'}}),22);
});
