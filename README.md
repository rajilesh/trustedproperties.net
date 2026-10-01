# Trusted Properties

Responsive real-estate website built with vanilla JavaScript, CSS and Vite.

## Run locally

```sh
npm install
npm run dev
```

## Production

```sh
npm run build
npm run preview
```

Deploy the contents of `dist/` to a static host at `https://trustedproperties.net`. The site uses root-relative asset URLs. No frontend secrets or environment variables are required.

## Content and media

- Eighteen projects from SOBHA, Puravankara, Provident and DNR Group are maintained in `data/properties.json`. `src/content.js` validates and exports this catalogue.
- Puravankara / Provident prices and timelines come from the supplied channel-partner kit. Its source PDF is published at `/guides/puravankara-provident.pdf`; individual records include page references. Additional size information comes from the project lifestyle / floor-plan brochures.
- DNR Arista facts and its reference image come from https://dnrgroup.in/dnr-arista/, checked 29 September 2026. Pricing and possession are left on request because the source does not publish them.
- The supplied `references/logo.jpeg` is used throughout the website.
- All 11 supplied photographs are converted to WebP and used in the gallery. Eight supplied video files are available in the film collection, with a video hero and extracted poster frames.
- `public/media/manifest.json` maps the original filenames to website assets.
- The original guide is available as `public/project-guide.pdf`.
- Guide pricing is indicative and not represented as a current quotation. Media is identified as illustrative instead of incorrectly assigning unlabelled images to individual projects.
- The site uses Trusted Properties as the consent recipient. Confirm that this is the correct business name before launch; the supplied sample used HomeBridge Properties.

## Enquiry integration

The form POSTs JSON directly to:

`https://trustedproperties-form.rajileshpanoli123.workers.dev/`

Payload: `name`, `countryCode`, `mobile`, `email`, `developer`, `configuration`, `budget`, `consent`.

The API field options follow the supplied integration. Project detail buttons preselect a supported configuration. The selected developer is included in the API request. Project pages preselect both the developer and a supported configuration. The developer dropdown includes each developer with listed projects plus Prestige Group. Plot and 3.5 BHK enquiries use “Not sure yet”.

Validation, duplicate-submit prevention, success, API errors, connection errors and a 20-second timeout are handled. Failed submissions preserve the entered details.

### Cross-origin policy checked

- OPTIONS with origin `https://trustedproperties.net`: **204**, with the matching `Access-Control-Allow-Origin` and POST/OPTIONS allowed.
- OPTIONS with origin `http://localhost:5173`: **403**. Live local submissions require adding the development origin to the Worker allowlist. Preview on another domain also requires permitting that domain.
- No real lead was submitted during development. Form success/failure and the exact payload were checked using intercepted browser responses; actual downstream delivery is not yet verified.

## Verification

Run the production build and SEO suite below after catalogue changes. Browser interaction checks should cover developer filtering, search, grid/list views, project enquiries and mobile navigation.

## SEO and AI search

`npm run dev` and `npm run build` regenerate the static HTML, metadata, structured data, sitemaps and text exports from one shared source.

- Edit the home page layout in `templates/home.html`; `index.html` is generated.
- Edit project facts in `data/properties.json`.
- Edit verified business details, FAQs, search verification tokens and confirmed video publication dates in `src/site.js`.
- Edit shared page generation in `scripts/generate-seo.mjs`.
- Run `npm run test:seo` to rebuild and audit metadata, links, structured-data consistency, sitemaps and text exports.
- See [SEO.md](SEO.md) for the launch checklist and known limitations.

Deploy the complete `dist/` directory, preserving the project and film subdirectories. This is a multipage static site; do not configure a catch-all rewrite to the homepage. `404.html` must be served with HTTP 404 for missing URLs. Cloudflare Pages/Netlify-style `_headers` and `_redirects` are included; other hosts need equivalent configuration.

## Add a property later

1. Copy `data/property.example.json` to a new JSON file and replace the example values with sourced project details. Omit `id` and `slug` to generate them automatically. Supported types: `apartment`, `plot`, `villament`, `villa`.
2. Optionally add `image` (for example `/media/projects/new-project.webp`) and `imageNote`. Place that image under `public/media/projects/`. Place local source PDFs under `public/guides/` and set `sourceUrl`; external HTTPS sources are also supported. Missing facts should say “Confirm with developer”, not guessed values.
3. Run `npm run add-property -- path/to/your-property.json`. Validation rejects duplicate IDs/slugs, missing fields, unsupported types and unsafe URLs before changing the catalogue.
4. Run `npm run test:seo`, then deploy the rebuilt `dist/` directory.

This is a file-based publishing workflow, not a public admin/CMS. Adding a developer to a property automatically adds it to the homepage developer collection and filters. Counts, detail pages, JSON data and sitemap entries are generated on build. Edit existing records directly in `data/properties.json`. Keep existing slugs stable to preserve URLs.
