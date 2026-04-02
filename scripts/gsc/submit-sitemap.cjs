#!/usr/bin/env node

const { google } = require('googleapis');
const {
  createGoogleAuth,
  getSearchConsoleProperty,
  getSiteUrl,
  loadEnv,
} = require('./utils.cjs');

async function main() {
  loadEnv();

  const property = process.argv[2] || getSearchConsoleProperty();
  const sitemapUrl = process.argv[3] || `${getSiteUrl()}/sitemap-index.xml`;

  const auth = createGoogleAuth(['https://www.googleapis.com/auth/webmasters']);
  const authClient = await auth.getClient();
  const webmasters = google.webmasters({ version: 'v3', auth: authClient });

  await webmasters.sitemaps.submit({
    siteUrl: property,
    feedpath: sitemapUrl,
  });

  console.log(`Submitted sitemap ${sitemapUrl} to property ${property}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
