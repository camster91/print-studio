// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const SITE = process.env.SITE_URL || 'https://layerline.ca';

export default defineConfig({
  site: SITE,
  output: 'static',
  compressHTML: true,
  integrations: [sitemap({ filter: (page) => !page.includes('/checkout/') && !page.includes('/admin') })],
  build: { inlineStylesheets: 'auto' },
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Anton',
      cssVariable: '--font-anton',
      fallbacks: ['Impact', 'sans-serif'],
      options: {
        variants: [{ src: ['./src/assets/fonts/anton-latin-400.woff2'], weight: '400', style: 'normal' }],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Inter',
      cssVariable: '--font-inter',
      fallbacks: ['system-ui', 'sans-serif'],
      options: {
        variants: [{ src: ['./src/assets/fonts/inter-latin-400-700.woff2'], weight: '400 700', style: 'normal' }],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'JetBrains Mono',
      cssVariable: '--font-mono',
      fallbacks: ['ui-monospace', 'monospace'],
      options: {
        variants: [
          {
            src: ['./node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2'],
            weight: '500',
            style: 'normal',
          },
        ],
      },
    },
  ],
});
