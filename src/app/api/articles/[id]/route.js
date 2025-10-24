/**
 * API Route: /api/articles/[id]
 * Handles GET (single article), PUT (update), and DELETE operations
 */

import { NextResponse } from 'next/server';
import { checkApiKey } from '../../../../libs/auth.js';
import { readArticles, writeArticles, findArticle, deployChanges } from '../../../../libs/fileUtils.js';

/**
 * GET /api/articles/[id]
 * Returns a single article by ID or slug
 */
export async function GET(request, { params }) {
  // Check API key
  const authError = checkApiKey(request);
  if (authError) return authError;

  try {
    const { id } = params;
    const articles = await readArticles();
    
    const article = findArticle(articles, id);
    
    if (!article) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Article not found',
          searchedFor: id
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: article,
      message: 'Article retrieved successfully'
    });
  } catch (error) {
    console.error('Error reading article:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to read article',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/articles/[id]
 * Updates an existing article
 */
export async function PUT(request, { params }) {
  // Check API key
  const authError = checkApiKey(request);
  if (authError) return authError;

  try {
    const { id } = params;
    const body = await request.json();
    
    // Read existing articles
    const articles = await readArticles();
    
    // Find article to update
    const articleIndex = articles.findIndex(a => 
      a.id === parseInt(id) || a.slug === id
    );
    
    if (articleIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Article not found',
          searchedFor: id
        },
        { status: 404 }
      );
    }
    
    const existingArticle = articles[articleIndex];
    
    // Update article with new data (preserve ID and slug unless explicitly changed)
    const updatedArticle = {
      ...existingArticle,
      ...body,
      id: existingArticle.id, // Always preserve original ID
      updatedDate: new Date().toISOString(),
      // Only update slug if explicitly provided
      slug: body.slug || existingArticle.slug
    };
    
    // Check for slug conflicts (if slug was changed)
    if (body.slug && body.slug !== existingArticle.slug) {
      const slugConflict = articles.find((a, index) => 
        a.slug === body.slug && index !== articleIndex
      );
      
      if (slugConflict) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Slug already exists',
            conflictingSlug: body.slug
          },
          { status: 400 }
        );
      }
    }
    
    // Replace the article
    articles[articleIndex] = updatedArticle;
    
    // Write articles to file
    const writeSuccess = await writeArticles(articles);
    
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
    const deploySuccess = await deployChanges(`Update article: ${updatedArticle.title}`);
    
    return NextResponse.json({
      success: true,
      data: updatedArticle,
      message: 'Article updated successfully',
      deployment: deploySuccess ? 'triggered' : 'not configured'
    });
    
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update article',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/articles/[id]
 * Deletes an article
 */
export async function DELETE(request, { params }) {
  // Check API key
  const authError = checkApiKey(request);
  if (authError) return authError;

  try {
    const { id } = params;
    
    // Read existing articles
    const articles = await readArticles();
    
    // Find article to delete
    const articleIndex = articles.findIndex(a => 
      a.id === parseInt(id) || a.slug === id
    );
    
    if (articleIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Article not found',
          searchedFor: id
        },
        { status: 404 }
      );
    }
    
    const deletedArticle = articles[articleIndex];
    
    // Remove article from array
    articles.splice(articleIndex, 1);
    
    // Write articles to file
    const writeSuccess = await writeArticles(articles);
    
    if (!writeSuccess) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to save changes' 
        },
        { status: 500 }
      );
    }
    
    // Trigger deployment if configured
    const deploySuccess = await deployChanges(`Delete article: ${deletedArticle.title}`);
    
    return NextResponse.json({
      success: true,
      data: {
        deleted: deletedArticle,
        remainingCount: articles.length
      },
      message: 'Article deleted successfully',
      deployment: deploySuccess ? 'triggered' : 'not configured'
    });
    
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete article',
        message: error.message 
      },
      { status: 500 }
    );
  }
}