# SEO Fix Recommendations for cciservices.online

## Issue: Search Results Pages with Canonical Tags

### Identified Problems:
1. Search result template URL is being crawled: `/?s=%7Bsearch_term_string%7D`
2. These pages should not appear in search results

### Required Fixes:

#### 1. Add to header.php (or equivalent):
```php
<?php if (is_search()) : ?>
    <meta name="robots" content="noindex, follow">
    <link rel="canonical" href="<?php echo home_url('/'); ?>">
<?php endif; ?>
```

#### 2. Update .htaccess to redirect search pages:
```apache
# Prevent indexing of search results
RewriteCond %{QUERY_STRING} ^s=
RewriteRule ^$ / [R=301,L]
```

#### 3. Exclude from XML Sitemap:
- Ensure search result pages are excluded from sitemap generation
- Only include actual content pages (like /tapis)

#### 4. Google Search Console Actions:
1. Upload the new robots.txt file
2. Request removal of search URLs from index
3. Submit updated sitemap

### Priority: HIGH
### Estimated Time: 30 minutes
