/**
 * API Route: /api/articles
 * Handles GET (list all articles) and POST (create new article) operations
 */

import { NextResponse } from 'next/server';
import { checkApiKey } from '../../../libs/auth.js';
import { articles } from '../../conseils/data/articles.js';
import { readArticles, writeArticles, getNextId, generateSlug, deployChanges } from '../../../libs/fileUtils.js';

/**
 * GET /api/articles
 * Returns all articles from the existing articles.js file
 */
export async function GET(request) {
  // Check API key
  const authError = checkApiKey(request);
  if (authError) return authError;

  try {
    // Use the imported articles directly for better performance and reliability
    return NextResponse.json({
      success: true,
      data: articles,
      count: articles.length,
      message: 'Articles retrieved successfully',
      source: 'src/app/conseils/data/articles.js'
    });
  } catch (error) {
    console.error('Error reading articles:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to read articles',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/articles
 * Creates a new article
 */
export async function POST(request) {
  // Check API key
  const authError = checkApiKey(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    
    // Read existing articles using file operations (for write operations)
    const existingArticles = await readArticles();
    
    // Generate ID if not provided
    if (!body.id) {
      body.id = getNextId(existingArticles);
    }
    
    // Generate slug if not provided
    if (!body.slug && body.title) {
      body.slug = generateSlug(body.title);
    }
    
    // Set default values for required fields
    const newArticle = {
      id: body.id,
      slug: body.slug,
      title: body.title,
      metaTitle: body.metaTitle || body.title,
      metaDescription: body.metaDescription || body.excerpt || '',
      excerpt: body.excerpt || '',
      category: body.category || 'general',
      categoryLabel: body.categoryLabel || 'Général',
      keywords: Array.isArray(body.keywords) ? body.keywords : [],
      author: body.author || 'CCI Services',
      authorImage: body.authorImage || '/logo.png',
      publishedDate: body.publishedDate || new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      image: body.image || '/default-article.jpg',
      imageAlt: body.imageAlt || body.title,
      readTime: body.readTime || '5 min',
      featured: body.featured || false,
      content: body.content || ''
    };
    
    // Check for duplicate ID
    if (existingArticles.find(a => a.id === newArticle.id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Article with this ID already exists',
          suggestion: `Try using ID ${getNextId(existingArticles)}`
        },
        { status: 400 }
      );
    }
    
    // Check for duplicate slug
    if (existingArticles.find(a => a.slug === newArticle.slug)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Article with this slug already exists',
          suggestion: `Try slug: ${newArticle.slug}-${newArticle.id}`
        },
        { status: 400 }
      );
    }
    
    // Add new article
    existingArticles.push(newArticle);
    
    // Write articles to file
    const writeSuccess = await writeArticles(existingArticles);
    
    if (!writeSuccess) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to save article' 
        },
        { status: 500 }
      );
    }
    
    // Trigger deployment if configured
    const deploySuccess = await deployChanges(`Add article: ${newArticle.title}`);
    
    return NextResponse.json({
      success: true,
      data: newArticle,
      message: 'Article created successfully',
      deployment: deploySuccess ? 'triggered' : 'not configured',
      totalArticles: existingArticles.length
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create article',
        message: error.message 
      },
      { status: 500 }
    );
  }
}