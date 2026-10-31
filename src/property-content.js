import individual from '../data/individual-properties.json' with { type: 'json' };
import resale from '../data/resale-properties.json' with { type: 'json' };
import { validatePropertyCatalog } from './property-catalog.js';
export const individualProperties = validatePropertyCatalog(individual);
export const resaleProperties = validatePropertyCatalog(resale);
export const propertyCatalogs = { individual: individualProperties, resale: resaleProperties };
