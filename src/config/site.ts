/** Everything that changes per business setting. */
export const site = {
  name: 'Layerline Studio',
  shortName: 'Layerline',
  tagline: 'Printed in Toronto',
  email: 'hello@layerline.ca',
  instagram: '',
  etsy: '',
  currency: 'CAD',
  locale: 'en-CA',
  /** Holiday cutoff shown in banners. Set to '' to hide. */
  holidayCutoff: 'Dec 4',
  /** Free shipping in Canada at or above this subtotal (CAD). */
  freeShippingFrom: 100,
  shippingCanada: 12,
  minimumCustomJob: 25,
  /** Worker endpoints (same origin). */
  api: {
    checkout: '/api/checkout',
    quote: '/api/quote',
    upload: '/api/upload',
  },
  cart: { storageKey: 'layerline-cart' },
  legal: { refund: '/policies#returns', privacy: '/policies#privacy', terms: '/policies#terms' },
  /** Each tag loads only when its ID is set. */
  analytics: { gtmId: '', metaPixelId: '', ga4Id: '' },
};
