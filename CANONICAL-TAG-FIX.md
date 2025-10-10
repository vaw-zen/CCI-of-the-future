# Canonical Tag Issue - Fix Required

## Problem Identified
**URL:** https://cciservices.online/tapis
**Issue:** Page has canonical tag pointing to homepage instead of itself
**Status:** Not indexed by Google

## Current State
- User-declared canonical: `https://cciservices.online/` ❌ (Wrong - points to homepage)
- Google-selected canonical: `https://cciservices.online/` (Same as user-declared)
- **Result:** Google indexes homepage instead of `/tapis` page

## Required Fix

### Option 1: WordPress Theme Files
Find in your theme's `header.php` or template files where canonical is set:

```php
// WRONG - Current code (remove this):
<link rel="canonical" href="<?php echo home_url('/'); ?>">

// CORRECT - Replace with:
<link rel="canonical" href="<?php echo esc_url( get_permalink() ); ?>">
```

### Option 2: Using Yoast SEO or RankMath
1. Edit the `/tapis` page in WordPress
2. Scroll to SEO section
3. Under "Advanced" → "Canonical URL"
4. Either leave blank (auto-generates correct URL) or enter: `https://cciservices.online/tapis`

### Option 3: functions.php Fix
Add this to your theme's `functions.php`:

```php
// Fix canonical tags for all pages
add_action('wp_head', function() {
    if (is_singular() && !is_front_page()) {
        remove_action('wp_head', 'rel_canonical');
        echo '<link rel="canonical" href="' . esc_url(get_permalink()) . '">' . "\n";
    }
}, 1);
```

## Verification Steps
1. Visit https://cciservices.online/tapis
2. View page source (Ctrl+U)
3. Search for `rel="canonical"`
4. Verify it shows: `<link rel="canonical" href="https://cciservices.online/tapis">`

## After Fix
1. Update sitemap to include `/tapis`
2. Submit sitemap to Google Search Console
3. Request indexing for the `/tapis` URL
4. Wait 1-2 weeks for Google to re-crawl

## Priority: 🔴 HIGH - Must fix immediately
