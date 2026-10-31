import { defineConfig } from 'vite';
import { projects, films } from './src/content.js';
import { propertyCatalogs } from './src/property-content.js';
import { propertyCollections, propertyPath } from './src/property-catalog.js';
import { resolve } from 'node:path';
import guides from './data/search-guides.json' with { type: 'json' };
export default defineConfig({
  appType: 'mpa',
  build: {
    rollupOptions: {
      input: [
        'index.html', '404.html', 'properties/index.html', 'faqs/index.html', 'films/index.html', 'privacy/index.html', 'contact/index.html', 'rental/index.html',
        ...Object.entries(propertyCatalogs).flatMap(([collection,records])=>[
          `${propertyCollections[collection].path.slice(1)}index.html`,
          ...records.map(p=>`${propertyPath(p,collection).slice(1)}index.html`),
        ]),
        ...projects.map(p => `properties/${p.slug}/index.html`),
        ...guides.map(g => `${g.path.slice(1)}index.html`),
        ...films.map((_,i) => `films/film-${String(i+1).padStart(2,'0')}/index.html`),
      ].map(path => resolve(path)),
    },
  },
});
