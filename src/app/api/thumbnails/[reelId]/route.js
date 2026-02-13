import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { reelId } = await params;
    
    if (!reelId) {
      return new NextResponse('Reel ID required', { status: 400 });
    }

    // Fetch Facebook data to get original thumbnail
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
    const facebookRes = await fetch(`${baseUrl}/api/social/facebook?reels_limit=50`, {
      next: { revalidate: 3600 } // Cache Facebook API response for 1 hour
    });
    
    if (!facebookRes.ok) {
      return new NextResponse('Failed to fetch Facebook data', { status: 502 });
    }

    const data = await facebookRes.json();
    const reel = data.reels?.find(r => r.id === reelId);

    if (!reel || !reel.thumbnail) {
      // Return a fallback placeholder image instead of 404
      // This ensures Google always gets a valid image response
      return NextResponse.redirect(new URL('/logo.png', request.url), 302);
    }

    // Fetch the thumbnail from Facebook CDN and proxy it directly
    try {
      const imageResponse = await fetch(reel.thumbnail, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (!imageResponse.ok) {
        // Facebook CDN URL expired — redirect to logo as fallback
        return NextResponse.redirect(new URL('/logo.png', request.url), 302);
      }

      const imageBuffer = await imageResponse.arrayBuffer();
      
      // Serve the image directly from memory (no filesystem write — works on serverless)
      return new NextResponse(Buffer.from(imageBuffer), {
        headers: {
          'Content-Type': imageResponse.headers.get('content-type') || 'image/jpeg',
          'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
        },
      });

    } catch (downloadError) {
      console.error('Error downloading thumbnail:', downloadError);
      return NextResponse.redirect(new URL('/logo.png', request.url), 302);
    }

  } catch (error) {
    console.error('Error in thumbnail proxy:', error);
    return NextResponse.redirect(new URL('/logo.png', request.url), 302);
  }
}