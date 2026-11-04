import {priceLine} from './pricing.ts';
import type {Product} from './products.ts';
export function cartDisplayPrice(products: Product[], item: {slug:string;quantity:number;options:Record<string,string>;files?:string[]}) {
  const line=priceLine(products,item);
  return line.unit + line.setup/line.quantity;
}
