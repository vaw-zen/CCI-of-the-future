import { NextResponse } from 'next/server';
import { getAllArticles } from '../conseils/data/articles';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
  
  // Récupérer tous les articles
  const articles = getAllArticles();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Page principale des conseils -->
  <url>
    <loc>${baseUrl}/conseils</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
  
  <!-- Articles de conseils générés dynamiquement -->
  ${articles.map(article => {
    // Formater la date de modification
    const lastmod = article.updatedDate || article.publishedDate;
    const formattedDate = lastmod ? new Date(lastmod).toISOString() : new Date().toISOString();
    
    // Priorité basée sur les articles en vedette et les mots-clés populaires
    let priority = 0.80;
    if (article.featured) priority = 0.90;
    if (article.keywords.some(keyword => keyword.includes('prix') || keyword.includes('tarif'))) priority = 0.85;
    
    return `
  <url>
    <loc>${baseUrl}/conseils/${article.slug}</loc>
    <lastmod>${formattedDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('')}
</urlset>`;

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}