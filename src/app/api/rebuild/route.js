/**
 * API Route: /api/rebuild
 * Triggers Vercel deployment rebuild
 */

import { NextResponse } from 'next/server';
import { checkApiKey } from '../../../libs/auth.js';

/**
 * POST /api/rebuild
 * Triggers a Vercel deployment rebuild
 */
export async function POST(request) {
  // Check API key
  const authError = checkApiKey(request);
  if (authError) return authError;

  try {
    const body = await request.json().catch(() => ({}));
    const { reason } = body;
    
    const deployHook = process.env.VERCEL_DEPLOY_HOOK;
    
    if (!deployHook) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Deploy hook not configured',
          message: 'VERCEL_DEPLOY_HOOK environment variable is not set'
        },
        { status: 400 }
      );
    }
    
    // Trigger Vercel deployment
    const response = await fetch(deployHook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: reason || 'Manual rebuild via API',
        timestamp: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error(`Deploy hook responded with status: ${response.status}`);
    }
    
    const deploymentData = await response.json().catch(() => ({}));
    
    return NextResponse.json({
      success: true,
      message: 'Deployment triggered successfully',
      data: {
        reason: reason || 'Manual rebuild via API',
        timestamp: new Date().toISOString(),
        deployment: deploymentData
      }
    });
    
  } catch (error) {
    console.error('Error triggering rebuild:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to trigger rebuild',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/rebuild
 * Returns rebuild endpoint information
 */
export async function GET(request) {
  // Check API key
  const authError = checkApiKey(request);
  if (authError) return authError;

  const deployHook = process.env.VERCEL_DEPLOY_HOOK;
  
  return NextResponse.json({
    success: true,
    data: {
      endpoint: '/api/rebuild',
      method: 'POST',
      configured: !!deployHook,
      hookUrl: deployHook ? deployHook.replace(/\/[^\/]+$/, '/***') : null,
      usage: {
        description: 'Triggers a Vercel deployment rebuild',
        body: {
          reason: 'Optional reason for the rebuild'
        },
        headers: {
          'x-api-key': 'Your API key',
          'Content-Type': 'application/json'
        }
      }
    },
    message: 'Rebuild endpoint information'
  });
}