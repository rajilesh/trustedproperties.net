# Search and AI discovery

## Implemented

- 23 prerendered HTML pages: homepage, project collection, 10 project guides, film collection, eight watch pages, FAQs and privacy notice.
- Project facts, links, images, films and FAQs are present in the initial HTML. JavaScript enhances the homepage but is not required to discover the collection.
- Unique titles and descriptions, canonical HTTPS URLs, Open Graph and Twitter previews, English/India language metadata, large image previews and unrestricted search snippets.
- JSON-LD: Organization, WebSite, CollectionPage, ItemList, Service, RealEstateListing, ApartmentComplex/Place, BreadcrumbList, FAQPage, ImageObject and VideoObject, only where the corresponding content is present.
- Sitemap index plus page, image and video sitemaps. No fabricated modification dates or stale priority/change-frequency claims.
- A permissive robots.txt for search and AI search crawlers. Hosting/CDN rules still control actual access.
- llms.txt, llms-full.txt, project Markdown versions and data/projects.json, generated from the same facts as visible HTML.
- Real page links and breadcrumbs, related projects, a custom noindex 404 page, non-www redirect configuration and cache headers.
- Existing WebP imagery, lazy-loaded gallery images, a preloaded hero poster and deferred desktop background video. Mobile background playback is user-initiated, avoiding an automatic large video download. Reduced-motion and data-saving preferences are respected.

## What remains at launch

1. Deploy the complete `dist/` directory to `https://trustedproperties.net`. Confirm HTTPS, the non-www canonical redirect, directory index pages and a true 404 response for missing URLs. Do not rewrite every path to index.html. The supplied `_headers` and `_redirects` require a compatible host; configure equivalents elsewhere.
2. Verify ownership in Google Search Console and Bing Webmaster Tools. Optional verification tokens can be set in `src/site.js`; never publish placeholder tokens. Submit `https://trustedproperties.net/sitemap.xml` after the files are live. These account actions have not been performed.
3. Inspect the live homepage and representative project/watch pages with Search Console URL Inspection, Google's Rich Results Test and Schema.org Validator. Local tests check syntax, content consistency, file paths and sitemap coverage; they are not a claim of Google rich-result eligibility.
4. Confirm the public business name, phone, email, office address, Google Business Profile URL and applicable RERA registration. Add owner-verified values in `src/site.js`. The current Organization becomes RealEstateAgent when a verified address is supplied, and these details are also rendered visibly. No office address, rating, review, social profile, award or sales-agent identity has been invented.
5. Enter genuine first-publication timestamps for the films in `site.videoUploadDates` when known. VideoObject and watch pages exist, but Google requires uploadDate for video rich results. Unknown dates are deliberately omitted; WhatsApp filenames are not evidence of publication dates. The sitemap can list videos without publication dates.
6. Refresh project pricing, phase dates and availability against the developer's current information. The supplied guide is the source, not a live inventory feed. No unverified current Offer or aggregateRating markup is emitted.
7. Check Google/Bing crawl logs, indexing, Core Web Vitals, impressions, clicks and qualified enquiries after launch. Test both the apex and www domain against the form API's CORS policy if both are used. The apex origin was verified; localhost is not allowed.

## Accurate expectations

Structured data helps describe the content; adding unrelated schema types does not improve relevance. The FAQPage schema describes visible questions and answers, but Google no longer displays FAQ rich results as of May 2026. No FAQ rich-result benefit is claimed.

`llms.txt` is an emerging convention and optional reading aid, not an access-control standard or a guaranteed ranking/citation signal. Google states that AI Overviews and AI Mode rely on ordinary search eligibility and do not require special AI text files or schema. The implementation therefore prioritizes crawlable HTML, internal links, clear sourced facts and consistent canonical pages.

Search indexing, rankings and AI citations are not guaranteed. Accurate business information, useful maintained content, reputation and legitimate local visibility remain ongoing work outside a code-only change.

## References checked

- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Google: Video structured data](https://developers.google.com/search/docs/appearance/structured-data/video)
- [Google: Search documentation updates, including FAQ retirement](https://developers.google.com/search/updates)
- [Bing: Webmaster guidelines](https://www.bing.com/webmasters/help/bing-webmaster-guidelines-30fba23a)
- [Schema.org: RealEstateListing](https://schema.org/RealEstateListing)
- [Schema.org: ApartmentComplex](https://schema.org/ApartmentComplex)
- [llms.txt proposal](https://llmstxt.org/)
