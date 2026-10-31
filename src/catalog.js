export function validateCatalog(records) {
  if (!Array.isArray(records) || !records.length) throw new Error('The property catalogue must be a non-empty array.');
  const ids = new Set(), slugs = new Set();
  const required = ['name','slug','developer','location','region','type','category','config','size','price','priceNote','area','units','completion','details','preferred','sourceLabel','sourceUrl','rera'];
  for (const p of records) {
    for (const key of required) if (typeof p[key] !== 'string' || !p[key].trim()) throw new Error(`${p.name || 'Property'}: missing ${key}`);
    if (!Number.isInteger(p.id) || p.id < 1 || ids.has(p.id)) throw new Error(`Invalid or duplicate property id: ${p.id}`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug) || slugs.has(p.slug)) throw new Error(`Invalid or duplicate slug: ${p.slug}`);
    if (!['apartment','plot','villament','villa'].includes(p.type)) throw new Error(`Unsupported property type: ${p.type}`);
    if (!['1 BHK','2 BHK','3 BHK','4 BHK','Not sure yet'].includes(p.preferred)) throw new Error(`Unsupported enquiry configuration: ${p.preferred}`);
    for (const key of ['image','sourceUrl']) if (p[key] && !(/^(\/(?!\/)|https:\/\/)/.test(p[key]))) throw new Error(`Unsafe ${key} for ${p.name}`);
    if (!Array.isArray(p.highlights) || p.highlights.some(v => typeof v !== 'string')) throw new Error(`Invalid highlights: ${p.name}`);
    ids.add(p.id); slugs.add(p.slug);
  }
  return records;
}
