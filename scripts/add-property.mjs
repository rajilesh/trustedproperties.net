import { readFile, writeFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { validateCatalog } from '../src/catalog.js';
const input = process.argv[2];
if (!input) {
  console.error('Usage: npm run add-property -- path/to/property.json\nStart with data/property.example.json. Run npm run build after adding a property.');
  process.exitCode = 1;
} else {
  try {
    const catalogPath = new URL('../data/properties.json', import.meta.url);
    const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
    const property = JSON.parse(await readFile(resolve(input), 'utf8'));
    property.id ??= Math.max(...catalog.map(p=>p.id)) + 1;
    property.slug ??= property.name?.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    validateCatalog([...catalog,property]);
    for (const key of ['image','sourceUrl']) {
      if (property[key]?.startsWith('/')) await access(new URL('../public'+property[key].split('#')[0], import.meta.url));
    }
    await writeFile(catalogPath, JSON.stringify([...catalog,property],null,2)+'\n');
    console.log(`Added ${property.name}. Run npm run build to generate the listing, detail page and sitemap.`);
  } catch(error) { console.error(`Property was not added: ${error.message}`); process.exitCode=1; }
}
