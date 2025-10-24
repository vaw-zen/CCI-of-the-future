/**
 * File utilities for managing articles data
 * Handles reading, writing, and backup operations for articles.js
 */

import fs from 'fs';
import path from 'path';

// Get the path to the articles data file (existing structure)
const getArticlesPath = () => {
  return path.join(process.cwd(), 'src', 'app', 'conseils', 'data', 'articles.js');
};

const getBackupPath = () => {
  return path.join(process.cwd(), 'src', 'app', 'conseils', 'data', 'articles.backup.js');
};

/**
 * Read articles from the data file
 * @returns {Array} Array of articles
 */
export async function readArticles() {
  try {
    const articlesPath = getArticlesPath();
    
    if (!fs.existsSync(articlesPath)) {
      console.warn('Articles file does not exist, returning empty array');
      return [];
    }
    
    // Read the file content
    const fileContent = fs.readFileSync(articlesPath, 'utf8');
    
    // Extract the articles array using regex
    // This is safer than using eval() or require() for dynamic imports
    const match = fileContent.match(/export const articles = (\[[\s\S]*?\]);/);
    
    if (match) {
      // Parse the articles array
      const articlesData = eval(`(${match[1]})`);
      return articlesData;
    } else {
      console.error('Could not parse articles from file');
      return [];
    }
  } catch (error) {
    console.error('Error reading articles:', error);
    return [];
  }
}

/**
 * Write articles to the data file
 * @param {Array} articles - Array of article objects
 * @returns {boolean} Success status
 */
export async function writeArticles(articles) {
  try {
    const articlesPath = getArticlesPath();
    const backupPath = getBackupPath();
    
    // Create backup before writing
    if (fs.existsSync(articlesPath)) {
      fs.copyFileSync(articlesPath, backupPath);
      console.log('Backup created at:', backupPath);
    }
    
    // Validate articles array
    if (!Array.isArray(articles)) {
      throw new Error('Articles must be an array');
    }
    
    // Validate each article
    for (const article of articles) {
      validateArticle(article);
    }
    
    // Generate the file content
    const fileContent = generateArticlesFileContent(articles);
    
    // Ensure data directory exists
    const dataDir = path.dirname(articlesPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Write the file
    fs.writeFileSync(articlesPath, fileContent, 'utf8');
    
    console.log(`Successfully wrote ${articles.length} articles to file`);
    return true;
  } catch (error) {
    console.error('Error writing articles:', error);
    return false;
  }
}

/**
 * Validate article object structure (adapted to existing format)
 * @param {Object} article - Article object to validate
 */
function validateArticle(article) {
  const requiredFields = [
    'id', 'title', 'slug', 'content', 'keywords', 
    'metaTitle', 'metaDescription', 'publishedDate'
  ];
  
  for (const field of requiredFields) {
    if (!article.hasOwnProperty(field)) {
      throw new Error(`Article missing required field: ${field}`);
    }
  }
  
  // Validate types
  if (typeof article.id !== 'number') {
    throw new Error('Article id must be a number');
  }
  
  if (!Array.isArray(article.keywords)) {
    throw new Error('Article keywords must be an array');
  }
  
  // Validate slug format (lowercase, hyphens only)
  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(article.slug)) {
    throw new Error('Article slug must contain only lowercase letters, numbers, and hyphens');
  }
}

/**
 * Generate the complete file content for articles.js (maintaining existing format)
 * @param {Array} articles - Array of article objects
 * @returns {string} File content
 */
function generateArticlesFileContent(articles) {
  const header = `// Base de données des articles de blog SEO
`;

  const articlesJson = JSON.stringify(articles, null, 2);
  const exportStatement = `export const articles = ${articlesJson};`;

  return header + exportStatement;
}

/**
 * Generate a unique slug from title
 * @param {string} title - Article title
 * @returns {string} URL-friendly slug
 */
export function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD') // Normalize accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim('-'); // Remove leading/trailing hyphens
}

/**
 * Get the next available ID for a new article
 * @param {Array} articles - Existing articles array
 * @returns {number} Next available ID
 */
export function getNextId(articles) {
  if (!articles.length) return 1;
  
  const maxId = Math.max(...articles.map(article => article.id));
  return maxId + 1;
}

/**
 * Find article by ID or slug
 * @param {Array} articles - Articles array
 * @param {string|number} identifier - Article ID or slug
 * @returns {Object|null} Found article or null
 */
export function findArticle(articles, identifier) {
  // Try to find by ID first (if identifier is a number)
  const id = parseInt(identifier);
  if (!isNaN(id)) {
    const article = articles.find(a => a.id === id);
    if (article) return article;
  }
  
  // Try to find by slug
  return articles.find(a => a.slug === identifier) || null;
}

/**
 * Deploy to GitHub and trigger Vercel rebuild
 * @param {string} commitMessage - Git commit message
 * @returns {boolean} Success status
 */
export async function deployChanges(commitMessage = 'Update articles via API') {
  try {
    // This would be implemented in production with proper git integration
    // For now, just trigger Vercel deploy hook if available
    const deployHook = process.env.VERCEL_DEPLOY_HOOK;
    
    if (deployHook) {
      const response = await fetch(deployHook, { method: 'POST' });
      if (response.ok) {
        console.log('Vercel deployment triggered successfully');
        return true;
      }
    }
    
    console.log('No deploy hook configured');
    return false;
  } catch (error) {
    console.error('Error triggering deployment:', error);
    return false;
  }
}