import { NextResponse } from 'next/server';
import { getAllArticles } from '../conseils/data/articles';

// Fonction pour récupérer les reels
async function getReelsForSitemap() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
    
    const response = await fetch(`${baseUrl}/api/social/facebook?reels_limit=50`, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      console.error('Failed to fetch reels for sitemap');
      return [];
    }

    const data = await response.json();
    return data.reels || [];
  } catch (error) {
    console.error('Error fetching reels for sitemap:', error);
    return [];
  }
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
  const currentDate = new Date().toISOString().split('T')[0];

  // Récupérer tous les articles dynamiquement
  const articles = getAllArticles();
  
  // Récupérer tous les reels dynamiquement
  const reels = await getReelsForSitemap();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!--Page d'accueil-->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.00</priority>
  </url>
  <!--Page services-->
  <url>
    <loc>${baseUrl}/services</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
  <!--Page nettoyage marbre-->
  <url>
    <loc>${baseUrl}/marbre</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <!--Page nettoyage tapis-->
  <url>
    <loc>${baseUrl}/tapis</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <!--Page services de tapisserie-->
  <url>
    <loc>${baseUrl}/tapisserie</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <!--Page nettoyage salon-->
  <url>
    <loc>${baseUrl}/salon</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
  </url>
  <!--Page nettoyage post chantier-->
  <url>
    <loc>${baseUrl}/tfc</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
  </url>
  <!--About us-->
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.70</priority>
  </url>
  <!--Contact-->
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
  <!--Faq-->
  <url>
    <loc>${baseUrl}/faq</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.60</priority>
  </url>
  <!--Reels and Posts (Server-Side Rendered, SEO Optimized)-->
  <url>
    <loc>${baseUrl}/blogs</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.95</priority>
  </url>
  <!--Equipe-->
  <url>
    <loc>${baseUrl}/team</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.50</priority>
  </url>
  <!--Simulateur de devis-->
  <url>
    <loc>${baseUrl}/devis</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.50</priority>
  </url>
  <!-- Page d'Articles de conseils et astuces informatives -->
  <url>
    <loc>${baseUrl}/conseils</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
  <!-- Articles individuels - Générés dynamiquement -->
  ${articles.map(article => `
  <url>
    <loc>${baseUrl}/conseils/${article.slug}</loc>
    <lastmod>${article.updatedDate || article.publishedDate || currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${article.featured ? '0.90' : '0.85'}</priority>
  </url>`).join('')}
  <!-- Reels individuels - Générés dynamiquement -->
  ${reels.map(reel => `
  <url>
    <loc>${baseUrl}/reels/${reel.id}</loc>
    <lastmod>${reel.created_time ? new Date(reel.created_time).toISOString().split('T')[0] : currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.75</priority>
  </url>`).join('')}
</urlset>`;

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
    },
  });
}