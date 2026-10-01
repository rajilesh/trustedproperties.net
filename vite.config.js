import { defineConfig } from 'vite';
import { projects, films } from './src/content.js';
import { resolve } from 'node:path';
export default defineConfig({
  appType: 'mpa',
  build: {
    rollupOptions: {
      input: [
        'index.html', '404.html', 'properties/index.html', 'faqs/index.html', 'films/index.html', 'privacy/index.html',
        ...projects.map(p => `properties/${p.slug}/index.html`),
        ...films.map((_,i) => `films/film-${String(i+1).padStart(2,'0')}/index.html`),
      ].map(path => resolve(path)),
    },
  },
});
