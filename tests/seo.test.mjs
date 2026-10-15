import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { parseHTML } from 'linkedom';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { projects, films, captions } from '../src/content.js';
import { site, faqs } from '../src/site.js';
import { propertyCatalogs } from '../src/property-content.js';
import guides from '../data/search-guides.json' with { type: 'json' };
const origin = site.origin;
const read = path => readFile(join('dist',path), 'utf8');
const parse = html => parseHTML(html).document;
async function files(directory) { const entries=await readdir(directory,{withFileTypes:true});return (await Promise.all(entries.map(e=>e.isDirectory()?files(join(directory,e.name)):join(directory,e.name)))).flat(); }
const htmlFiles=(await files('dist')).filter(path=>path.endsWith('.html'));
const docs=await Promise.all(htmlFiles.map(async file=>({file,doc:parse(await readFile(file,'utf8'))})));
const indexable=docs.filter(({doc})=>!doc.querySelector('meta[name="robots"]')?.content.includes('noindex'));
const schemas=doc=>JSON.parse(doc.querySelector('script[type="application/ld+json"]').textContent)['@graph'];
const normalize=s=>s.replace(/\s+/g,' ').trim();

test('all generated indexable pages have unique metadata, canonical URLs, H1s and parseable JSON-LD',()=>{
 assert.equal(indexable.length,projects.length+films.length+7+guides.length+Object.values(propertyCatalogs).reduce((n,records)=>n+1+records.length,0));const titles=new Set(),canonicals=new Set(),descriptions=new Set();
 for(const {file,doc} of indexable){
  assert.equal(doc.querySelectorAll('h1').length,1,file);assert.equal(doc.querySelectorAll('head > title').length,1,file);
  const title=doc.title,canonical=doc.querySelector('link[rel="canonical"]').getAttribute('href');
  const description=doc.querySelector('meta[name="description"]').getAttribute('content');
  assert.ok(title&&description&&canonical.startsWith(origin),file);assert.ok(!titles.has(title),`Duplicate title: ${title}`);assert.ok(!descriptions.has(description),`Duplicate description: ${description}`);assert.ok(!canonicals.has(canonical),`Duplicate canonical: ${canonical}`);
  titles.add(title);descriptions.add(description);canonicals.add(canonical);
  assert.equal(doc.querySelector('meta[property="og:url"]').getAttribute('content'),canonical,file);
  for(const prefix of ['og','twitter']){
   const attribute=prefix==='og'?'property':'name';
   assert.equal(doc.querySelector(`meta[${attribute}="${prefix}:title"]`).content,title,file);
   assert.equal(doc.querySelector(`meta[${attribute}="${prefix}:description"]`).content,description,file);
  }
  const path=new URL(canonical).pathname;
  assert.equal(canonical,origin+path,file);
  assert.equal(file,join('dist',path,'index.html'),`Canonical points to a different page: ${file}`);
  assert.equal(doc.querySelector('meta[name="twitter:card"]').getAttribute('content'),'summary_large_image',file);
  assert.equal(doc.querySelector('html').getAttribute('lang'),'en-IN',file);
  assert.match(doc.querySelector('meta[name="robots"]').getAttribute('content'),/^index, follow/,file);
  const graph=schemas(doc);assert.ok(graph.some(n=>n['@type']==='WebSite'),file);assert.ok(graph.some(n=>n['@id']===origin+'/#organization'),file);
  for(const node of graph){assert.ok(node['@type']);assert.ok(node['@id']);assert.ok(!node.aggregateRating&&!node.review&&!node.offers,`Unverified claim on ${file}`);}
 }
});

test('every internal anchor, canonical, media and asset URL resolves to a built file',async()=>{
 for(const {file,doc} of docs){
  const base=doc.querySelector('link[rel="canonical"]').href;
  for(const element of doc.querySelectorAll('a[href],link[href],img[src],source[src],script[src],video[poster]')){
   const raw=element.getAttribute('href')||element.getAttribute('src')||element.getAttribute('poster');
   const resolved=new URL(raw,base);if(resolved.origin!==origin)continue;
   const target=join('dist',decodeURIComponent(resolved.pathname)+(resolved.pathname.endsWith('/')?'index.html':''));
   await assert.doesNotReject(access(target),`${file} has broken URL ${raw}`);
   if(resolved.hash&&target.endsWith('.html')){const targetDoc=parse(await readFile(target,'utf8'));assert.ok(targetDoc.getElementById(decodeURIComponent(resolved.hash.slice(1))),`${file}: unknown anchor ${raw}`);}
  }
 }
});

test('all projects and media are discoverable in server-delivered HTML without JavaScript',()=>{
 const home=indexable.find(x=>x.file==='dist/properties/index.html').doc;
 assert.equal(home.querySelectorAll('.project-card').length,projects.length);
 const filmCollection=indexable.find(x=>x.file==='dist/films/index.html').doc;
 assert.equal(filmCollection.querySelectorAll('.film-card[href]').length,films.length);
 for(const p of projects){assert.ok(home.querySelector(`a[href="/properties/${p.slug}/"]`),p.name);const {doc}=indexable.find(x=>x.file===`dist/properties/${p.slug}/index.html`);assert.match(doc.querySelector('h1').textContent,new RegExp(p.name));const text=doc.body.textContent;for(const value of [p.location,p.config,p.size,p.price,p.details,p.completion])assert.ok(text.includes(value),`${p.name}: missing ${value}`);const graph=schemas(doc);const page=graph.find(n=>n['@type']==='RealEstateListing');assert.ok(page);assert.equal(page.mainEntity['@id'],`${origin}/properties/${p.slug}/#property`);assert.ok(graph.some(n=>n['@type']==='BreadcrumbList'));}
});

test('FAQ schema exactly matches the visible questions and answers',()=>{
 const {doc}=indexable.find(x=>x.file==='dist/faqs/index.html');const questions=schemas(doc).find(n=>n['@type']==='FAQPage').mainEntity;const details=[...doc.querySelectorAll('.faq-item')];assert.equal(questions.length,faqs.length);
 questions.forEach((q,i)=>{assert.equal(normalize(q.name),normalize(details[i].querySelector('summary').textContent));assert.equal(normalize(q.acceptedAnswer.text),normalize(details[i].querySelector('p').textContent));});
});

test('video schema describes a visible player on every dedicated watch page',async()=>{
 for(let i=1;i<=8;i++){const path=`dist/films/film-${String(i).padStart(2,'0')}/index.html`;const {doc}=docs.find(x=>x.file===path);const video=schemas(doc).find(n=>n['@type']==='VideoObject');assert.equal(video.name,doc.querySelector('h1').textContent);assert.equal(new URL(doc.querySelector('video source').getAttribute('src'),origin).href,video.contentUrl);assert.equal(new URL(doc.querySelector('video').getAttribute('poster'),origin).href,video.thumbnailUrl[0]);assert.match(video.duration,/^PT\d+M\d+S$/);if(!site.videoUploadDates[i])assert.ok(!video.uploadDate,'Never fabricate first-publication dates');}
});

test('sitemaps cover all canonical pages, visible content images and described videos',async()=>{
 const parser=new XMLParser();const names=['sitemap.xml','sitemap-pages.xml','sitemap-images.xml','sitemap-videos.xml'];const data={};
 for(const name of names){const xml=await read(name);assert.equal(XMLValidator.validate(xml),true,name);data[name]=parser.parse(xml);}
 assert.equal(data['sitemap.xml'].sitemapindex.sitemap.length,3);
 assert.deepEqual(data['sitemap.xml'].sitemapindex.sitemap.map(s=>s.loc),names.slice(1).map(n=>origin+'/'+n));
 const pageUrls=data['sitemap-pages.xml'].urlset.url.map(x=>x.loc).sort();assert.deepEqual(pageUrls,indexable.map(x=>x.doc.querySelector('link[rel="canonical"]').href).sort());assert.ok(!pageUrls.some(x=>x.includes('404')));
 const array=value=>value===undefined?[]:Array.isArray(value)?value:[value];
 const imageRows=array(data['sitemap-images.xml'].urlset.url);
 const videoRows=array(data['sitemap-videos.xml'].urlset.url);
 for(const rows of [imageRows,videoRows]){
  assert.equal(new Set(rows.map(r=>r.loc)).size,rows.length,'Duplicate sitemap page');
  for(const row of rows)assert.ok(pageUrls.includes(row.loc),`Noncanonical media page: ${row.loc}`);
 }
 for(const {file,doc} of indexable){
  const canonical=doc.querySelector('link[rel="canonical"]').href;
  const expected=[...new Set([...doc.querySelectorAll('main img[src],main video[poster]')].map(el=>new URL(el.getAttribute('src')||el.getAttribute('poster'),origin).href))].sort();
  const actual=array(imageRows.find(r=>r.loc===canonical)?.['image:image']).map(i=>i['image:loc']).sort();
  assert.deepEqual(actual,expected,`Missing or unrelated image on ${file}`);
 }
 const expectedVideos=indexable.flatMap(({doc})=>schemas(doc).filter(n=>n['@type']==='VideoObject'));
 assert.equal(videoRows.length,expectedVideos.length);
 for(const row of videoRows){
  const v=row['video:video'];const schema=expectedVideos.find(s=>s.url===row.loc);
  assert.equal(v['video:title'],schema.name);assert.equal(v['video:description'],schema.description);
  assert.equal(v['video:content_loc'],schema.contentUrl);assert.equal(v['video:thumbnail_loc'],schema.thumbnailUrl[0]);
  assert.ok(Number.isInteger(v['video:duration'])&&v['video:duration']>0&&v['video:duration']<=28800);
  assert.equal(v['video:publication_date'],schema.uploadDate);
 }
 for(const src of [...imageRows.flatMap(r=>array(r['image:image']).map(i=>i['image:loc'])),...videoRows.flatMap(r=>[r['video:video']['video:content_loc'],r['video:video']['video:thumbnail_loc']])]){
  const u=new URL(src);assert.equal(u.origin,origin);await access(join('dist',decodeURIComponent(u.pathname)));
 }
 const galleryImages=array(imageRows.find(r=>r.loc===origin+'/properties/sobha-one-world/')['image:image']).map(i=>i['image:loc']);
 for(let i=1;i<=captions.length;i++)assert.ok(galleryImages.includes(`${origin}/media/photo-${String(i).padStart(2,'0')}.webp`));
 const robots=await read('robots.txt');assert.match(robots,/User-agent: \*\nAllow: \//);assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));assert.ok(!robots.includes('Disallow: /'));
 assert.match(robots,/User-agent: OAI-SearchBot\nUser-agent: \*\nAllow: \//);
});

test('LLM text and structured data retain project sources and price qualifications',async()=>{
 const [llms,fullText,raw]=await Promise.all([read('llms.txt'),read('llms-full.txt'),read('data/projects.json')]);const data=JSON.parse(raw);assert.equal(data.projects.length,projects.length);assert.ok(data.sources.includes(origin+'/project-guide.pdf'));assert.ok(llms.includes('independent multi-developer platform'));
 for(const p of projects){assert.ok(llms.includes(`${origin}/properties/${p.slug}/`));assert.ok(fullText.includes(p.details));const md=await read(`properties/${p.slug}/index.md`);assert.ok(md.includes(p.priceNote));assert.ok(md.includes('availability is unconfirmed'));const record=data.projects.find(x=>x.id===p.id);assert.equal(record.details,p.details);}
});

test('404 and design previews are noindex and production has no localhost canonicals or generated placeholders',()=>{
 const {doc}=docs.find(x=>x.file==='dist/404.html');assert.match(doc.querySelector('meta[name="robots"]').getAttribute('content'),/noindex/);
 for(const file of ['dist/media/preview.html','dist/Trusted-Properties/trusted-properties-preview.html'])assert.match(docs.find(x=>x.file===file).doc.querySelector('meta[name="robots"]').content,/noindex/);
 for(const {file,doc} of docs){assert.ok(!doc.toString().includes('<!-- SEO_HEAD -->'),file);assert.ok(!doc.querySelector('link[rel="canonical"]').href.includes('localhost'),file);}
});

test('canonical host matches deployment and every authored guide is built and discoverable',async()=>{
 for(const file of ['CNAME','public/CNAME','dist/CNAME'])assert.equal((await readFile(file,'utf8')).trim(),new URL(origin).hostname,file);
 const redirects=await read('_redirects');assert.ok(redirects.includes(`https://trustedproperties.net/* ${origin}/:splat 301`));
 const llms=await read('llms.txt');
 for(const guide of guides){
  const {doc}=indexable.find(x=>x.file===`dist${guide.path}index.html`);
  assert.equal(doc.querySelector('h1').textContent,guide.heading);
  assert.ok(llms.includes(origin+guide.path));await access(`dist${guide.path}index.md`);
  assert.equal(doc.querySelectorAll('.project-card').length,guide.projectSlugs.length);
  if(guide.faqs.length){
   const schema=schemas(doc).find(n=>n['@type']==='FAQPage');
   const visible=[...doc.querySelectorAll('.faq-item')];assert.equal(visible.length,schema.mainEntity.length);
   schema.mainEntity.forEach((q,i)=>{assert.equal(normalize(q.name),normalize(visible[i].querySelector('summary').textContent));assert.equal(normalize(q.acceptedAnswer.text),normalize(visible[i].querySelector('p').textContent));});
  }
 }
});


test('each project retains its own source, developer and images',()=>{
 for(const p of projects){const {doc}=indexable.find(x=>x.file===`dist/properties/${p.slug}/index.html`);const page=schemas(doc).find(n=>n['@type']==='RealEstateListing');assert.equal(page.citation.url,new URL(p.sourceUrl,origin).href);assert.ok(doc.body.textContent.includes(p.developer));assert.ok(doc.querySelector(`a[href="${p.sourceUrl}"]`));}
 const {doc}=indexable.find(x=>x.file==='dist/index.html');for(const developer of new Set(projects.map(p=>p.developer))) assert.ok(doc.querySelector(`a[href="/properties/?developer=${encodeURIComponent(developer)}"]`),developer);assert.equal(doc.querySelector('.brand-logo').getAttribute('src'),'/media/logo.svg');
});
