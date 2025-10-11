import { NextResponse } from 'next/server';

// Fonction pour récupérer les posts Facebook
async function getPostsData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
    
    const postsRes = await fetch(`${baseUrl}/api/social/facebook?posts_limit=50`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!postsRes.ok) {
      console.error('Failed to fetch posts data');
      return [];
    }

    const postsData = await postsRes.json();
    return postsData.posts || [];
  } catch (error) {
    console.error('Error fetching posts data:', error);
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
  if (!dateString) return new Date().toISOString().split('T')[0];
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return new Date().toISOString().split('T')[0];
  }
}

// Fonction pour calculer la priorité
function calculatePostPriority(post) {
  try {
    const now = new Date();
    const postDate = new Date(post.created_time);
    const daysDiff = (now - postDate) / (1000 * 60 * 60 * 24);
    
    // Plus récent = priorité plus élevée
    if (daysDiff <= 7) return '0.9'; // Très récent
    if (daysDiff <= 30) return '0.8'; // Récent
    if (daysDiff <= 90) return '0.7'; // Moyennement récent
    return '0.6'; // Plus ancien
  } catch (error) {
    return '0.7'; // Priorité par défaut
  }
}

export async function GET() {
  try {
    const posts = await getPostsData();
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';

    // Créer le XML du sitemap pour les posts
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Sitemap Posts Facebook - CCI Services -->
  <!-- Total posts: ${posts.length} -->
  
  <!-- Page principale des blogs (contient tous les posts) -->
  <url>
    <loc>${escapeXml(SITE_URL)}/blogs</loc>
    <lastmod>${formatDate(posts[0]?.created_time)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  ${posts.map(post => {
    try {
      // Créer une URL interne pour le post basée sur son ID
      const postSlug = `post-${post.id.split('_')[1] || post.id}`;
      const internalUrl = `${SITE_URL}/blogs#${postSlug}`;
      
      return `  <url>
    <loc>${escapeXml(internalUrl)}</loc>
    <lastmod>${formatDate(post.created_time)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${calculatePostPriority(post)}</priority>
  </url>`;
    } catch (error) {
      console.error('Error processing post:', post.id, error);
      return '';
    }
  }).filter(Boolean).join('\n')}
</urlset>`;

    return new NextResponse(sitemapXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating posts sitemap:', error);
    
    // Retour d'un sitemap minimal en cas d'erreur
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online'}/blogs</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new NextResponse(fallbackXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  }
}