// No personalisation, contact details, file keys or advertising click IDs are tracked.
import { site } from '../config/site';
type AnalyticsWindow=Window & {dataLayer?: unknown[];gtag?:(...args:unknown[])=>void};
export function track(event:string, ecommerce:Record<string,unknown>){
  const w=window as AnalyticsWindow;
  if(localStorage.getItem('layerline-analytics-consent')!=='yes')return;
  if(site.analytics.gtmId && Array.isArray(w.dataLayer)){w.dataLayer.push({ecommerce:null});w.dataLayer.push({event,ecommerce});}
  else w.gtag?.('event',event,ecommerce);
}
export function campaign(){try{return JSON.parse(sessionStorage.getItem('layerline-campaign')??'{}');}catch{return {};}}
export function rememberCampaign(){const allowed=['utm_source','utm_medium','utm_campaign','utm_content'];const q=new URLSearchParams(location.search);const v=Object.fromEntries(allowed.filter(k=>q.has(k)).map(k=>[k,(q.get(k)??'').slice(0,100)]));if(Object.keys(v).length)try{sessionStorage.setItem('layerline-campaign',JSON.stringify(v));}catch{}}
