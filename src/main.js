import { initEnquiry } from './enquiry.js';
import { projects, captions, films } from './content.js';
import { escapeHtml } from './render.js';
const $ = (s) => document.querySelector(s);
const openDialog=(dialog)=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());dialog.showModal();};
$('#gallery-prev').addEventListener('click',()=>$('#gallery-track').scrollBy({left:-$('#gallery-track').clientWidth*.85,behavior:'smooth'}));$('#gallery-next').addEventListener('click',()=>$('#gallery-track').scrollBy({left:$('#gallery-track').clientWidth*.85,behavior:'smooth'}));
$('#gallery-track').addEventListener('click',e=>{const button=e.target.closest('[data-image]');if(!button)return;e.preventDefault();const index=Number(button.dataset.image);$('#media-content').innerHTML=`<img src="/media/photo-${String(index).padStart(2,'0')}.webp" alt="${captions[index-1]}"/>`;$('#media-caption').textContent=`${captions[index-1]} · Artist’s impression · ${index} / 11`;openDialog($('#media-dialog'));});
document.querySelectorAll('[data-film]').forEach(button=>button.addEventListener('click',event=>{event.preventDefault();const id=Number(button.dataset.film);$('#media-content').innerHTML=`<video controls autoplay playsinline preload="metadata" poster="/media/film-${String(id).padStart(2,'0')}.jpg"><source src="/media/film-${String(id).padStart(2,'0')}.mp4" type="video/mp4"/>Your browser does not support this video.</video>`;$('#media-caption').textContent=`${films[id-1][0]} · Reference film ${id} / 8`;const watchLink=document.createElement('a');watchLink.href=`/films/film-${String(id).padStart(2,'0')}/`;watchLink.textContent=' · Open film page ↗';$('#media-caption').append(watchLink);openDialog($('#media-dialog'));}));
document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});});$('#media-dialog').addEventListener('close',()=>{$('#media-content').querySelector('video')?.pause();$('#media-content').innerHTML='';});
$('#privacy-link').addEventListener('click',e=>{e.preventDefault();openDialog($('#privacy-dialog'));});$('.footer-privacy').addEventListener('click',()=>openDialog($('#privacy-dialog')));
const heroSlides=[...document.querySelectorAll('[data-hero-slide]')];
if(heroSlides.length){
 let active=0,timer;
 const dots=[...document.querySelectorAll('[data-hero-to]')],carousel=$('.hero-visual');
 const showSlide=index=>{active=(index+heroSlides.length)%heroSlides.length;heroSlides.forEach((slide,i)=>{slide.hidden=i!==active;slide.classList.toggle('active',i===active);});dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===active)));const name=heroSlides[active].querySelector('img').alt.replace(' property collection','');$('#hero-caption').textContent=name;const link=$('#hero-explore');link.href=heroSlides[active].href;link.innerHTML=`Explore ${escapeHtml(name)} <span>↗</span>`;};
 const stop=()=>clearInterval(timer);const start=()=>{stop();if(!document.hidden&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.querySelector('dialog[open]'))timer=setInterval(()=>{if(!document.querySelector('dialog[open]'))showSlide(active+1)},5500);};
 $('#hero-prev').addEventListener('click',()=>{showSlide(active-1);start();});$('#hero-next').addEventListener('click',()=>{showSlide(active+1);start();});dots.forEach(dot=>dot.addEventListener('click',()=>{showSlide(Number(dot.dataset.heroTo));start();}));
 carousel.addEventListener('mouseenter',stop);carousel.addEventListener('mouseleave',start);carousel.addEventListener('focusin',stop);carousel.addEventListener('focusout',start);document.addEventListener('visibilitychange',start);
 document.querySelectorAll('dialog').forEach(dialog=>{dialog.addEventListener('close',start);dialog.addEventListener('show',stop);});
 showSlide(0);start();
}
$('.menu-button').addEventListener('click',()=>{const open=$('#navigation').classList.toggle('open');$('.menu-button').setAttribute('aria-expanded',String(open));$('.menu-button').setAttribute('aria-label',open?'Close navigation':'Open navigation');});$('#navigation').addEventListener('click',e=>{if(e.target.closest('a')){$('#navigation').classList.remove('open');$('.menu-button').setAttribute('aria-expanded','false');$('.menu-button').setAttribute('aria-label','Open navigation');}});
initEnquiry();
$('#year').textContent=new Date().getFullYear();

const requestedProject = projects.find(p => p.slug === new URLSearchParams(location.search).get('project'));
const requestedDeveloper = new URLSearchParams(location.search).get('developer');
if (requestedDeveloper && [...$('#developer').options].some(option => option.value === requestedDeveloper)) $('#developer').value = requestedDeveloper;
if (requestedProject) {
  $('#developer').value = requestedProject.developer;
  $('#configuration').value = requestedProject.preferred;
  $('#project-interest').hidden = false;
  $('#project-interest').textContent = `Exploring ${requestedProject.name}. Mention this project when we connect.`;
}
document.querySelectorAll('[data-js-only]').forEach(element => { element.hidden = false; });
