# Search and AI discovery

## Implemented

- 45 prerendered content pages: homepage, 18 developer project guides, project collection, eight locality/buyer guides, resale and individual collections with two property pages, film collection, eight watch pages, FAQs, contact, rentals and privacy notice.
- Project and listing facts, links, images, films and FAQs are present in the initial HTML. JavaScript is not required to discover the collections. Locality cards rebuild from the current project catalogue; their authored guidance is maintained in `data/search-guides.json`.
- Unique titles and descriptions, canonical HTTPS URLs, Open Graph and Twitter previews, English/India language metadata, large image previews and unrestricted search snippets.
- JSON-LD: Organization, WebSite, CollectionPage, ItemList, Service, RealEstateListing, ApartmentComplex/Place, BreadcrumbList, FAQPage, ImageObject and VideoObject, only where the corresponding content is present.
- Sitemap index plus page, image and video sitemaps. Page URLs cover every indexable generated page; image URLs come from content images and video posters in those pages; video entries match the ten visible video players and their JSON-LD. XML values are escaped. No fabricated modification dates or stale priority/change-frequency claims.
- A permissive robots.txt explicitly allows OAI-SearchBot and all other crawlers in one shared group. Hosting/CDN rules still control actual access. Brand preview utilities and the 404 page are intentionally noindex and excluded from sitemaps.
- llms.txt, llms-full.txt, project Markdown versions and data/projects.json, generated from the same facts as visible HTML.
- Real page links and breadcrumbs, related projects, a custom noindex 404 page, path-preserving apex-to-www redirect configuration and cache headers. Canonicals, social URLs, schema identifiers, text exports and all sitemaps use `https://www.trustedproperties.net`, matching `CNAME`. Project previews use the corresponding image or a labelled illustrative reference.
- Existing WebP imagery, lazy-loaded gallery images, a preloaded hero poster and deferred desktop background video. Mobile background playback is user-initiated, avoiding an automatic large video download. Reduced-motion and data-saving preferences are respected.

## What remains at launch

1. Deploy the complete `dist/` directory to `https://www.trustedproperties.net`. Confirm HTTPS, the www canonical host and path-preserving apex redirect, directory index pages and a true 404 response for missing URLs. Do not rewrite every path to index.html. The supplied `_headers` and `_redirects` require a compatible host; configure equivalents elsewhere.
2. Verify ownership in Google Search Console and Bing Webmaster Tools. Optional verification tokens can be set in `src/site.js`; never publish placeholder tokens. Submit `https://www.trustedproperties.net/sitemap.xml` after the files are live. These account actions have not been performed.
3. Inspect the live homepage and representative project/watch pages with Search Console URL Inspection, Google's Rich Results Test and Schema.org Validator. Local tests check syntax, content consistency, file paths and sitemap coverage; they are not a claim of Google rich-result eligibility.
4. Confirm the public business name, phone, email, office address, Google Business Profile URL and applicable RERA registration. Add owner-verified values in `src/site.js`. The current Organization becomes RealEstateAgent when a verified address is supplied, and these details are also rendered visibly. No office address, rating, review, social profile, award or sales-agent identity has been invented.
5. Enter genuine first-publication timestamps for the films in `site.videoUploadDates` when known. VideoObject and watch pages exist, but Google requires uploadDate for video rich results. Unknown dates are deliberately omitted; WhatsApp filenames are not evidence of publication dates. The sitemap can list videos without publication dates.
6. Refresh project pricing, phase dates and availability against the developer's current information. The supplied guide is the source, not a live inventory feed. No unverified current Offer or aggregateRating markup is emitted.
7. Check Google/Bing crawl logs, indexing, Core Web Vitals, impressions, clicks and qualified enquiries after launch. Test both the apex and www domain against the form API's CORS policy if both are used. Both apex and www origins have been verified; localhost is not allowed. The www OPTIONS preflight returned 204 on 12 October 2026 without submitting a lead.

## Live audit on 12 October 2026

The live site serves `www.trustedproperties.net` through GitHub Pages. The apex domain redirects `/robots.txt`, `/sitemap.xml` and listing paths to the www homepage, dropping the requested path. The previously deployed sitemap files and most canonical tags use that apex host. This makes the existing sitemap links resolve to HTML instead of the intended XML/pages. The source now uses the working www host; deploy `dist/` to replace the old files.

The apex redirect is controlled outside this repository. Configure the domain provider to preserve the requested path and query string when redirecting to www. GitHub Pages does not apply the supplied Netlify/Cloudflare-style `_headers` or `_redirects`; those files are for compatible alternative hosts. Configure domain-level redirects at the provider when retaining GitHub Pages.

Run `npm run audit:seo:live` after building and deploying. This read-only audit requests all expected content pages and sitemap files with Googlebot and OAI-SearchBot user-agent headers, checks HTTP responses, canonical tags, indexability and sitemap hosts/coverage, and writes `tmp/seo-live-audit.json`. These requests can detect user-agent blocks; they do not originate from the crawlers' published IP addresses or confirm Search Console indexing. URL Inspection and sitemap submission require the owner's Search Console account, which is not connected in this workspace.

## Accurate expectations

Resale and individual collections are generated from their catalogues on every build. Each property has canonical HTML, matching Markdown and JSON exports, property-specific social previews, RealEstateListing plus Apartment/House/Place structured data, breadcrumbs and labelled ImageObjects. Supplied videos have VideoObject markup; unknown first-publication dates remain omitted. Both collections and their media are included in the sitemaps and LLM text guides. The existing Kommeri URL is preserved. These files aid discovery and parsing; they do not guarantee rankings or AI citations.

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

- [Google: sitemap construction and canonical URL inclusion](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: image sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps)
- [Google: video sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps)
- [OpenAI: OAI-SearchBot and crawler access](https://developers.openai.com/api/docs/bots)
