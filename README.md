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

Deploy the contents of `dist/` at `https://www.trustedproperties.net`, matching the GitHub Pages custom domain in `CNAME`. The site uses root-relative asset URLs. No frontend secrets or environment variables are required.

The current GitHub Pages configuration publishes `main` from the repository root. After a verified build, copy the complete `dist/` output into that root, including the hashed `assets/` files, before committing and pushing. Keep `.nojekyll` in the publishing root. The templates, catalogues, scripts and `src/` remain the editable sources; generated HTML is replaced with the compiled HTML for publication.

## Content and media

- Eighteen projects from SOBHA, Puravankara, Provident and DNR Group are maintained in `data/properties.json`. `src/content.js` validates and exports this catalogue.
- Puravankara / Provident prices and timelines come from the supplied channel-partner kit. Its source PDF is published at `/guides/puravankara-provident.pdf`; individual records include page references. Additional size information comes from the project lifestyle / floor-plan brochures.
- DNR Arista uses the supplied April 2026 Phase 2 cost sheet and digital brochure, published under `public/guides/`. Phase 2 indicative prices, charges, RERA and project specifications come from these documents. Possession and unpriced configurations remain on request. The reference image comes from https://dnrgroup.in/dnr-arista/, checked 29 September 2026.
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
- OPTIONS with origin `https://www.trustedproperties.net`: **204**, verified 12 October 2026 without submitting a lead.
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
- Edit authored locality and buyer guidance in `data/search-guides.json`; these eight pages are rebuilt with current project cards and included in the production build, sitemaps and text exports.
- Sitemap generation in `scripts/generate-sitemaps.mjs` includes all canonical pages, their visible content images/posters and the described videos.
- Run `npm run audit:seo:live` after deploying to check live responses with Googlebot and OAI-SearchBot headers; details are written to `tmp/seo-live-audit.json`.
- Run `npm run test:seo` to rebuild and audit metadata, links, structured-data consistency, sitemaps and text exports.
- See [SEO.md](SEO.md) for the launch checklist and known limitations.

Deploy the complete `dist/` directory, preserving the project and film subdirectories. This is a multipage static site; do not configure a catch-all rewrite to the homepage. `404.html` must be served with HTTP 404 for missing URLs. Cloudflare Pages/Netlify-style `_headers` and `_redirects` are included. GitHub Pages does not apply these files: configure the apex redirect at the domain provider to preserve paths and query strings. See `SEO.md` for the live redirect issue found on 12 October 2026.

## Add a property later

1. Copy `data/property.example.json` to a new JSON file and replace the example values with sourced project details. Omit `id` and `slug` to generate them automatically. Supported types: `apartment`, `plot`, `villament`, `villa`.
2. Optionally add `image` (for example `/media/projects/new-project.webp`) and `imageNote`. Place that image under `public/media/projects/`. Place local source PDFs under `public/guides/` and set `sourceUrl`; external HTTPS sources are also supported. Missing facts should say “Confirm with developer”, not guessed values.
3. Run `npm run add-property -- path/to/your-property.json`. Validation rejects duplicate IDs/slugs, missing fields, unsupported types and unsafe URLs before changing the catalogue.
4. Run `npm run test:seo`, then deploy the rebuilt `dist/` directory.

This is a file-based publishing workflow, not a public admin/CMS. Adding a developer to a property automatically adds it to the homepage developer collection and filters. Counts, detail pages, JSON data and sitemap entries are generated on build. Edit existing records directly in `data/properties.json`. Keep existing slugs stable to preserve URLs.

## Add a resale or individual property

Both collections now share a reusable publishing format. Trifecta Esplanade belongs to resale; Govindapuram, Near Mims Hospital remains an individual home at its existing URL.

1. Copy `data/listing.example.json` and replace its values with sourced property facts. Use “On request” for unknown price, area or availability. `facts` contains label/value pairs; `gallery` contains `src`, descriptive `alt` text and a visible `caption` for each image.
2. Put media under `public/media/resale/<slug>/` or `public/media/individual/<slug>/`. `image` is the cover. Optional `video` requires `poster`, `videoNote` and `videoDuration` in seconds. Set `videoUploadDate` only when the actual first-publication date is known.
3. Run `npm run add-listing -- resale path/to/property.json` or `npm run add-listing -- individual path/to/property.json`. The command checks required facts, duplicate slugs, unsafe URLs and missing local assets before changing the catalogue.
4. Run `npm run test:seo` and `npm run test:listings`, then deploy the complete `dist/` directory.

Edit existing records in `data/resale-properties.json` or `data/individual-properties.json` and keep slugs stable. Builds automatically register every listing page, create collection cards and search filters, generate metadata and JSON-LD, and update page/image/video sitemaps, Markdown, public JSON data, `llms.txt` and `llms-full.txt`. Shared rendering lives in `scripts/generate-listings.mjs`.

Keep `public/` as the source for listing media and local documents. Generation also copies these assets to their repository-root paths (for example `public/media/resale/<slug>/cover.webp` to `media/resale/<slug>/cover.webp`) to preserve the existing static-root layout. Include both copies in commits. Vite copies the `public/` assets into `dist/` for production deployment.

Trifecta Esplanade uses the six unique images supplied on 11–12 October 2026 (the second batch repeats five photos and adds a floor plan) and the supplied walkthrough. The developer's official completed-projects page supplies the community location/status; the supplied floor plan supplies the 2-bedroom layout. User-supplied listing details record a super built-up area (SBA) of 1,117 sq ft and an asking price of ₹1.1 Cr. Floor, furnishing inclusions and availability remain on request.

Listing enquiries preselect the collection and configuration and show the property name. The existing enquiry API has no property-name field: the form asks buyers to mention the selected property when contacted. No test enquiry is sent to the live service.

## Google Ads tracking

The Google tag uses `AW-981431498`. Each page queues one explicit `page_view` event; automatic page-view sending is disabled to avoid duplicate events. Successful enquiry responses queue conversion `AW-981431498/YbPjCI7E-4QdEMrp_dMD`. Invalid, failed, timed-out and duplicate in-flight submissions do not trigger conversions. The event payload does not include enquiry contact details.

Tags are inserted by `scripts/generate-seo.mjs` and synchronised onto standalone HTML pages by `scripts/sync-tracking.mjs` during generation. Browser verification should intercept Google requests and mock the enquiry endpoint to avoid creating test leads or conversions. Google Ads receipt and attribution must be verified on the deployed site using Tag Assistant and the account conversion diagnostics.

SOBHA details use the supplied `Bangalore_All_Project_Details Sobha.pdf` (received 15 October 2026), published as `/project-guide.pdf`. All ten project entries include the guide’s launch month, basic rate, floor notation, configuration-specific super built-up sizes and phase timelines where supplied. Existing headline prices and areas were checked against the table. Magnus 2 BHK pricing remains on request because the table repeats its area in the price column.
