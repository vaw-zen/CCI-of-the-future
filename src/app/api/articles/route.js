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
  console.log('POST /api/articles - Starting request processing');
  
  // Check API key
  const authError = checkApiKey(request);
  if (authError) {
    console.log('POST /api/articles - Authentication failed');
    return authError;
  }

  try {
    console.log('POST /api/articles - Parsing request body');
    const body = await request.json();
    console.log('POST /api/articles - Request body parsed:', { title: body.title, id: body.id });
    
    // Read existing articles using file operations (for write operations)
    console.log('POST /api/articles - Reading existing articles');
    const existingArticles = await readArticles();
    console.log('POST /api/articles - Found existing articles:', existingArticles.length);
    
    // Generate ID if not provided
    if (!body.id) {
      body.id = getNextId(existingArticles);
      console.log('POST /api/articles - Generated new ID:', body.id);
    }
    
    // Generate slug if not provided
    if (!body.slug && body.title) {
      body.slug = generateSlug(body.title);
      console.log('POST /api/articles - Generated slug:', body.slug);
    }
    
    // Set default values to match existing articles.js structure
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
    
    console.log('POST /api/articles - Created article object:', { id: newArticle.id, title: newArticle.title });
    
    // Check for duplicate ID
    if (existingArticles.find(a => a.id === newArticle.id)) {
      console.log('POST /api/articles - Duplicate ID found');
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
      console.log('POST /api/articles - Duplicate slug found');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Article with this slug already exists',
          suggestion: `Try slug: ${newArticle.slug}-${newArticle.id}`
        },
        { status: 400 }
      );
    }
    
    // Add new article to array (for validation and response)
    const updatedArticles = [...existingArticles, newArticle];
    console.log('POST /api/articles - Article added to array, total articles:', updatedArticles.length);
    
    // In production (Vercel), we can't write to filesystem
    // So we'll accept the article but note that persistence requires deployment
    let writeSuccess = true;
    let persistenceMessage = 'accepted';
    
    if (process.env.VERCEL) {
      console.log('POST /api/articles - Running in Vercel, filesystem is read-only');
      persistenceMessage = 'accepted but requires deployment to persist';
    } else {
      // Try to write in local development
      console.log('POST /api/articles - Attempting to write to filesystem');
      writeSuccess = await writeArticles(updatedArticles);
      console.log('POST /api/articles - Write operation result:', writeSuccess);
      persistenceMessage = writeSuccess ? 'saved to filesystem' : 'filesystem write failed';
    }
    
    // Always trigger deployment if configured (this will persist the article)
    console.log('POST /api/articles - Triggering deployment');
    const deploySuccess = await deployChanges(`Add article: ${newArticle.title}`);
    console.log('POST /api/articles - Deployment result:', deploySuccess);
    
    console.log('POST /api/articles - Successfully processed article');
    return NextResponse.json({
      success: true,
      data: newArticle,
      message: 'Article created successfully',
      persistence: persistenceMessage,
      deployment: deploySuccess ? 'triggered' : 'not configured',
      totalArticles: updatedArticles.length,
      note: process.env.VERCEL ? 'Article will be persisted on next deployment' : 'Article saved locally'
    }, { status: 201 });
    
  } catch (error) {
    console.error('POST /api/articles - Error occurred:', error);
    console.error('POST /api/articles - Error stack:', error.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create article',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}