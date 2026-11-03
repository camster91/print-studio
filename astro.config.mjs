// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const SITE = process.env.SITE_URL || 'https://example.com';

export default defineConfig({
  site: SITE,
  output: 'static',
  compressHTML: true,
  integrations: [sitemap()],
  build: { inlineStylesheets: 'always' },
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Anton',
      cssVariable: '--font-anton',
      fallbacks: ['sans-serif'],
      options: {
        variants: [{ src: ['./src/assets/fonts/anton-latin-400.woff2'], weight: '400', style: 'normal' }],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Inter',
      cssVariable: '--font-inter',
      fallbacks: ['sans-serif'],
      options: {
        variants: [
          { src: ['./src/assets/fonts/inter-latin-400-700.woff2'], weight: '400 700', style: 'normal' },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Geist',
      cssVariable: '--font-geist',
      fallbacks: ['sans-serif'],
      options: {
        variants: [
          { src: ['./src/assets/fonts/geist-500-footer.woff2'], weight: '500', style: 'normal' },
        ],
      },
    },
  ],
});
