import { projects } from './content.js';
import { renderProjectCard } from './render.js';
export function initListing({home = false} = {}) {
  const grid = document.querySelector('#project-grid');
  if (!grid) return;
  const fields = Object.fromEntries(['developer','location','type'].map(k=>[k,document.querySelector(`#${k}-filter`)]));
  const search = document.querySelector('#property-search');
  const showAll = document.querySelector('#show-all');
  const params = new URLSearchParams(location.search);
  const requestedDeveloper=params.get('developer');
  const developerOption=[...fields.developer.options].find(option=>option.value===requestedDeveloper);
  if(developerOption){
    fields.developer.value=requestedDeveloper;
    if(!home){
      const developerName=developerOption.textContent.trim();
      const heading=document.querySelector('#collection-title');
      if(heading?.firstChild) heading.firstChild.textContent=`${developerName} developers.`;
      const description=`Explore ${developerName} projects in Bengaluru, with locations, configurations, guide prices, amenities and completion information.`;
      const lead=document.querySelector('#collection-description');
      if(lead) lead.textContent=description;
      const title=`${developerName} Developers in Bengaluru | Trusted Properties`;
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
    const term=search.value.trim().toLowerCase();
    const matches=ordered.filter(p=>(fields.developer.value==='all'||p.developer===fields.developer.value)&&(fields.location.value==='all'||p.region===fields.location.value)&&(fields.type.value==='all'||p.type===fields.type.value)&&(!term||[p.name,p.location,p.developer,p.config].join(' ').toLowerCase().includes(term)));
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
