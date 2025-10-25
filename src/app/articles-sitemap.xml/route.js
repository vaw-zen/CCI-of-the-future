import { NextResponse } from 'next/server';
import { getAllArticles } from '../conseils/data/articles.js';

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
    
    // Récupérer tous les articles
    const articles = getAllArticles();

    // Fonction pour formater la date de manière sûre
    const formatDate = (dateString) => {
      try {
        if (!dateString) return new Date().toISOString().split('T')[0];
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? new Date().toISOString().split('T')[0] : date.toISOString().split('T')[0];
      } catch {
        return new Date().toISOString().split('T')[0];
      }
    };

    // Générer les URLs des articles
    const articleUrls = articles.map(article => {
      const lastmod = formatDate(article.updatedDate || article.publishedDate);
      let priority = 0.80;
      
      if (article.featured) priority = 0.90;
      if (article.keywords && article.keywords.some(keyword => 
        keyword.includes('prix') || keyword.includes('tarif')
      )) priority = 0.85;
      
      return `  <url>
    <loc>${baseUrl}/conseils/${article.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority.toFixed(2)}</priority>
  </url>`;
    }).join('\n');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Page principale des conseils -->
  <url>
    <loc>${baseUrl}/conseils</loc>
    <lastmod>${formatDate()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
  
  <!-- Articles de conseils générés dynamiquement -->
${articleUrls}
</urlset>`;

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating articles sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}