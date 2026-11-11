// Astro config. Set BASE_PATH when the site is served from a sub-path, e.g. BASE_PATH=/TheRunningAtlas for GitHub Pages.
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: process.env.SITE_URL || 'https://example.com',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'ignore',
  integrations: [mdx()],
  build: { inlineStylesheets: 'auto' },
  // Three.js alone is about 600 kB minified; it is shared by the 3D pages and cached.
  vite: { build: { chunkSizeWarningLimit: 900 } },
});
