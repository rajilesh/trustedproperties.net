import { initEnquiry } from './enquiry.js';
import { initListing } from './listing.js';
import { initPropertyListing } from './property-listing.js';
initListing();
initPropertyListing();
initEnquiry();
const propertyLightbox = document.querySelector('.property-lightbox');
if (propertyLightbox) {
  const propertyRoot = propertyLightbox.closest('[data-property-developer]');
  const propertyMedia = [...propertyRoot.querySelectorAll('[data-property-lightbox]')];
  const mediaStage = propertyLightbox.querySelector('.property-lightbox-stage');
  const mediaCaption = propertyLightbox.querySelector('.property-lightbox-caption');
  let currentMedia = 0;
  const showPropertyMedia = index => {
    currentMedia = (index + propertyMedia.length) % propertyMedia.length;
    const item = propertyMedia[currentMedia];
    mediaStage.replaceChildren();
    if (item.dataset.mediaType === 'video') {
      const video = document.createElement('video');
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.poster = item.dataset.mediaPoster;
      const source = document.createElement('source');
      source.src = item.dataset.mediaSrc;
      source.type = 'video/mp4';
      video.append(source);
      mediaStage.append(video);
    } else {
      const image = document.createElement('img');
      image.src = item.dataset.mediaSrc;
      image.alt = item.dataset.mediaAlt || '';
      mediaStage.append(image);
    }
    mediaCaption.textContent = `${item.dataset.mediaCaption || ''} · ${currentMedia + 1} / ${propertyMedia.length}`;
  };
  propertyRoot.addEventListener('click', event => {
    const trigger = event.target.closest('[data-property-lightbox]');
    if (!trigger) return;
    event.preventDefault();
    showPropertyMedia(propertyMedia.indexOf(trigger));
    propertyLightbox.showModal();
  });
  propertyLightbox.querySelector('[data-lightbox-prev]').addEventListener('click', () => showPropertyMedia(currentMedia - 1));
  propertyLightbox.querySelector('[data-lightbox-next]').addEventListener('click', () => showPropertyMedia(currentMedia + 1));
  propertyLightbox.querySelector('.dialog-close').addEventListener('click', () => propertyLightbox.close());
  propertyLightbox.addEventListener('click', event => {
    if (event.target === propertyLightbox) propertyLightbox.close();
  });
  propertyLightbox.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showPropertyMedia(currentMedia - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showPropertyMedia(currentMedia + 1); }
  });
  propertyLightbox.addEventListener('close', () => {
    mediaStage.querySelector('video')?.pause();
    mediaStage.replaceChildren();
  });
}
const menu = document.querySelector('.menu-button');
const navigation = document.querySelector('#navigation');
menu?.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
