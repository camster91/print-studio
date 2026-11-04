import {test} from 'node:test';
import assert from 'node:assert/strict';
import Stripe from 'stripe';
import {stripeWebhook, orderEmail} from '../worker/stripe.ts';
import {authoriseAdmin, csvCell} from '../worker/admin.ts';
const secret='whsec_local_fixture_only';
const stripe=new Stripe('sk_test_local_fixture_only');
const payload=(metadata:Record<string,string>={source:'layerline'},paid='paid')=>JSON.stringify({id:'evt_fixture',type:'checkout.session.completed',created:Math.floor(Date.now()/1000),data:{object:{id:'cs_test_fixture',livemode:false,payment_status:paid,metadata}}});
const env={STRIPE_SECRET_KEY:'sk_test_local_fixture_only',STRIPE_WEBHOOK_SECRET:secret,UPLOADS:{},SEND_EMAIL:{},NOTIFY_TO:'local@example.test'} as never;
const req=(body:string,signature:string)=>new Request('https://layerline.ca/api/stripe-webhook',{method:'POST',headers:{'stripe-signature':signature},body});
function sign(body:string,timestamp=Math.floor(Date.now()/1000)){return stripe.webhooks.generateTestHeaderString({payload:body,secret,timestamp});}
test('webhook rejects a modified body and stale signatures',async()=>{const b=payload();assert.equal((await stripeWebhook(req(b+' ',sign(b)),env)).status,400);assert.equal((await stripeWebhook(req(b,sign(b,1)),env)).status,400);});
test('webhook ignores other Ashbi sessions and unpaid events',async()=>{for(const b of [payload({source:'other-business'}),payload({source:'layerline'},'unpaid')])assert.equal((await stripeWebhook(req(b,sign(b)),env)).status,200);});
test('paid order without full snapshot ID is rejected, not silently acknowledged',async()=>{const b=payload();assert.equal((await stripeWebhook(req(b,sign(b)),env)).status,400);});
test('admin fails closed without Access config or valid JWT',async()=>{assert.equal(await authoriseAdmin(new Request('https://layerline.ca/admin'),{} as never),false);assert.equal(await authoriseAdmin(new Request('https://layerline.ca/admin',{headers:{'cf-access-jwt-assertion':'forged'}}),{ACCESS_TEAM_DOMAIN:'camster91.cloudflareaccess.com',ACCESS_AUD:'fixture'} as never),false);});
test('CSV protects spreadsheet formulas and quotes',()=>{assert.equal(csvCell('=HYPERLINK("bad")'),'"\'=HYPERLINK(""bad"")"');assert.equal(csvCell('Hello, "Cam"'),'"Hello, ""Cam"""');});
test('print alert includes full text, file keys and test warning',()=>{const result=orderEmail({live:false,id:'LL-test',sessionId:'cs_test_123',paidAt:'2026-11-04',total:5500,tax:0,discount:0,shipping:0,shippingChoice:'Toronto pickup',customer:{email:'fixture@example.test',phone:'fixture'},delivery:{},lines:[{slug:'name',name:'Name sign',quantity:2,unit:27.5,setup:0,options:{Text:'Full text',Size:'Large'},files:['uploads/2026-11/photo.jpg']}]} as never);for(const text of ['TEST ORDER — DO NOT PRINT','Full text','Large','uploads/2026-11/photo.jpg','Toronto pickup','fixture@example.test'])assert.ok(result.includes(text));});

test('paid order stores full print details, retries failed mail and deduplicates repeat delivery',async()=>{
  const id='LL-12345678-1234-1234-1234-123456789abc';
  const body=payload({source:'layerline',order_id:id});
  const snapshot={id,createdAt:'2026-11-04T16:00:00Z',attribution:{utm_source:'fixture'},lines:[{slug:'qr-review-stand',name:'QR stand',quantity:3,unit:20,setup:15,options:{Link:'https://example.test/'+ 'a'.repeat(300)},files:['uploads/2026-11/photo.png'],estimatedMaterialCost:3,printHours:1}]};
  const memory=new Map<string,string>([[`pending/${id}.json`,JSON.stringify(snapshot)]]);
  const bucket={async get(key:string){const v=memory.get(key);return v?{async json(){return JSON.parse(v);}}:null;},async put(key:string,value:string,options?:{onlyIf?:unknown}){if(options?.onlyIf && memory.has(key))return null;memory.set(key,value);return {};},async delete(key:string){memory.delete(key);}};
  const e={...env as object,UPLOADS:bucket} as never;
  const original=globalThis.fetch;
  globalThis.fetch=async()=>new Response(JSON.stringify({id:'cs_test_fixture',object:'checkout.session',payment_status:'paid',livemode:false,metadata:{source:'layerline',order_id:id},amount_total:7500,total_details:{amount_tax:0,amount_shipping:0,amount_discount:0},customer_details:{email:'customer@example.test',phone:'555-0100'},collected_information:{shipping_details:{name:'Fixture',address:{country:'CA',city:'Toronto'}}},shipping_cost:{shipping_rate:{display_name:'Toronto pickup'}},payment_intent:{latest_charge:{balance_transaction:{fee:247}}}}),{headers:{'content-type':'application/json'}});
  let calls=0;
  try {
    await assert.rejects(()=>stripeWebhook(req(body,sign(body)),e,async()=>{throw new Error('temporary email failure');}),/temporary/);
    assert.ok([...memory.keys()].some(k=>k.startsWith('test-orders/')));
    assert.equal([...memory.keys()].filter(k=>k.startsWith('locks/')).length,0);
    assert.equal((await stripeWebhook(req(body,sign(body)),e,async(_e,subject,text)=>{calls++;assert.ok(subject.includes('[TEST]'));assert.ok(text.includes('a'.repeat(300)));assert.ok(text.includes('photo.png'));})).status,200);
    assert.equal((await stripeWebhook(req(body,sign(body)),e,async()=>{calls++;})).status,200);
    assert.equal(calls,1);
    assert.equal([...memory.keys()].filter(k=>k.startsWith('test-orders/')).length,1);
    const stored=JSON.parse([...memory.entries()].find(([k])=>k.startsWith('test-orders/'))![1]);assert.equal(stored.fee,247);assert.ok(stored.notifiedAt);
  } finally {globalThis.fetch=original;}
});
