import { NextResponse } from 'next/server';

// API endpoint to serve video content URLs for GSC video:content_loc
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Video ID required' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
    
    // Fetch reel data to get video_url
    const response = await fetch(`${baseUrl}/api/social/facebook?reels_limit=50`, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch video data' }, { status: 500 });
    }

    const data = await response.json();
    const reel = data.reels?.find(r => r.id === id);

    if (!reel || !reel.video_url) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Redirect to the actual Facebook video URL for GSC content_loc
    return NextResponse.redirect(reel.video_url, 302);

  } catch (error) {
    console.error('Video API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}