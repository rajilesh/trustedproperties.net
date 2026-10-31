import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { parseHTML } from 'linkedom';
import { join } from 'node:path';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { site } from '../src/site.js';

// Run after deployment. Read-only HTTP requests; no Search Console account actions.
const parser=new XMLParser();
const array=value=>value===undefined?[]:Array.isArray(value)?value:[value];
const expected=parser.parse(await readFile('dist/sitemap-pages.xml','utf8')).urlset.url.map(r=>r.loc);
const localPages=new Map(await Promise.all(expected.map(async url=>{
  const {document}=parseHTML(await readFile(join('dist',new URL(url).pathname,'index.html'),'utf8'));
  return [url,document];
})));
const agents=['Googlebot','OAI-SearchBot'];
const report={checkedAt:new Date().toISOString(),origin:site.origin,expectedPages:expected.length,checks:[]};
const jobs=agents.flatMap(agent=>[
  ...['robots.txt','sitemap.xml','sitemap-pages.xml','sitemap-images.xml','sitemap-videos.xml'].map(file=>({agent,url:site.origin+'/'+file,file})),
  ...expected.map(url=>({agent,url})),
]);
async function check(job){
  const result={...job,issues:[]};
  try {
    const response=await fetch(job.url,{headers:{'User-Agent':job.agent},signal:AbortSignal.timeout(20000)});
    result.status=response.status;result.finalUrl=response.url;
    const text=await response.text();
    if(response.status!==200)result.issues.push(`HTTP ${response.status}`);
    if(response.url!==job.url)result.issues.push(`Redirected to ${response.url}`);
    if(/noindex/i.test(response.headers.get('x-robots-tag')||''))result.issues.push('X-Robots-Tag: noindex');
    if(job.file==='robots.txt'){
      if(!text.includes(`Sitemap: ${site.origin}/sitemap.xml`))result.issues.push('Sitemap points to a different host');
      if(!/^Allow:\s*\/$/m.test(text)||/^Disallow:\s*\/$/m.test(text))result.issues.push('Public crawling is not allowed');
    } else if(job.file){
      if(XMLValidator.validate(text)!==true)result.issues.push('Invalid XML');
      else {
        const data=parser.parse(text);
        const rows=job.file==='sitemap.xml'?array(data.sitemapindex?.sitemap):array(data.urlset?.url);
        const urls=rows.map(r=>r.loc);
        if(!urls.length)result.issues.push('Empty sitemap');
        if(new Set(urls).size!==urls.length)result.issues.push('Duplicate URLs');
        if(urls.some(url=>!url.startsWith(site.origin+'/')))result.issues.push('URLs use a different canonical host');
        if(job.file==='sitemap-pages.xml'){
          const missing=expected.filter(url=>!urls.includes(url));
          if(missing.length)result.issues.push(`${missing.length} expected canonical URLs missing`);
        }
      }
    } else {
      const {document}=parseHTML(text);
      const canonical=document.querySelector('link[rel="canonical"]')?.href;
      if(canonical!==job.url)result.issues.push(`Canonical is ${canonical||'missing'}`);
      if(/noindex/i.test(document.querySelector('meta[name="robots"]')?.content||''))result.issues.push('Page is noindex');
      if(!document.querySelector('head > title')?.textContent||!document.querySelector('meta[name="description"]')?.content)result.issues.push('Missing title or description');
      if(document.querySelectorAll('h1').length!==1)result.issues.push('Expected one H1');
      try{JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent);}catch{result.issues.push('Missing or invalid JSON-LD');}
      const local=localPages.get(job.url);
      for(const selector of ['head > title','meta[name="description"]','meta[property="og:url"]','meta[property="og:title"]','meta[property="og:description"]','meta[property="og:image"]','meta[name="twitter:title"]','meta[name="twitter:description"]','meta[name="twitter:image"]','script[type="application/ld+json"]']){
        const value=doc=>doc.querySelector(selector)?.getAttribute('content')||doc.querySelector(selector)?.textContent;
        if(value(document)!==value(local))result.issues.push(`Deployed ${selector} differs from the verified build`);
      }
      const normalize=text=>text.replace(/\s+/g,' ').trim();
      if(normalize(document.querySelector('main')?.textContent||'')!==normalize(local.querySelector('main')?.textContent||''))result.issues.push('Main page content differs from the verified build');
    }
  } catch(error){result.issues.push(error.message);}
  report.checks.push(result);
}
// Bound concurrency to avoid overloading the public host.
await Promise.all(Array.from({length:4},async()=>{while(jobs.length)await check(jobs.shift());}));
report.checks.sort((a,b)=>a.url.localeCompare(b.url)||a.agent.localeCompare(b.agent));
const failed=report.checks.filter(r=>r.issues.length);
report.summary={requests:report.checks.length,passed:report.checks.length-failed.length,failed:failed.length};
await mkdir('tmp',{recursive:true});
await writeFile('tmp/seo-live-audit.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report.summary));
const groups=new Map();
for(const check of failed)for(const issue of check.issues){const key=issue.startsWith('Canonical is ')?'Canonical points to another host or page':issue;groups.set(key,(groups.get(key)||0)+1);}
for(const [issue,count] of groups)console.log(`${count} checks: ${issue}`);
console.log('Full report: tmp/seo-live-audit.json');
if(failed.length)process.exitCode=1;
