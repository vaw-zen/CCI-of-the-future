import { NextResponse } from 'next/server';
import { writeFile, mkdir, access } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  try {
    const { reelId } = await params;
    
    if (!reelId) {
      return new NextResponse('Reel ID required', { status: 400 });
    }

    // Check if thumbnail already exists locally
    const publicDir = path.join(process.cwd(), 'public', 'thumbnails');
    const thumbnailPath = path.join(publicDir, `${reelId}.jpg`);
    const publicUrl = `/thumbnails/${reelId}.jpg`;

    // If file exists, redirect to it
    if (existsSync(thumbnailPath)) {
      return NextResponse.redirect(new URL(publicUrl, request.url));
    }

    // Fetch Facebook data to get original thumbnail
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
    const facebookRes = await fetch(`${baseUrl}/api/social/facebook?reels_limit=50`);
    
    if (!facebookRes.ok) {
      return new NextResponse('Failed to fetch Facebook data', { status: 500 });
    }

    const data = await facebookRes.json();
    const reel = data.reels?.find(r => r.id === reelId);

    if (!reel || !reel.thumbnail) {
      return new NextResponse('Reel not found or no thumbnail', { status: 404 });
    }

    // Download and cache the thumbnail
    try {
      const imageResponse = await fetch(reel.thumbnail, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!imageResponse.ok) {
        return new NextResponse('Failed to fetch original thumbnail', { status: 404 });
      }

      const imageBuffer = await imageResponse.arrayBuffer();
      
      // Ensure thumbnails directory exists
      await mkdir(publicDir, { recursive: true });
      
      // Save the image
      await writeFile(thumbnailPath, Buffer.from(imageBuffer));
      
      // Return the cached image
      return new NextResponse(Buffer.from(imageBuffer), {
        headers: {
          'Content-Type': imageResponse.headers.get('content-type') || 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'CDN-Cache-Control': 'public, max-age=31536000',
        },
      });

    } catch (downloadError) {
      console.error('Error downloading thumbnail:', downloadError);
      
      // Fallback to placeholder
      const placeholderPath = path.join(process.cwd(), 'public', 'icons', 'video-placeholder.svg');
      if (existsSync(placeholderPath)) {
        return NextResponse.redirect(new URL('/icons/video-placeholder.svg', request.url));
      }
      
      return new NextResponse('Thumbnail not available', { status: 404 });
    }

  } catch (error) {
    console.error('Error in thumbnail proxy:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}