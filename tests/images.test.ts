import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {productImages} from '../src/lib/images.ts';
import type {Product} from '../src/lib/products.ts';
const products=JSON.parse(readFileSync(new URL('../src/data/products.json',import.meta.url),'utf8')).products as Product[];
const battery=products.find(p=>p.slug==='battery-mounts')!;
test('an unmapped battery brand cannot show a different brand photo',()=>{
 assert.deepEqual(productImages(battery,{Brand:'Bosch 18V'}),[]);
});
test('default and chosen brands use only matching gallery images',()=>{
 assert.deepEqual(productImages(battery),['/renders/m18-battery-mount-5-pack.webp']);
 assert.deepEqual(productImages(battery,{Brand:'DeWalt 20V MAX'}),['/renders/dewalt-20v-battery-mount-6-pack.webp']);
});
test('choice and size images work in the product gallery and bag',()=>{
 const product={...battery,optionImages:{},options:{size:[{label:'Small',price:28,images:['/products/small.jpg','/products/small-detail.jpg']},{label:'Large',price:49,images:['/products/large.jpg']}]}};
 assert.deepEqual(productImages(product,{Size:'Large'}),['/products/large.jpg']);
 assert.deepEqual(productImages(product),['/products/small.jpg','/products/small-detail.jpg']);
});
test('a product without variant photography still has its own base photos',()=>{
 const product=products.find(p=>p.slug==='qr-review-stand')!;
 assert.deepEqual(productImages(product,{Shape:'Arch'}),product.images);
});
