export function initPropertyListing() {
  const root=document.querySelector('[data-listing-collection]');
  if (!root) return;
  const search=root.querySelector('[data-listing-search]');
  const city=root.querySelector('[data-listing-city]');
  const type=root.querySelector('[data-listing-type]');
  const cards=[...root.querySelectorAll('[data-listing]')];
  const render=()=>{
    const term=search.value.trim().toLowerCase();
    let count=0;
    cards.forEach(card=>{
      const match=(!term||card.dataset.search.includes(term))&&(city.value==='all'||card.dataset.city===city.value)&&(type.value==='all'||card.dataset.type===type.value);
      card.hidden=!match;
      if(match)count++;
    });
    root.querySelector('[data-listing-count]').textContent=`${count} ${count===1?'property':'properties'}`;
    root.querySelector('[data-listing-empty]').hidden=count!==0;
  };
  search.addEventListener('input',render);
  city.addEventListener('change',render);
  type.addEventListener('change',render);
  root.querySelector('[data-listing-reset]').addEventListener('click',()=>{search.value='';city.value=type.value='all';render();});
  root.querySelector('[data-listing-filters]').hidden=false;
}
