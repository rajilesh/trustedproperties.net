import { readFile, writeFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { propertyCollections, validatePropertyCatalog, propertyAssetPaths } from '../src/property-catalog.js';

const [collection, input] = process.argv.slice(2);
try {
  if (!propertyCollections[collection] || !input) throw new Error('Usage: npm run add-listing -- <resale|individual> path/to/property.json. Start with data/listing.example.json.');
  const path = new URL(`../data/${collection}-properties.json`, import.meta.url);
  const records = JSON.parse(await readFile(path,'utf8'));
  const property = JSON.parse(await readFile(resolve(input),'utf8'));
  property.slug ??= property.name?.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  validatePropertyCatalog([...records, property]);
  for (const asset of propertyAssetPaths(property)) await access(new URL('../public'+asset, import.meta.url));
  await writeFile(path, JSON.stringify([...records,property],null,2)+'\n');
  console.log(`Added ${property.name} to ${propertyCollections[collection].name}. Run npm run test:seo to build pages, sitemaps and text exports.`);
} catch (error) {
  console.error(`Listing was not added: ${error.message}`);
  process.exitCode = 1;
}
