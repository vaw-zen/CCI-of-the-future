const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { google } = require('googleapis');

function loadEnv(envPath = path.resolve('.env.local')) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
  return envPath;
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
}

function getSearchConsoleProperty() {
  if (process.env.GSC_SITE_URL) {
    return process.env.GSC_SITE_URL;
  }

  const hostname = new URL(getSiteUrl()).hostname;
  return `sc-domain:${hostname}`;
}

function getGscCredentials() {
  const raw = process.env.GSC_CREDENTIALS;
  if (!raw) {
    throw new Error('Missing GSC_CREDENTIALS in .env.local');
  }

  let credentials;
  try {
    credentials = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid GSC_CREDENTIALS JSON: ${error.message}`);
  }

  if (!credentials.client_email || !credentials.private_key || !credentials.project_id) {
    throw new Error('GSC_CREDENTIALS is missing client_email, private_key, or project_id');
  }

  return credentials;
}

function createGoogleAuth(scopes) {
  const credentials = getGscCredentials();

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key.replace(/\\n/g, '\n'),
      project_id: credentials.project_id,
    },
    scopes,
  });
}

function readUrlsFromFile(filePath) {
  return fs
    .readFileSync(path.resolve(filePath), 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function timestamp() {
  return new Date().toISOString().replace(/[:]/g, '-');
}

module.exports = {
  createGoogleAuth,
  getSearchConsoleProperty,
  getSiteUrl,
  loadEnv,
  readUrlsFromFile,
  timestamp,
};
