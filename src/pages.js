import { initEnquiry } from './enquiry.js';
import { initListing } from './listing.js';
import { initPropertyListing } from './property-listing.js';
initListing();
initPropertyListing();
initEnquiry();
const menu = document.querySelector('.menu-button');
const navigation = document.querySelector('#navigation');
menu?.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
