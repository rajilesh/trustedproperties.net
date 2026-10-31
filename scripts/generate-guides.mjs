import { parseHTML } from 'linkedom';
import guides from '../data/search-guides.json' with { type: 'json' };
import { projects } from '../src/content.js';
import { escapeHtml as e, renderProjectCard, projectPath } from '../src/render.js';

// Preserve the authored locality guidance while rebuilding cards from the live catalogue.
export async function generateGuides({page,save,url,webpage,breadcrumb,breadcrumbs,referenceNote}) {
  const texts=[];
  for (const guide of guides) {
    const selected=guide.projectSlugs.map(slug=>{
      const project=projects.find(p=>p.slug===slug);
      if (!project) throw new Error(`Unknown project ${slug} in ${guide.path}`);
      return project;
    });
    const links=`<nav class="guide-links" aria-label="Related property guides">${guide.related.map(([label,path])=>`<a href="${e(path)}">${e(label)}</a>`).join('')}</nav>`;
    const list={'@type':'ItemList','@id':url(guide.path+'#collection'),name:guide.heading,numberOfItems:selected.length,itemListElement:selected.map((p,i)=>({'@type':'ListItem',position:i+1,name:p.name,url:url(projectPath(p))}))};
    const content=`<section class="section detail-page search-page">${breadcrumbs(guide.breadcrumbs)}<div class="eyebrow">TRUSTED PROPERTIES / BANGALORE</div><h1>${e(guide.heading)}</h1><p class="page-lead">${e(guide.intro)}</p>${links}${selected.length?`<section class="search-projects"><h2>Projects to compare</h2><p class="source-note">${e(referenceNote)}</p><div class="project-grid">${selected.map(p=>renderProjectCard(p)).join('')}</div></section>`:''}<div class="guide-copy">${guide.sections.join('')}</div>${links}</section>`;
    await page(guide.path,guide.title,guide.description,content,[webpage(guide.path,guide.title,guide.description,selected.length?'CollectionPage':'WebPage',{breadcrumb:{'@id':url(guide.path+'#breadcrumbs')},...(selected.length?{mainEntity:{'@id':list['@id']}}:{})}),breadcrumb(guide.path,guide.breadcrumbs),...(selected.length?[list]:[]),...(guide.faqs.length?[{'@type':'FAQPage','@id':url(guide.path+'#faq'),mainEntity:guide.faqs}]:[])],{markdown:true});
    const sectionText=guide.sections.map(html=>{
      const {document}=parseHTML(`<html><body>${html}</body></html>`);
      return [...document.querySelectorAll('h2,h3,p,li,summary')].map(el=>`${/^H/.test(el.tagName)?'## ':''}${el.textContent.trim()}`).join('\n\n');
    }).join('\n\n');
    const text=`# ${guide.heading}\n\nCanonical page: ${url(guide.path)}\n\n${guide.intro}\n\n${selected.map(p=>`- [${p.name}](${url(projectPath(p))}): ${p.location}; ${p.config}; ${p.price} (${p.priceNote}).`).join('\n')}\n\n${sectionText}\n\n${guide.related.map(([label,path])=>`- [${label}](${url(path)})`).join('\n')}\n`;
    await save(`public${guide.path}index.md`,text);
    texts.push(text);
  }
  return texts;
}
