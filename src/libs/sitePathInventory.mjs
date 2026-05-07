import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAllArticles } from '../app/conseils/data/articles.js';

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(MODULE_DIR, '../..');
const SITEMAP_ROUTE_PATH = path.join(REPO_ROOT, 'src/app/sitemap.xml/route.js');
const PRIORITY_SITEMAP_ROUTE_PATH = path.join(REPO_ROOT, 'src/app/sitemap-priority.xml/route.js');

function normalizeInventoryPath(value) {
  const text = String(value ?? '').trim();
  if (!text) {
    return '/';
  }

  if (text.startsWith('http://') || text.startsWith('https://')) {
    try {
      const parsed = new URL(text);
      return normalizeInventoryPath(parsed.pathname || '/');
    } catch (error) {
      return '/';
    }
  }

  const withLeadingSlash = text.startsWith('/') ? text : `/${text}`;
  if (withLeadingSlash === '/') {
    return '/';
  }

  return withLeadingSlash.replace(/\/+$/, '') || '/';
}

function readSource(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function extractBaseUrlTemplatePaths(source) {
  const paths = new Set();
  const matcher = /\$\{baseUrl\}(\/[^<"'`\s}]*)/g;

  for (const match of source.matchAll(matcher)) {
    paths.add(normalizeInventoryPath(match[1]));
  }

  return paths;
}

function extractQuotedPaths(source) {
  const paths = new Set();
  const matcher = /(['"])(\/[^'"`\r\n]+)\1/g;

  for (const match of source.matchAll(matcher)) {
    paths.add(normalizeInventoryPath(match[2]));
  }

  return paths;
}

function sortPaths(paths) {
  return [...new Set(paths.map((value) => normalizeInventoryPath(value)))].sort((left, right) => {
    if (left === right) {
      return 0;
    }

    if (left === '/') {
      return -1;
    }

    if (right === '/') {
      return 1;
    }

    return left.localeCompare(right);
  });
}

export function buildKeywordSitePathInventory() {
  const sitemapSource = readSource(SITEMAP_ROUTE_PATH);
  const prioritySitemapSource = readSource(PRIORITY_SITEMAP_ROUTE_PATH);

  const staticPaths = sortPaths([
    ...extractBaseUrlTemplatePaths(sitemapSource),
    ...extractQuotedPaths(prioritySitemapSource)
  ]);
  const articlePaths = sortPaths(getAllArticles().map((article) => `/conseils/${article.slug}`));
  const validPaths = new Set(sortPaths([...staticPaths, ...articlePaths]));

  return {
    staticPaths,
    articlePaths,
    validPaths
  };
}
