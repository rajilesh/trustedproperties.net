import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { googleAdsHead } from '../src/tracking.js';

const excluded = new Set(['.git', 'node_modules', 'dist', 'tmp', 'references', 'templates', 'assets']);
const privacyText = 'We use Google Ads tagging to measure page views and successful property enquiries. Google may use cookies and receive information such as page URLs, advertising click identifiers and browser or device details. Our event code does not send the name, phone number or email address entered into the enquiry form.';

async function syncDirectory(directory) {
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const path = join(directory, entry.name);
    if (entry.isDirectory() && !excluded.has(entry.name) && !(directory === '.' && entry.name === 'Trusted-Properties')) {
      await syncDirectory(path);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      const original = await readFile(path, 'utf8');
      if (!/<\/head>/i.test(original)) continue;
      const html = (original.includes('<!-- GOOGLE_ADS_START -->')
        ? original.replace(/<!-- GOOGLE_ADS_START -->[\s\S]*?<!-- GOOGLE_ADS_END -->/, googleAdsHead)
        : original.replace(/<\/head>/i, `${googleAdsHead}</head>`))
        .replaceAll('This website does not use advertising or analytics cookies.', privacyText);
      if (html !== original) await writeFile(path, html);
    }
  }
}

await syncDirectory('.');
