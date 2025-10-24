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
  console.log('POST /api/rebuild - Starting rebuild request');
  
  // Check API key
  const authError = checkApiKey(request);
  if (authError) {
    console.log('POST /api/rebuild - Authentication failed');
    return authError;
  }

  try {
    console.log('POST /api/rebuild - Parsing request body');
    const body = await request.json().catch(() => ({}));
    const { reason } = body;
    
    const deployHook = process.env.VERCEL_DEPLOY_HOOK;
    console.log('POST /api/rebuild - Deploy hook configured:', !!deployHook);
    console.log('POST /api/rebuild - Deploy hook (masked):', deployHook ? deployHook.replace(/\/[^\/]+$/, '/***') : 'NOT SET');
    
    if (!deployHook) {
      console.log('POST /api/rebuild - Deploy hook not configured');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Deploy hook not configured',
          message: 'VERCEL_DEPLOY_HOOK environment variable is not set',
          debug: {
            env: process.env.NODE_ENV,
            vercel: !!process.env.VERCEL,
            availableEnvVars: Object.keys(process.env).filter(key => key.includes('VERCEL')).sort()
          }
        },
        { status: 400 }
      );
    }
    
    console.log('POST /api/rebuild - Triggering Vercel deployment');
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
    
    console.log('POST /api/rebuild - Deploy hook response status:', response.status);
    console.log('POST /api/rebuild - Deploy hook response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('POST /api/rebuild - Deploy hook error:', errorText);
      throw new Error(`Deploy hook responded with status: ${response.status} - ${errorText}`);
    }
    
    const deploymentData = await response.json().catch(() => ({}));
    console.log('POST /api/rebuild - Deployment triggered successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Deployment triggered successfully',
      data: {
        reason: reason || 'Manual rebuild via API',
        timestamp: new Date().toISOString(),
        deployment: deploymentData,
        hookStatus: response.status
      }
    });
    
  } catch (error) {
    console.error('POST /api/rebuild - Error occurred:', error);
    console.error('POST /api/rebuild - Error stack:', error.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to trigger rebuild',
        message: error.message,
        debug: {
          env: process.env.NODE_ENV,
          vercel: !!process.env.VERCEL,
          hookConfigured: !!process.env.VERCEL_DEPLOY_HOOK
        }
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