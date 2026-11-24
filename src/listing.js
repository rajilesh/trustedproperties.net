import { developerCollections } from './developer-collections.js';
import { projects } from './content.js';
import { renderProjectCard } from './render.js';

const normalizeQuery = value => value.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const developerAliases = Object.fromEntries(Object.entries(developerCollections).map(([developer, collection]) => [
  developer, [developer, ...(collection.searchAliases || [])].map(normalizeQuery).sort((a,b) => b.length-a.length),
]));
const developerQueries = new Set([
  'projects', 'bangalore', 'bengaluru', 'projects bangalore', 'projects bengaluru',
  'current projects', 'builders', 'builders project', 'karnataka', 'property',
]);
const apartmentQueries = new Set([
  'apartment', 'apartments', 'flat', 'flats', 'bengaluru apartments', 'current apartments',
]);

export function matchesProjectSearch(project, query) {
  const term = normalizeQuery(query);
  if (!term) return true;
  const fields = normalizeQuery([project.name, project.alternateName, project.location, project.locality, project.developer, project.config].join(' '));
  const brandedQuery = term.replace(/^(project|about|book|best|flats of) /, '');
  const brand = developerAliases[project.developer]?.find(alias => brandedQuery === alias || brandedQuery.startsWith(alias+' '));
  if (!brand) return fields.includes(term);
  const subject = brandedQuery.slice(brand.length).trim();
  if (apartmentQueries.has(subject) || term.startsWith('flats of ')) return project.type === 'apartment';
  if (subject === 'villaments') return project.type === 'villament';
  if (subject === 'ready to move') return /^ready to move/i.test(project.completion);
  if (!subject || developerQueries.has(subject)) return true;
  // Search neighbourhoods and connectivity within the named developer’s projects.
  return fields.includes(term) || fields.includes(subject) || normalizeQuery(project.overview || '').includes(subject);
}

export function initListing({home = false} = {}) {
  const grid = document.querySelector('#project-grid');
  if (!grid) return;
  const fields = Object.fromEntries(['developer','location','type'].map(k=>[k,document.querySelector(`#${k}-filter`)]));
  const search = document.querySelector('#property-search');
  const showAll = document.querySelector('#show-all');
  const params = new URLSearchParams(location.search);
  const requestedDeveloper=params.get('developer');
  const requestedType=params.get('type');
  if(requestedType && [...fields.type.options].some(option=>option.value===requestedType)) fields.type.value=requestedType;
  const developerOption=[...fields.developer.options].find(option=>option.value===requestedDeveloper);
  if(developerOption){
    fields.developer.value=requestedDeveloper;
    if(!home){
      const developerName=developerOption.textContent.trim();
      const heading=document.querySelector('#collection-title');
      const developerLogos={
        'SOBHA':'sobha-listing.png',
        'Puravankara':'puravankara-listing.png',
        'Provident':'provident-listing.png',
        'DNR Group':'dnr-listing.png',
        'Prestige Group':'prestige-listing.png',
        'Brigade Group':'brigade-listing.png',
        'Sumadhura':'sumadhura-white.webp',
      };
      const logoFile=developerLogos[developerName];
      if(heading && logoFile){
        let logo=document.querySelector('#developer-listing-logo');
        if(!logo){
          logo=document.createElement('img');
          logo.id='developer-listing-logo';
          logo.className='developer-listing-logo';
          const titleRow=document.createElement('div');
          titleRow.className='developer-listing-title-row';
          heading.before(titleRow);
          titleRow.append(logo,heading);
        }
        logo.src=`/media/developer-logos/${logoFile}`;
        logo.alt=`${developerName} logo`;
        logo.hidden=false;
      }
      const collection = developerCollections[developerName];
      if(heading?.firstChild) heading.firstChild.textContent=collection ? `${developerName} Projects in Bengaluru` : `${developerName} developers.`;
      if(heading?.querySelector('em')) heading.querySelector('em').hidden=true;
      const description=collection?.description || `Explore ${developerName} projects in Bengaluru, with locations, configurations, guide prices, amenities and completion information.`;
      const lead=document.querySelector('#collection-description');
      if(lead){
        lead.hidden=!collection;
        if(collection) lead.textContent=description;
      }
      const title=collection ? `Filter ${developerName} Projects | Trusted Properties` : `${developerName} Developers in Bengaluru | Trusted Properties`;
      document.title=title;
      document.querySelector('meta[property="og:title"]')?.setAttribute('content',title);
      document.querySelector('meta[name="twitter:title"]')?.setAttribute('content',title);
      document.querySelector('meta[name="description"]')?.setAttribute('content',description);
      document.querySelector('meta[property="og:description"]')?.setAttribute('content',description);
      document.querySelector('meta[name="twitter:description"]')?.setAttribute('content',description);
    }
  }
  let expanded = !home;
  const featured = [1,11,14,18,12,16];
  const ordered = home ? [...projects].sort((a,b)=>(featured.includes(a.id)?featured.indexOf(a.id):100+a.id)-(featured.includes(b.id)?featured.indexOf(b.id):100+b.id)) : projects;
  function render() {
    const matches=ordered.filter(p=>(fields.developer.value==='all'||p.developer===fields.developer.value)&&(fields.location.value==='all'||p.region===fields.location.value)&&(fields.type.value==='all'||p.type===fields.type.value)&&matchesProjectSearch(p,search.value));
    const visible=expanded?matches:matches.slice(0,6);
    document.querySelector('#project-count').textContent=`${matches.length} ${matches.length===1?'property':'properties'}${visible.length<matches.length?` · Showing ${visible.length}`:''}`;
    grid.innerHTML=visible.length?visible.map(p=>renderProjectCard(p,home)).join(''):'<div class="empty-state"><h3>No matching properties</h3><p>Try a different search or reset the filters to explore the collection.</p></div>';
    if(showAll){showAll.hidden=matches.length<=6;showAll.textContent=expanded?'Show fewer projects ↑':`Explore all ${matches.length} projects ↗`;}
  }
  Object.values(fields).forEach(el=>el.addEventListener('change',()=>{expanded=!home;render();}));
  search.addEventListener('input',()=>{expanded=!home;render();});
  document.querySelector('#reset-filters').addEventListener('click',()=>{Object.values(fields).forEach(el=>el.value='all');search.value='';expanded=!home;render();});
  showAll?.addEventListener('click',()=>{expanded=!expanded;render();});
  document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{grid.classList.toggle('list-view',button.dataset.view==='list');document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}));
  document.querySelectorAll('[data-js-only]').forEach(el=>el.hidden=false);
  render();
}
