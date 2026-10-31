// Both collections use the same publishing contract; their URLs stay separate.
export const propertyCollections = {
  individual: { path: '/individual-properties/', name: 'Individual properties', enquiry: 'Individual property' },
  resale: { path: '/resale-properties/', name: 'Resale properties', enquiry: 'Resale property' },
};
export const propertyPath = (p, collection) => `${propertyCollections[collection].path}${p.slug}/`;
const safeUrl = value => typeof value === 'string' && /^(\/(?!\/)|https:\/\/)/.test(value) && !/[\s\\]/.test(value) && !value.split(/[?#]/)[0].split('/').includes('..');

export function validatePropertyCatalog(records) {
  if (!Array.isArray(records)) throw new Error('Property catalogue must be an array.');
  const slugs = new Set();
  for (const p of records) {
    for (const key of ['slug','name','location','city','state','type','config','preferred','size','price','completion','image','imageAlt','imageNote','details','verificationNote','sourceUrl','sourceLabel']) {
      if (typeof p[key] !== 'string' || !p[key].trim()) throw new Error(`${p.name || 'Property'}: missing ${key}`);
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug) || slugs.has(p.slug)) throw new Error(`Invalid or duplicate slug: ${p.slug}`);
    if (!['apartment','house','villa','plot'].includes(p.type)) throw new Error(`Unsupported property type: ${p.type}`);
    if (!['1 BHK','2 BHK','3 BHK','4 BHK','Not sure yet'].includes(p.preferred)) throw new Error(`Unsupported enquiry configuration: ${p.preferred}`);
    if (!Array.isArray(p.facts) || p.facts.some(f => !Array.isArray(f) || f.length !== 2 || f.some(v => typeof v !== 'string' || !v.trim()))) throw new Error(`Invalid facts: ${p.name}`);
    if (!Array.isArray(p.gallery) || p.gallery.some(m => !safeUrl(m.src) || !m.alt?.trim() || !m.caption?.trim())) throw new Error(`Invalid gallery: ${p.name}`);
    for (const key of ['image','sourceUrl','mapUrl','floorPlan','survey','video','poster']) if (p[key] && !safeUrl(p[key])) throw new Error(`Unsafe ${key}: ${p.name}`);
    if (p.video && (!p.poster || !p.videoNote || !Number.isFinite(p.videoDuration) || p.videoDuration <= 0)) throw new Error(`Video needs a poster, description and duration: ${p.name}`);
    slugs.add(p.slug);
  }
  return records;
}

export function propertyAssetPaths(p) {
  return [...new Set([p.image,p.sourceUrl,p.floorPlan,p.survey,p.video,p.poster,...p.gallery.map(m=>m.src)].filter(v=>v?.startsWith('/')).map(v=>v.split(/[?#]/)[0]))];
}
