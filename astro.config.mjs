// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  compressHTML: false, // keep void-element trailing slashes so third-party badge verifiers match the exact snippet
  site: 'https://startups.co.ke',
  integrations: [sitemap()],
  build: {
    // Inline all CSS into <style> in the HTML head — removes the render-
    // blocking /_astro/*.css request PSI measured at ~890ms on mobile.
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()],
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  prefetch: {
    prefetchAll: true,
  },
});
