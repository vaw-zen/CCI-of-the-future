import { NextResponse } from 'next/server';

// Fonction pour récupérer les reels Facebook
async function getReelsData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
    
    const reelsRes = await fetch(`${baseUrl}/api/social/facebook?reels_limit=50`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!reelsRes.ok) {
      console.error('Failed to fetch reels data');
      return [];
    }

    const reelsData = await reelsRes.json();
    return reelsData.reels || [];
  } catch (error) {
    console.error('Error fetching reels data:', error);
    return [];
  }
}

// Fonction pour échapper les caractères XML
function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    // Additional safety for any remaining special characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters
}

// Fonction pour nettoyer les caractères Unicode problématiques
function cleanUnicodeForXml(str) {
  if (!str) return '';
  
  // First, normalize the string to handle Unicode properly
  let cleaned = str.normalize('NFD');
  
  // Remove or replace problematic Unicode characters that cause GSC issues
  cleaned = cleaned
    // Fix common emoji and special characters
    .replace(/[✨🎥🧽🧼🏠💼⭐️👍💪📞📧🌐📍]/g, '') // Remove emojis
    .replace(/â¨/g, '') // Remove corrupted sparkles
    .replace(/ð/g, '') // Remove corrupted emojis
    .replace(/Ã©/g, 'é') // Fix é
    .replace(/Ã¨/g, 'è') // Fix è
    .replace(/Ã /g, 'à') // Fix à
    .replace(/Ã´/g, 'ô') // Fix ô
    .replace(/Ã¢/g, 'â') // Fix â
    .replace(/Ã/g, 'À') // Fix À
    .replace(/â/g, "'") // Fix apostrophes
    .replace(/â/g, "'") // Fix apostrophes
    .replace(/â/g, '"') // Fix quotes
    .replace(/â/g, '"') // Fix quotes
    .replace(/â/g, '-') // Fix dashes
    // Remove any remaining non-printable or problematic characters
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/[^\x00-\x7F\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF]/g, '') // Keep only Latin characters
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleaned;
}

// Fonction pour formater la date en format ISO
function formatDate(dateString) {
  if (!dateString) return new Date().toISOString();
  return new Date(dateString).toISOString();
}

export async function GET() {
  try {
    const reels = await getReelsData();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';

    // Use thumbnail proxy API for reliable access
    const videoSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">${reels.map(reel => {
      
      return `
  <url>
    <loc>${baseUrl}/reels/${reel.id}</loc>
    <lastmod>${formatDate(reel.created_time)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <video:video>
      <video:thumbnail_loc>${baseUrl}/api/thumbnails/${reel.id}</video:thumbnail_loc>
      <video:title>${escapeXml(cleanUnicodeForXml(reel.message || 'Reel CCI Services'))}</video:title>
      <video:description>${escapeXml(cleanUnicodeForXml(reel.message || 'Vidéo reel publiée par CCI Services'))}</video:description>
      <video:content_loc>${escapeXml(reel.video_url || `${baseUrl}/api/video/${reel.id}`)}</video:content_loc>
      <video:player_loc allow_embed="yes">${escapeXml(`${baseUrl}/reels/${reel.id}?embed=true`)}</video:player_loc>
      ${reel.length ? `<video:duration>${Math.round(reel.length)}</video:duration>` : '<video:duration>30</video:duration>'}
      <video:publication_date>${formatDate(reel.created_time)}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>
      <video:requires_subscription>no</video:requires_subscription>
      <video:uploader info="${escapeXml(baseUrl)}">CCI Services</video:uploader>
      <video:platform relationship="allow">web mobile</video:platform>
      ${reel.views ? `<video:view_count>${Math.round(reel.views)}</video:view_count>` : ''}
      <video:tag>nettoyage professionnel</video:tag>
      <video:tag>services CCI</video:tag>
      <video:tag>entretien</video:tag>
      <video:tag>rénovation</video:tag>
    </video:video>
  </url>`;
    }).join('')}
</urlset>`;

    return new NextResponse(videoSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating video sitemap:', error);
    return new NextResponse('Error generating video sitemap', { status: 500 });
  }
}