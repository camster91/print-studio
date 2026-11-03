const DISCOUNT = 40;

/** Everything that changes per product or campaign. */
export const site = {
  name: 'Stride',
  /** The cart's Checkout button links here. The visitor's ad parameters
      (utm_*, fbclid, gclid, ttclid…) are appended automatically. */
  checkoutUrl: 'https://example.com/checkout',
  currency: 'USD',
  product: {
    id: 'sola-stride',
    name: 'Sola Stride',
    price: 299,
    image: '/assets/images/product-green.avif',
  },
  cart: {
    storageKey: 'Stride-cart',
  },
  discount: DISCOUNT,
  price: { now: '$299', was: '$499' },
  promo: { text: `Up to ${DISCOUNT}% OFF · code: FALL`, code: 'FALL' },
  /** Footer links: full URLs or paths on this site. */
  legal: {
    refund: '#',
    privacy: '#',
    terms: '#',
  },
  /** Each tag loads only when its ID is set. GTM: "GTM-XXXXXXX". Meta Pixel:
      digits only. GA4: "G-XXXXXXXXXX", left empty if GA4 runs inside GTM. */
  analytics: { gtmId: '', metaPixelId: '', ga4Id: '' },
};
