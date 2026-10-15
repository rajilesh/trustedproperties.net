import { readFile } from 'node:fs/promises';
import { parseHTML } from 'linkedom';
import { escapeHtml as escapeXML } from '../src/render.js';

const xml=content=>`<?xml version="1.0" encoding="UTF-8"?>\n${content}\n`;
const seconds=duration=>{
  const match=/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(duration);
  if (!match) throw new Error(`Invalid video duration: ${duration}`);
  return Number(match[1]||0)*3600+Number(match[2]||0)*60+Number(match[3]||0);
};

export async function generateSitemaps({pages,videos,save,url}) {
  const names=['sitemap-pages.xml','sitemap-images.xml','sitemap-videos.xml'];
  await save('public/sitemap.xml',xml(`<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${names.map(name=>`<sitemap><loc>${escapeXML(url('/'+name))}</loc></sitemap>`).join('')}</sitemapindex>`));
  await save('public/sitemap-pages.xml',xml(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(p=>`<url><loc>${escapeXML(url(p.path))}</loc></url>`).join('')}</urlset>`));
  // Read every generated page, so project images, gallery photos and posters cannot
  // fall out of the sitemap when page types or catalogues change.
  const images=await Promise.all(pages.map(async p=>{
    const {document}=parseHTML(await readFile(p.file,'utf8'));
    const media=[...new Set([...document.querySelectorAll('main img[src],main video[poster]')].map(el=>url(el.getAttribute('src')||el.getAttribute('poster'))))];
    return media.length?`<url><loc>${escapeXML(url(p.path))}</loc>${media.map(src=>`<image:image><image:loc>${escapeXML(src)}</image:loc></image:image>`).join('')}</url>`:'';
  }));
  await save('public/sitemap-images.xml',xml(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${images.join('')}</urlset>`));
  await save('public/sitemap-videos.xml',xml(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">${videos.map(v=>`<url><loc>${escapeXML(v.url)}</loc><video:video><video:thumbnail_loc>${escapeXML(v.thumbnailUrl[0])}</video:thumbnail_loc><video:title>${escapeXML(v.name)}</video:title><video:description>${escapeXML(v.description)}</video:description><video:content_loc>${escapeXML(v.contentUrl)}</video:content_loc><video:duration>${seconds(v.duration)}</video:duration>${v.uploadDate?`<video:publication_date>${escapeXML(v.uploadDate)}</video:publication_date>`:''}</video:video></url>`).join('')}</urlset>`));
}
