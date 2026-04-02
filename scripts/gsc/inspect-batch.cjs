#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const {
  createGoogleAuth,
  getSearchConsoleProperty,
  loadEnv,
  readUrlsFromFile,
  timestamp,
} = require('./utils.cjs');

async function main() {
  loadEnv();

  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error('Usage: node scripts/gsc/inspect-batch.cjs <urlsFile> [outputPath] [property]');
    process.exit(1);
  }

  const outputPath =
    process.argv[3] || path.resolve(`scripts/gsc/reports/url-inspection-${timestamp()}.json`);
  const property = process.argv[4] || getSearchConsoleProperty();
  const urls = readUrlsFromFile(inputPath);

  const auth = createGoogleAuth(['https://www.googleapis.com/auth/webmasters.readonly']);
  const authClient = await auth.getClient();
  const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });

  const results = [];

  for (const inspectionUrl of urls) {
    try {
      const response = await searchconsole.urlInspection.index.inspect({
        requestBody: {
          inspectionUrl,
          siteUrl: property,
          languageCode: 'fr-TN',
        },
      });

      results.push({
        inspectionUrl,
        success: true,
        result: response.data,
      });
      console.log(`Inspected: ${inspectionUrl}`);
    } catch (error) {
      results.push({
        inspectionUrl,
        success: false,
        error: error.message || String(error),
      });
      console.warn(`Failed: ${inspectionUrl}`);
    }
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify(
      {
        property,
        inspectedAt: new Date().toISOString(),
        totalUrls: urls.length,
        results,
      },
      null,
      2
    )}\n`
  );

  console.log(`Saved inspection report to ${outputPath}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
