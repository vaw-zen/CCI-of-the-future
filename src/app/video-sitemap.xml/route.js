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
  
  // Use NFC normalization to compose characters (keeps accents intact)
  let cleaned = str.normalize('NFC');
  
  // Remove emojis and special Unicode symbols while preserving French accented characters
  cleaned = cleaned
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc symbols & pictographs
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport & map
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation selectors
    .replace(/[\u{200D}]/gu, '')             // Zero-width joiner
    .replace(/[\u{E0020}-\u{E007F}]/gu, '') // Tags
    .replace(/[\u2728\ud83c\udfa5\ud83e\uddfd\ud83e\uddfc\ud83c\udfe0\ud83d\udcbc\u2b50\ufe0f\ud83d\udc4d\ud83d\udcaa\ud83d\udcde\ud83d\udce7\ud83c\udf10\ud83d\udccd]/g, '')
    // Fix mojibake
    .replace(/\u00c3\u00a9/g, '\u00e9').replace(/\u00c3\u00a8/g, '\u00e8').replace(/\u00c3 /g, '\u00e0')
    .replace(/\u00c3\u00b4/g, '\u00f4').replace(/\u00c3\u00a2/g, '\u00e2').replace(/\u00c3\u00a7/g, '\u00e7')
    // Fix smart quotes and dashes
    .replace(/[\u2018\u2019\u201A]/g, "'") 
    .replace(/[\u201C\u201D\u201E]/g, '"') 
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2026]/g, '...')
    // Remove control characters
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleaned;
}

// Extract a short title from message (for video:title, max 60 chars)
function extractVideoTitle(message, fallback) {
  if (!message || !message.trim()) return fallback;
  const cleaned = cleanUnicodeForXml(message);
  const firstSentence = cleaned.split(/[.!?\n]/)[0]?.trim();
  if (firstSentence && firstSentence.length > 5) {
    return firstSentence.length > 60 ? firstSentence.slice(0, 57) + '...' : firstSentence;
  }
  return cleaned.length > 60 ? cleaned.slice(0, 57) + '...' : cleaned;
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
      <video:title>${escapeXml(extractVideoTitle(reel.message, 'Vidéo CCI Services - Nettoyage Professionnel Tunis'))}</video:title>
      <video:description>${escapeXml(cleanUnicodeForXml(reel.message || 'Découvrez nos services de nettoyage professionnel en vidéo. CCI Services Tunis.'))}</video:description>
      <video:content_loc>${escapeXml(reel.permalink_url || `https://www.facebook.com/watch/?v=${reel.id}`)}</video:content_loc>
      <video:player_loc allow_embed="yes">${escapeXml(`${baseUrl}/reels/${reel.id}?player=1`)}</video:player_loc>
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