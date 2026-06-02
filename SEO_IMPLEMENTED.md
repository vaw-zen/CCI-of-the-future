# SEO Implemented

This repository already has an advanced SEO foundation for a service-business site codebase. This document covers only confirmed SEO work that is already implemented in the repository today. It does not include recommendations, roadmap items, or missing pieces.

## Primary Source Files

- [src/app/layout.js](src/app/layout.js)
- [next.config.mjs](next.config.mjs)
- [public/robots.txt](public/robots.txt)
- [src/app/sitemap-index.xml/route.js](src/app/sitemap-index.xml/route.js)
- [src/app/sitemap.xml/route.js](src/app/sitemap.xml/route.js)
- [src/app/articles-sitemap.xml/route.js](src/app/articles-sitemap.xml/route.js)
- [src/app/video-sitemap.xml/route.js](src/app/video-sitemap.xml/route.js)
- [src/app/sitemap-priority.xml/route.js](src/app/sitemap-priority.xml/route.js)
- [src/app/conseils/[slug]/page.jsx](src/app/conseils/[slug]/page.jsx)
- [src/app/reels/[id]/page.jsx](src/app/reels/[id]/page.jsx)
- [scripts/gsc](scripts/gsc)
- [scripts/growth](scripts/growth)
- [assist-vault/GROWTH_DASHBOARD_SYSTEM_GUIDE.md](assist-vault/GROWTH_DASHBOARD_SYSTEM_GUIDE.md)

## Metadata And Canonical Setup

- Implemented: Global Next.js metadata includes a default title, description, `metadataBase`, Open Graph, Twitter cards, robots directives, Google verification, author info, and site-wide geo/business meta tags. The root layout also injects global `WebSite` and `LocalBusiness` JSON-LD and adds `fr-TN` and `x-default` alternate links.
- Where: [src/app/layout.js](src/app/layout.js)
- Purpose: Establishes the default search, social, and business identity layer for the entire site.

- Implemented: Route-level metadata and canonicals are defined across the main commercial and informational routes, including the home page, services, about, contact, FAQ, devis, blogs, conseils hub, team, privacy page, and the main service layouts for `salon`, `marbre`, `tapis`, `tapisserie`, `tfc`, and `entreprises`.
- Where: [src/app/page.js](src/app/page.js), [src/app/services/page.jsx](src/app/services/page.jsx), [src/app/about/page.jsx](src/app/about/page.jsx), [src/app/contact/page.jsx](src/app/contact/page.jsx), [src/app/faq/page.jsx](src/app/faq/page.jsx), [src/app/devis/page.jsx](src/app/devis/page.jsx), [src/app/blogs/page.jsx](src/app/blogs/page.jsx), [src/app/conseils/layout.jsx](src/app/conseils/layout.jsx), [src/app/team/page.jsx](src/app/team/page.jsx), [src/app/confidentialite/page.jsx](src/app/confidentialite/page.jsx), [src/app/salon/layout.jsx](src/app/salon/layout.jsx), [src/app/marbre/layout.jsx](src/app/marbre/layout.jsx), [src/app/tapis/layout.jsx](src/app/tapis/layout.jsx), [src/app/tapisserie/layout.jsx](src/app/tapisserie/layout.jsx), [src/app/tfc/layout.jsx](src/app/tfc/layout.jsx), [src/app/entreprises/layout.jsx](src/app/entreprises/layout.jsx)
- Purpose: Gives core landing pages and service pages explicit title, description, canonical, and social metadata instead of relying only on global defaults.

- Implemented: Dynamic detail pages generate page-specific metadata from route params and content data, including canonical URLs and rich social metadata for articles and reels.
- Where: [src/app/conseils/[slug]/page.jsx](src/app/conseils/[slug]/page.jsx), [src/app/reels/[id]/page.jsx](src/app/reels/[id]/page.jsx)
- Purpose: Keeps dynamic editorial and video pages indexable with page-level metadata rather than generic template tags.

## Structured Data / Schema

- Implemented: Site-wide `WebSite` and `LocalBusiness` JSON-LD are injected globally, backed by local business contact, address, geo, opening-hours, rating, and social profile data.
- Where: [src/app/layout.js](src/app/layout.js)
- Purpose: Provides search engines with a stable organization and local-business entity for brand and local SEO signals.

- Implemented: Commercial and informational pages include page-specific schema such as `ItemList`, `Organization`, `ContactPage`, `FAQPage`, `WebPage`, `Service`, `OfferCatalog`, and `CollectionPage`.
- Where: [src/app/services/page.jsx](src/app/services/page.jsx), [src/app/about/page.jsx](src/app/about/page.jsx), [src/app/team/page.jsx](src/app/team/page.jsx), [src/app/contact/page.jsx](src/app/contact/page.jsx), [src/app/faq/page.jsx](src/app/faq/page.jsx), [src/app/devis/page.jsx](src/app/devis/page.jsx), [src/app/conseils/page.jsx](src/app/conseils/page.jsx)
- Purpose: Makes the content type of major landing pages explicit and improves the site’s eligibility for rich-search interpretations.

- Implemented: Service-specific layouts render `BreadcrumbList` and `FAQPage` JSON-LD from route data files, and the service pages themselves render `Service` JSON-LD for the main offering.
- Where: [src/app/salon/layout.jsx](src/app/salon/layout.jsx), [src/app/marbre/layout.jsx](src/app/marbre/layout.jsx), [src/app/tapis/layout.jsx](src/app/tapis/layout.jsx), [src/app/tapisserie/layout.jsx](src/app/tapisserie/layout.jsx), [src/app/tfc/layout.jsx](src/app/tfc/layout.jsx), [src/app/entreprises/layout.jsx](src/app/entreprises/layout.jsx), [src/app/salon/page.jsx](src/app/salon/page.jsx), [src/app/marbre/page.jsx](src/app/marbre/page.jsx), [src/app/tapis/page.jsx](src/app/tapis/page.jsx), [src/app/tapisserie/page.jsx](src/app/tapisserie/page.jsx), [src/app/tfc/page.jsx](src/app/tfc/page.jsx), [src/app/entreprises/page.jsx](src/app/entreprises/page.jsx)
- Purpose: Adds service-level rich context and breadcrumb/FAQ structure to the main SEO landing pages.

- Implemented: Article pages emit `Article`, `BreadcrumbList`, and category-specific FAQ schema, while video surfaces emit `VideoObject` schema.
- Where: [src/app/conseils/[slug]/page.jsx](src/app/conseils/[slug]/page.jsx), [src/app/blogs/page.jsx](src/app/blogs/page.jsx), [src/app/reels/[id]/page.jsx](src/app/reels/[id]/page.jsx)
- Purpose: Gives editorial and video content first-class structured-data coverage.

## Crawl And Indexing Controls

- Implemented: Global robots defaults are set through Next.js metadata, including `index`, `follow`, and `googleBot.maxImagePreview`.
- Where: [src/app/layout.js](src/app/layout.js)
- Purpose: Provides a site-wide indexing baseline directly in the app metadata layer.

- Implemented: `robots.txt` explicitly allows the public site, blocks admin and API paths, preserves access to selected media-related API routes, and advertises the sitemap index plus child sitemaps.
- Where: [public/robots.txt](public/robots.txt)
- Purpose: Defines crawler access boundaries and sitemap discovery from the public root.

- Implemented: Google site verification exists in both metadata and a static verification file.
- Where: [src/app/layout.js](src/app/layout.js), [public/googleae0b6e01c64db9a9.html](public/googleae0b6e01c64db9a9.html)
- Purpose: Confirms Search Console ownership through repo-managed assets.

- Implemented: Dynamic article and reel routes expose discoverable static params, and search-facing content fetches use revalidation for freshness.
- Where: [src/app/conseils/[slug]/page.jsx](src/app/conseils/[slug]/page.jsx), [src/app/reels/[id]/page.jsx](src/app/reels/[id]/page.jsx), [src/app/blogs/page.jsx](src/app/blogs/page.jsx), [src/app/video-sitemap.xml/route.js](src/app/video-sitemap.xml/route.js)
- Purpose: Supports crawlable route generation and content freshness on SEO-relevant dynamic surfaces.

## Sitemap System

- Implemented: A sitemap index route advertises the main sitemap, video sitemap, article sitemap, and priority sitemap.
- Where: [src/app/sitemap-index.xml/route.js](src/app/sitemap-index.xml/route.js)
- Purpose: Centralizes sitemap discovery under a single index endpoint.

- Implemented: The main sitemap publishes core commercial and informational URLs with explicit `lastmod`, `changefreq`, and `priority` values.
- Where: [src/app/sitemap.xml/route.js](src/app/sitemap.xml/route.js)
- Purpose: Gives crawlers a curated index of the site’s main pages.

- Implemented: The article sitemap generates advice/article URLs dynamically from the live article inventory.
- Where: [src/app/articles-sitemap.xml/route.js](src/app/articles-sitemap.xml/route.js), [src/app/conseils/data/articles.js](src/app/conseils/data/articles.js)
- Purpose: Keeps editorial content discoverable without hardcoding article URLs into the main sitemap.

- Implemented: The video sitemap publishes `video:` entries with thumbnail, title, description, player URL, content URL, duration, publication date, uploader, tags, and view count when available.
- Where: [src/app/video-sitemap.xml/route.js](src/app/video-sitemap.xml/route.js)
- Purpose: Exposes video content to Google’s video crawl/indexing pipeline using site-owned URLs.

- Implemented: A priority sitemap maintains a hand-picked set of high-priority URLs.
- Where: [src/app/sitemap-priority.xml/route.js](src/app/sitemap-priority.xml/route.js)
- Purpose: Gives the repo a dedicated high-priority URL feed in addition to the broader sitemap set.

## Content SEO

- Implemented: The conseils hub has its own metadata, `CollectionPage` schema, and a server-rendered hidden navigation list containing all article links so crawlers can see the full article inventory in HTML.
- Where: [src/app/conseils/layout.jsx](src/app/conseils/layout.jsx), [src/app/conseils/page.jsx](src/app/conseils/page.jsx)
- Purpose: Makes the editorial hub indexable as a content collection and improves crawl discovery of article URLs.

- Implemented: The article system stores SEO-oriented fields such as title, meta title, meta description, slug, keywords, publish/update dates, image, and alt text in the content inventory.
- Where: [src/app/conseils/data/articles.js](src/app/conseils/data/articles.js), [src/libs/articlesFileFormat.js](src/libs/articlesFileFormat.js)
- Purpose: Keeps article metadata part of the source-controlled content model instead of treating SEO fields as an afterthought.

- Implemented: Article detail pages generate static params, page-specific metadata, `Article` schema, breadcrumbs, optional FAQ schema, previous/next navigation, and related-service linking.
- Where: [src/app/conseils/[slug]/page.jsx](src/app/conseils/[slug]/page.jsx), [src/app/conseils/[slug]/ArticleNavigation.jsx](src/app/conseils/[slug]/ArticleNavigation.jsx), [src/utils/components/relatedServices/relatedServices.jsx](src/utils/components/relatedServices/relatedServices.jsx)
- Purpose: Combines page-level metadata, structured data, and internal linking on article pages.

- Implemented: Article management APIs and file utilities exist for reading, validating, writing, and deploying the article inventory.
- Where: [src/app/api/articles/route.js](src/app/api/articles/route.js), [src/app/api/articles/[id]/route.js](src/app/api/articles/[id]/route.js), [src/libs/fileUtils.js](src/libs/fileUtils.js), [src/libs/githubUtils.js](src/libs/githubUtils.js)
- Purpose: Supports maintaining the indexed content inventory from within the application/repo workflow.

## Video SEO

- Implemented: The `blogs` page fetches posts and reels server-side, generates dynamic metadata from current content, and publishes structured data for the collection plus individual video objects and post/article entries.
- Where: [src/app/blogs/page.jsx](src/app/blogs/page.jsx), [src/app/blogs/blogs.json](src/app/blogs/blogs.json)
- Purpose: Turns the social content hub into an indexable collection page with crawlable structured data.

- Implemented: Reel detail pages generate dynamic metadata, canonical URLs, `VideoObject` JSON-LD, hidden microdata, and static params for individual reel pages.
- Where: [src/app/reels/[id]/page.jsx](src/app/reels/[id]/page.jsx)
- Purpose: Creates site-owned indexable video landing pages instead of relying only on off-site social URLs.

- Implemented: Helper API routes provide stable local URLs for video content redirects and thumbnail delivery, and those URLs are used in structured data and the video sitemap.
- Where: [src/app/api/video/[id]/route.js](src/app/api/video/[id]/route.js), [src/app/api/thumbnails/[reelId]/route.js](src/app/api/thumbnails/[reelId]/route.js), [src/app/video-sitemap.xml/route.js](src/app/video-sitemap.xml/route.js), [src/app/reels/[id]/page.jsx](src/app/reels/[id]/page.jsx)
- Purpose: Gives Google locally controlled `contentUrl`, `playerUrl`, and `thumbnailUrl` targets for video indexing.

## Redirect And Canonicalization Rules

- Implemented: The Next.js config enforces `trailingSlash: false` and includes host canonicalization from `www` to the configured canonical origin.
- Where: [next.config.mjs](next.config.mjs)
- Purpose: Reduces duplicate URL variants and consolidates authority on the canonical host/path format.

- Implemented: Redirects cover root and subpath index variants, singular-to-plural reel paths, legacy blog URLs to their current conseils pages, and older site routes to current destinations.
- Where: [next.config.mjs](next.config.mjs)
- Purpose: Preserves link equity and avoids orphaning historical URLs after content/routing changes.

- Implemented: Canonical target normalization also exists inside the keyword tooling, including path normalization, broad-target routing rules, and canonical URL derivation.
- Where: [src/libs/growthKeywordCatalog.mjs](src/libs/growthKeywordCatalog.mjs), [src/libs/sitePathInventory.mjs](src/libs/sitePathInventory.mjs)
- Purpose: Keeps keyword targeting and reporting tied to current canonical site paths instead of drifting across legacy URLs.

## Search Console And Indexing Scripts

- Implemented: A sitemap submission script can send the sitemap index to the configured Search Console property.
- Where: [scripts/gsc/submit-sitemap.cjs](scripts/gsc/submit-sitemap.cjs)
- Purpose: Operationalizes sitemap submission directly from the repo.

- Implemented: An indexing-batch preparation script normalizes URLs and produces canonicalized `.txt` and `.json` outputs for follow-up inspection work.
- Where: [scripts/gsc/prepare-indexing-batch.cjs](scripts/gsc/prepare-indexing-batch.cjs), [scripts/gsc/data](scripts/gsc/data)
- Purpose: Standardizes URL lists before indexing inspection or submission workflows.

- Implemented: A batch URL inspection script can query Search Console’s URL Inspection API and write persisted inspection reports.
- Where: [scripts/gsc/inspect-batch.cjs](scripts/gsc/inspect-batch.cjs), [scripts/gsc/reports](scripts/gsc/reports)
- Purpose: Gives the repo a repeatable indexing diagnostic workflow.

- Implemented: Shared GSC utilities centralize credentials, property resolution, env loading, and URL list handling.
- Where: [scripts/gsc/utils.cjs](scripts/gsc/utils.cjs)
- Purpose: Keeps Search Console automation reusable and consistent across scripts.

## Keyword And Ranking Tooling

- Implemented: The keyword catalog layer normalizes target URLs, classifies broad keywords to canonical pages, derives canonical target URLs, stores reference metadata, and supports deduped catalog upserts.
- Where: [src/libs/growthKeywordCatalog.mjs](src/libs/growthKeywordCatalog.mjs)
- Purpose: Creates a canonical keyword-target model instead of leaving SEO targeting scattered across raw spreadsheets.

- Implemented: The site path inventory derives valid target paths directly from the live sitemap definitions and article inventory.
- Where: [src/libs/sitePathInventory.mjs](src/libs/sitePathInventory.mjs)
- Purpose: Ensures keyword targeting logic stays aligned with the site’s real URL inventory.

- Implemented: Keyword CSV preparation/import tooling cleans raw keyword files, validates headers, remaps URLs, writes cleaned outputs, and can sync the result into Supabase.
- Where: [scripts/growth/prepare-keyword-csv.mjs](scripts/growth/prepare-keyword-csv.mjs), [scripts/growth/data/seo-keywords.cleaned.csv](scripts/growth/data/seo-keywords.cleaned.csv), [scripts/growth/data/seo-keywords-url-map.json](scripts/growth/data/seo-keywords-url-map.json)
- Purpose: Turns keyword planning input into a normalized, importable SEO dataset.

- Implemented: Growth scripts exist for daily Search Console imports, live SERP keyword ranking imports, GA4 imports, channel CSV imports, and a refresh wrapper for the reporting layer.
- Where: [scripts/growth/import-gsc-daily.mjs](scripts/growth/import-gsc-daily.mjs), [scripts/growth/import-serp-keywords.mjs](scripts/growth/import-serp-keywords.mjs), [scripts/growth/import-ga4-daily.mjs](scripts/growth/import-ga4-daily.mjs), [scripts/growth/import-channel-csv.mjs](scripts/growth/import-channel-csv.mjs), [scripts/growth/refresh-growth-reporting.mjs](scripts/growth/refresh-growth-reporting.mjs), [package.json](package.json)
- Purpose: Connects Search Console, rank tracking, and adjacent analytics into a persistent SEO/growth reporting workflow.

## Admin Dashboard / SEO Reporting Layer

- Implemented: The admin dashboard API provides a single entrypoint that can return SEO-aware dashboard sections alongside the broader business reporting payload.
- Where: [src/app/api/admin/dashboard/route.js](src/app/api/admin/dashboard/route.js)
- Purpose: Makes SEO reporting part of the existing admin system rather than a disconnected external process.

- Implemented: The dashboard UI includes SEO-focused panels such as query intelligence, content opportunities, landing-page scorecards, keyword visibility/ranking views, organic landing page performance, and data-health context.
- Where: [src/app/admin/dashboard/page.jsx](src/app/admin/dashboard/page.jsx)
- Purpose: Gives the repo an operational surface for reviewing SEO performance and prioritization.

- Implemented: Metric builders and reporting logic support `seoQueries`, `contentOpportunities`, `landingPageScorecard`, `seoContent`, keyword ranking diagnostics, organic evidence, and freshness-aware source health.
- Where: [src/libs/adminDashboardMetrics.mjs](src/libs/adminDashboardMetrics.mjs), [src/libs/growthReporting.mjs](src/libs/growthReporting.mjs)
- Purpose: Powers the SEO dashboard with normalized query, page, keyword, and health data rather than raw logs alone.

- Implemented: Internal docs describe the reporting model, operating flow, and SEO audit layer that sit behind the dashboard.
- Where: [assist-vault/GROWTH_DASHBOARD_SYSTEM_GUIDE.md](assist-vault/GROWTH_DASHBOARD_SYSTEM_GUIDE.md), [assist-vault/GROWTH_DASHBOARD_RUNBOOK.md](assist-vault/GROWTH_DASHBOARD_RUNBOOK.md), [assist-vault/GROWTH_DASHBOARD_SEO_AUDIT_MASTER_PROMPT.md](assist-vault/GROWTH_DASHBOARD_SEO_AUDIT_MASTER_PROMPT.md)
- Purpose: Documents the SEO/growth system as a maintained operational capability inside the repo.

## SEO-Related Validation And Tests

- Implemented: The repo includes targeted tests for the SEO audit prompt layer, including filter handling, trust-context rendering, and fallback behavior when SEO payloads are absent.
- Where: [tests/seo-audit-prompt.test.mjs](tests/seo-audit-prompt.test.mjs)
- Purpose: Validates the prompt/reporting layer used for SEO review workflows.

- Implemented: The repo includes targeted tests for keyword catalog normalization, sitemap/article path inventory extraction, cleaned CSV target validity, and canonical URL derivation.
- Where: [tests/growth-keyword-catalog.test.mjs](tests/growth-keyword-catalog.test.mjs)
- Purpose: Validates core SEO targeting and site-inventory logic.

- Implemented: Broader reporting tests exist for the underlying growth reporting and admin dashboard data model that the SEO layer depends on.
- Where: [tests/growth-reporting.test.mjs](tests/growth-reporting.test.mjs), [tests/admin-dashboard-metrics.test.mjs](tests/admin-dashboard-metrics.test.mjs), [tests/admin-dashboard-payload.test.mjs](tests/admin-dashboard-payload.test.mjs)
- Purpose: Provides additional confidence in the reporting primitives behind SEO dashboard outputs.

- Implemented: Package scripts expose dashboard and analytics validation commands alongside SEO/growth import commands.
- Where: [package.json](package.json)
- Purpose: Keeps SEO-related validation and operations accessible from the repo script layer.

## Current Coverage Summary

- Confirmed implemented coverage includes on-page metadata, canonicals, structured data, crawl/indexing controls, multi-sitemap support, article SEO, video SEO, Search Console automation, keyword normalization/rank tracking, and admin-side SEO reporting.
- The repository already treats SEO as both a page-layer concern and an operational system, with supporting scripts, tests, internal docs, and reporting infrastructure.
- This inventory is intentionally limited to confirmed implemented work present in the repo today.
