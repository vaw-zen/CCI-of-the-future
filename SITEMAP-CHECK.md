# Sitemap Verification Required

## Issue
Google reports: "Aucun sitemap référent détecté" for `/tapis` page

## Action Required
1. Verify `/tapis` is included in sitemap.xml
2. Check sitemap at: https://cciservices.online/sitemap.xml
3. Ensure sitemap includes:
   ```xml
   <url>
       <loc>https://cciservices.online/tapis</loc>
       <lastmod>2025-09-25</lastmod>
       <priority>0.8</priority>
   </url>
   ```

## If using WordPress SEO plugin:
- Yoast SEO: Go to SEO → General → Features → XML Sitemaps → See the XML sitemap
- RankMath: Go to Rank Math → Sitemap Settings
- Ensure "tapis" page is not excluded from sitemap
