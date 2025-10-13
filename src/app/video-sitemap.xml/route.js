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
    .replace(/'/g, '&apos;');
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

    // Générer le XML du sitemap vidéo avec une URL individuelle pour chaque reel
    const videoSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">${reels.map(reel => {
      // Construire l'URL complète Facebook pour player_loc
      let playerUrl = reel.permalink_url;
      if (playerUrl) {
        // Si c'est une URL relative (commence par / ou ne contient pas facebook.com)
        if (!playerUrl.startsWith('http')) {
          playerUrl = `https://www.facebook.com${playerUrl}`;
        } else if (!playerUrl.includes('facebook.com')) {
          // Si c'est une URL complète mais pas Facebook, forcer Facebook
          playerUrl = `https://www.facebook.com/reel/${playerUrl.split('/').pop()}`;
        }
        // Assurer que c'est bien une URL Facebook complète
        if (!playerUrl.startsWith('https://www.facebook.com') && !playerUrl.startsWith('https://m.facebook.com')) {
          playerUrl = `https://www.facebook.com${playerUrl.replace(/^https?:\/\/[^\/]+/, '')}`;
        }
      } else {
        // URL par défaut si permalink_url manque
        playerUrl = `https://www.facebook.com/Chaabanes.Cleaning.Intelligence/`;
      }
      
      return `
  <url>
    <loc>${baseUrl}/reels/${reel.id}</loc>
    <lastmod>${formatDate(reel.created_time)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <video:video>
      <video:thumbnail_loc>${escapeXml(reel.thumbnail)}</video:thumbnail_loc>
      <video:title>${escapeXml(reel.message || 'Reel CCI Services')}</video:title>
      <video:description>${escapeXml((reel.message || 'Vidéo reel publiée par CCI Services').slice(0, 2048))}</video:description>
      <video:content_loc>${escapeXml(reel.video_url)}</video:content_loc>
      <video:player_loc>${escapeXml(`${baseUrl}/reels/${reel.id}`)}</video:player_loc>
      ${reel.length ? `<video:duration>${Math.round(reel.length)}</video:duration>` : '<video:duration>30</video:duration>'}
      <video:publication_date>${formatDate(reel.created_time)}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>
      <video:requires_subscription>no</video:requires_subscription>
      <video:uploader info="${baseUrl}">CCI Services</video:uploader>
      <video:platform relationship="allow">web mobile</video:platform>
      ${reel.views ? `<video:view_count>${reel.views}</video:view_count>` : ''}
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