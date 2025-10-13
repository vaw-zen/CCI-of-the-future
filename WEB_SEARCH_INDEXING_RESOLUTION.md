# Web Search Indexing API Permission Resolution Guide

## Issue Diagnosis
✅ **Search Console API Access**: Working (service account has siteFullUser access)  
❌ **Web Search Indexing API**: Permission denied  

The Web Search Indexing API has stricter permission requirements than the regular Search Console API.

## Resolution Steps

### Step 1: Verify Web Search Indexing API is Enabled
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select project: `cci-8bd10`
3. Navigate to **APIs & Services** > **Enabled APIs**
4. Search for "Web Search Indexing API"
5. If not enabled, click **Enable**

### Step 2: Add Service Account to Web Search Indexing (Different from GSC)
The Web Search Indexing API requires **separate permission setup**:

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select property: `https://cciservices.online/`
3. Go to **Settings** > **Users and permissions**
4. Click **Add user**
5. Add: `cci-8bd10@appspot.gserviceaccount.com`
6. **Permission level**: Choose **Owner** (not just Full User)
7. Click **Add**

### Step 3: Verify Domain Property Access
Make sure the service account also has access to the domain property:

1. In Google Search Console, switch to: `sc-domain:cciservices.online`
2. Go to **Settings** > **Users and permissions**
3. Verify `cci-8bd10@appspot.gserviceaccount.com` is listed with **Owner** permissions
4. If not, add it with **Owner** permissions

### Step 4: Wait for Permission Propagation
- Web Search Indexing API permissions can take **2-24 hours** to propagate
- This is longer than regular Search Console permissions

### Step 5: Alternative Approach - Use Search Console Bulk URL Submission
If the API continues to have issues, we can use the Search Console UI for bulk submissions:

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select `https://cciservices.online/`
3. Go to **URL Inspection**
4. Submit URLs manually or use **Sitemaps** section

## Current Status
- ✅ Service Account: `cci-8bd10@appspot.gserviceaccount.com`
- ✅ GSC Property Access: Confirmed (siteFullUser)
- ❌ Web Search Indexing API: Permission denied
- 🕒 Next Test: Wait 2-4 hours and retry

## URLs Ready for Submission
When permissions are working, these URLs are ready:
1. https://cciservices.online/conseils
2. https://cciservices.online/conseils/nettoyage-voiture-interieur-tunis-2025
3. https://cciservices.online/conseils/nettoyage-canape-tunis-2025
4. https://cciservices.online/conseils/tarif-nettoyage-tapis-tunis-2025
5. https://cciservices.online/conseils/detachage-moquette-tunis-2025
6. https://cciservices.online/conseils/nettoyage-a-sec-tunis-2025

## Testing Commands
```bash
# Test GSC access (should work)
node gsc-diagnostic.js

# Test Web Search Indexing API (currently failing)
node test-indexing-api.js

# Full URL submission (when ready)
node scripts/submit-urls-indexing.cjs
```