// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['leaflet', 'd3', '@observablehq/plot'],
      exclude: []
    },
    ssr: {
      noExternal: ['leaflet']
    }
  },

  adapter: netlify()
});