import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPair,exportJWK,SignJWT} from 'jose';
import {adminApi} from '../worker/admin.ts';

test('private admin verifies JWT, lists requests, saves status/costs, downloads and exports profit',async()=>{
 const {publicKey,privateKey}=await generateKeyPair('RS256');const jwk=await exportJWK(publicKey);jwk.kid='fixture';jwk.alg='RS256';
 const token=await new SignJWT({email:'cameron@ashbi.ca'}).setProtectedHeader({alg:'RS256',kid:'fixture'}).setIssuer('https://camster91.cloudflareaccess.com').setAudience('fixture').setExpirationTime('5m').sign(privateKey);
 const memory=new Map<string,string>([['requests/LL-ABCDEF/request.json',JSON.stringify({id:'LL-ABCDEF',receivedAt:'2026-11-04',fields:{name:'Fixture'},files:[]})],['orders/2026-11/cs_fixture.json',JSON.stringify({id:'LL-order',paidAt:'2026-11-04',sessionId:'cs_fixture',total:11200,tax:1300,shipping:1200,discount:0,fee:300,attribution:{utm_source:'fixture'},lines:[{name:'Stand',quantity:1}]})],['uploads/2026-11/file.png','fixture file']]);
 const bucket={async get(key:string){const value=memory.get(key);return value?{body:value,async json(){return JSON.parse(value);}}:null;},async put(k:string,v:string){memory.set(k,v);return {};},async list({prefix}: {prefix:string}){return {objects:[...memory.keys()].filter(k=>k.startsWith(prefix)).map(key=>({key})),truncated:false};}};
 const env={ACCESS_TEAM_DOMAIN:'camster91.cloudflareaccess.com',ACCESS_AUD:'fixture',UPLOADS:bucket} as never;
 const oldFetch=globalThis.fetch;globalThis.fetch=async()=>new Response(JSON.stringify({keys:[jwk]}),{headers:{'content-type':'application/json'}});
 const call=async(path:string,method='GET',body?:object,origin='https://layerline.ca')=>{const url=new URL('https://layerline.ca/api/admin/'+path);const req=new Request(url,{method,headers:{'cf-access-jwt-assertion':token,origin,'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});return adminApi(req,env,url);};
 try{
  const list=await(await call('list?kind=requests')).json() as {records:{id:string}[]};assert.equal(list.records[0].id,'LL-ABCDEF');
  assert.equal((await call('status','POST',{id:'LL-ABCDEF',status:'printing'})).status,200);assert.equal(JSON.parse(memory.get('statuses/LL-ABCDEF.json')!).status,'printing');
  assert.equal((await call('status','POST',{id:'LL-ABCDEF',status:'done'},'https://evil.test')).status,403);
  assert.equal((await call('expense?month=2026-11','POST',{filament:10})).status,200);
  const profit=await(await call('profit?month=2026-11')).json() as {net:number;sales:number;costsRecorded:boolean};assert.equal(profit.sales,99);assert.equal(profit.net,86);assert.equal(profit.costsRecorded,true);
  const csv=await(await call('export?month=2026-11')).text();assert.ok(csv.includes('cs_fixture'));assert.ok(csv.includes('fixture'));
  assert.equal(await(await call('file?key=uploads/2026-11/file.png')).text(),'fixture file');
  assert.equal((await call('file?key=uploads/../other')).status,400);
 }finally{globalThis.fetch=oldFetch;}
});
