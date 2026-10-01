import catalog from "../data/properties.json" with { type: "json" };
import { validateCatalog } from "./catalog.js";
export const projects = validateCatalog(catalog);
export const developers = [...new Set(projects.map(p => p.developer))];
export const enquiryDevelopers = [...developers, 'Prestige Group'];

export const captions=['A skyline to call home','A striking first impression','The city, after dusk','Green spaces, open possibilities','Interiors made for everyday living','A moment of calm','Space to gather','A light-filled corner','Thoughtful spaces, down to the detail','Your own peaceful retreat','Room to make it yours'];
export const films=[['A new perspective','1:28'],['Water & wellbeing','0:35'],['Details that draw you in','0:38'],['A greener everyday','0:29'],['Life in the landscape','0:46'],['A welcome like no other','1:05'],['The complete walkthrough','8:02'],['Explore the full story','8:02']];
