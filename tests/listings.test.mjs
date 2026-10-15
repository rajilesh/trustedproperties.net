import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, mkdir, copyFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseHTML } from 'linkedom';
import { propertyCatalogs } from '../src/property-content.js';
import { propertyCollections, propertyPath, propertyAssetPaths, validatePropertyCatalog } from '../src/property-catalog.js';
import { site } from '../src/site.js';

test('resale and individual pages, sources and media survive the production build and exports',async()=>{
  const [llms,full,sitemap,imageMap,videoMap]=await Promise.all(['llms.txt','llms-full.txt','sitemap-pages.xml','sitemap-images.xml','sitemap-videos.xml'].map(f=>readFile('dist/'+f,'utf8')));
  for (const [collection,records] of Object.entries(propertyCatalogs)) {
    const base=propertyCollections[collection].path;
    const {document:list}=parseHTML(await readFile('dist'+base+'index.html','utf8'));
    const exported=JSON.parse(await readFile(`dist/data/${collection}-properties.json`,'utf8'));
    assert.equal(list.querySelectorAll('[data-listing]').length,records.length);
    assert.equal(exported.length,records.length);
    assert.ok(llms.includes(site.origin+base));
    for (const p of records) {
      const path=propertyPath(p,collection);
      assert.ok(list.querySelector(`a[href="${path}"]`));
      const {document}=parseHTML(await readFile('dist'+path+'index.html','utf8'));
      assert.equal(document.querySelector('link[rel="canonical"]').href,site.origin+path);
      assert.equal(document.querySelector('meta[property="og:image"]').content,site.origin+p.image);
      assert.equal(document.querySelector('meta[property="og:image:alt"]').content,p.imageAlt);
      const graph=JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)['@graph'];
      const entity=graph.find(n=>n['@id']===site.origin+path+'#property');
      assert.equal(entity.address.addressLocality,p.city);
      assert.equal(entity.address.addressRegion,p.state);
      assert.ok(document.querySelector(`a[href="${p.sourceUrl}"]`));
      for (const [name,value] of p.facts) {assert.ok(document.body.textContent.includes(value),name);assert.ok(entity.additionalProperty.some(f=>f.name===name&&f.value===value));}
      for (const media of p.gallery) {assert.ok(document.querySelector(`img[src="${media.src}"]`));assert.ok(imageMap.includes(site.origin+media.src));}
      if(p.video){const video=graph.find(n=>n['@type']==='VideoObject');assert.equal(video.contentUrl,site.origin+p.video);assert.ok(document.querySelector(`video source[src="${p.video}"]`));assert.ok(videoMap.includes(site.origin+p.video));if(!p.videoUploadDate)assert.ok(!video.uploadDate);}
      assert.ok(llms.includes(site.origin+path));assert.ok(sitemap.includes(site.origin+path));assert.ok(full.includes(p.details));assert.ok(full.includes(p.verificationNote));
      const markdown=await readFile('dist'+path+'index.md','utf8');assert.ok(markdown.includes(p.sourceUrl));
      assert.equal(exported.find(record=>record.slug===p.slug).url,site.origin+path);
    }
  }
  const {document:individual}=parseHTML(await readFile('dist/individual-properties/index.html','utf8'));
  assert.ok(!individual.body.textContent.includes('Trifecta Esplanade'));
  assert.equal(propertyCatalogs.resale[0].gallery.length,6);
});

test('listing validation rejects unsafe routes, media, duplicate slugs and incomplete video metadata',()=>{
  const p=propertyCatalogs.resale[0];
  for(const patch of [{slug:'../bad'},{image:'javascript:alert(1)'},{sourceUrl:'//outside.example'},{videoDuration:0},{gallery:[{src:'/../secret',alt:'Image',caption:'Photo'}]},{facts:[['Missing value']]},{preferred:'9 BHK'}]) assert.throws(()=>validatePropertyCatalog([{...p,...patch}]));
  assert.throws(()=>validatePropertyCatalog([p,p]));
});

test('listing assets resolve identically from the repository root and production build',async()=>{
  for(const p of Object.values(propertyCatalogs).flat()) {
    for(const asset of propertyAssetPaths(p)) {
      const [source,root,built]=await Promise.all([`public${asset}`,asset.slice(1),`dist${asset}`].map(path=>readFile(path)));
      assert.deepEqual(root,source,`Missing or stale repository-root asset: ${asset}`);
      assert.deepEqual(built,source,`Missing or stale production asset: ${asset}`);
    }
  }
});

test('add-listing validates before writing and adds future records without manual page registration',async()=>{
  const root=await mkdtemp(join(tmpdir(),'trusted-listings-'));
  try {
    for(const dir of ['scripts','src','data','public/media'])await mkdir(join(root,dir),{recursive:true});
    for(const file of ['scripts/add-listing.mjs','src/property-catalog.js'])await copyFile(file,join(root,file));
    await writeFile(join(root,'package.json'),'{"type":"module"}');
    const catalogue=join(root,'data/resale-properties.json');await writeFile(catalogue,'[]\n');
    const p={...propertyCatalogs.resale[0],slug:'future-home',name:'Future home',image:'/media/home.webp',sourceUrl:'https://example.com/source',gallery:[]};
    for(const key of ['video','poster','floorPlan','videoDuration','videoNote'])delete p[key];
    const input=join(root,'new.json');await writeFile(input,JSON.stringify(p));
    const run=()=>spawnSync(process.execPath,[join(root,'scripts/add-listing.mjs'),'resale',input],{encoding:'utf8'});
    assert.equal(run().status,1,'Missing media should fail');assert.equal(await readFile(catalogue,'utf8'),'[]\n');
    await writeFile(join(root,'public/media/home.webp'),'test fixture');
    const result=run();assert.equal(result.status,0,result.stderr);const saved=await readFile(catalogue,'utf8');
    assert.equal(JSON.parse(saved)[0].slug,'future-home');
    assert.equal(run().status,1,'Duplicate route should fail');assert.equal(await readFile(catalogue,'utf8'),saved);
  } finally {await rm(root,{recursive:true,force:true});}
});
