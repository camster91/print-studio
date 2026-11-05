import type { Product } from './products.ts';
import { defaultValue, valueLabel } from './pricing.ts';

/** One shared selection rule for server markup, gallery changes and bag thumbnails. */
export function productImages(product: Product, options: Record<string, string> = {}): string[] {
  const selected: Record<string,string> = {};
  const variants: Record<string,Record<string,string[]>> = {};
  for (const [name,values] of Object.entries(product.optionImages ?? {})) variants[name] = {...values};
  for (const choice of product.options.choices ?? []) {
    selected[choice.name] = valueLabel(defaultValue(choice,product.price));
    for (const value of choice.values) {
      if (typeof value !== 'string' && value.images !== undefined) (variants[choice.name] ??= {})[value.label] = value.images;
    }
  }
  const sizes = product.options.size;
  if (sizes?.length) {
    selected.Size = (sizes.find(s=>s.price===product.price) ?? sizes[0]).label;
    for (const size of sizes) if (size.images !== undefined) (variants.Size ??= {})[size.label] = size.images;
  }
  if (product.options.colour?.length) selected.Colour = product.options.colour[0];
  if (product.options.frameColour?.length) selected['Frame colour'] = product.options.frameColour[0];
  Object.assign(selected,options);
  let images = product.images ?? [];
  for (const [name,values] of Object.entries(variants)) {
    if (!Object.keys(values).length) continue;
    // A photo for a different fit/size must never be used as an unnamed fallback.
    if (!Object.hasOwn(values,selected[name])) return [];
    images = values[selected[name]];
  }
  return images;
}
