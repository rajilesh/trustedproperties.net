import test from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseHTML } from 'linkedom';
import { googleAdsId, enquiryConversionId, trackEnquiryConversion } from '../src/tracking.js';

async function htmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(path));
    else if (entry.name.endsWith('.html')) files.push(path);
  }
  return files;
}

test('every built page loads one tag and queues one page view without an enquiry conversion', async () => {
  const files = await htmlFiles('dist');
  assert.ok(files.length > 0);
  for (const file of files) {
    const {document} = parseHTML(await readFile(file, 'utf8'));
    assert.equal(document.head.querySelectorAll(`script[src="https://www.googletagmanager.com/gtag/js?id=${googleAdsId}"]`).length, 1, file);
    const scripts = [...document.head.querySelectorAll('script:not([src])')].filter(script => script.textContent.includes("gtag('config'"));
    assert.equal(scripts.length, 1, file);
    const context = {dataLayer: []};
    context.window = context;
    runInNewContext(scripts[0].textContent, context);
    const events = JSON.parse(JSON.stringify(context.dataLayer.map(args => Array.from(args))));
    assert.deepEqual(events.filter(args => args[0] === 'config'), [['config', googleAdsId, {send_page_view: false}]], file);
    assert.deepEqual(events.filter(args => args[0] === 'event'), [['event', 'page_view', {send_to: googleAdsId}]], file);
  }
});

test('enquiry conversion sends the supplied identifier without form contact details', () => {
  const original = globalThis.window;
  const calls = [];
  try {
    globalThis.window = {gtag: (...args) => calls.push(args)};
    trackEnquiryConversion();
    assert.deepEqual(calls, [['event', 'conversion', {send_to: enquiryConversionId}]]);
  } finally {
    if (original === undefined) delete globalThis.window;
    else globalThis.window = original;
  }
});

test('missing or failing tracking cannot reject an accepted enquiry', () => {
  const original = globalThis.window;
  try {
    globalThis.window = {};
    assert.doesNotThrow(trackEnquiryConversion);
    globalThis.window.gtag = () => {throw new Error('Blocked tracking');};
    assert.doesNotThrow(trackEnquiryConversion);
  } finally {
    if (original === undefined) delete globalThis.window;
    else globalThis.window = original;
  }
});
