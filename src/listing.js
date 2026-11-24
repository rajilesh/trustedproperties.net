import { projects } from './content.js';
import { renderProjectCard } from './render.js';

const sobhaProjectQueries = new Set([
  'sobha projects', 'sobha bangalore', 'sobha bengaluru', 'project sobha',
  'sobha projects bangalore', 'sobha projects bengaluru', 'sobha current projects',
  'sobha builders', 'sobha builders project', 'about sobha', 'sobha karnataka',
  'book sobha property',
]);
const sobhaApartmentQueries = new Set([
  'sobha apartments', 'best sobha flat', 'sobha bengaluru apartments',
  'sobha current apartments', 'flats of sobha', 'book sobha apartment', 'book sobha flat',
]);
const normalizeQuery = value => value.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();

export function matchesProjectSearch(project, query) {
  const term = normalizeQuery(query);
  if (!term) return true;
  if (project.developer === 'SOBHA') {
    if (sobhaProjectQueries.has(term)) return true;
    if (sobhaApartmentQueries.has(term)) return project.type === 'apartment';
    if (term === 'sobha ready to move') return /^ready to move/i.test(project.completion);
    // Keep neighbourhood and connectivity searches scoped to matching project copy.
    const place = term.replace(/^sobha /, '');
    if (place !== term && normalizeQuery(project.overview || '').includes(place)) return true;
  }
  return normalizeQuery([project.name,project.alternateName,project.location,project.developer,project.config].join(' ')).includes(term);
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
      const isSobha = developerName === 'SOBHA';
      if(heading?.firstChild) heading.firstChild.textContent=isSobha ? 'SOBHA Projects in Bengaluru' : `${developerName} developers.`;
      if(heading?.querySelector('em')) heading.querySelector('em').hidden=true;
      const description=`Explore ${developerName} projects in Bengaluru, with locations, configurations, guide prices, amenities and completion information.`;
      const lead=document.querySelector('#collection-description');
      if(lead){
        lead.hidden=!isSobha;
        if(isSobha) lead.textContent='Compare SOBHA apartments and residential plots by neighbourhood, guide price and possession date.';
      }
      const title=isSobha ? 'Filter SOBHA Apartments & Plots | Trusted Properties' : `${developerName} Developers in Bengaluru | Trusted Properties`;
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
