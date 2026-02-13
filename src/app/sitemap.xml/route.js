import { NextResponse } from 'next/server';



export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
  // Use realistic last-modified dates instead of always today
  const staticDates = {
    home: '2026-02-01',
    services: '2026-01-15',
    marbre: '2026-01-20',
    tapis: '2026-01-20',
    tapisserie: '2026-01-20',
    salon: '2026-01-20',
    tfc: '2026-01-15',
    about: '2025-12-01',
    contact: '2026-01-10',
    faq: '2026-01-10',
    blogs: '2026-02-10',
    team: '2025-11-15',
    devis: '2026-02-01',
    entreprises: '2026-01-15',
    conseils: '2026-02-10'
  };

  // Récupérer tous les articles dynamiquement — articles are now only in articles-sitemap.xml to avoid duplication
  


  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!--Page d'accueil-->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${staticDates.home}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.00</priority>
  </url>
  <!--Page services-->
  <url>
    <loc>${baseUrl}/services</loc>
    <lastmod>${staticDates.services}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
  <!--Page nettoyage marbre-->
  <url>
    <loc>${baseUrl}/marbre</loc>
    <lastmod>${staticDates.marbre}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <!--Page nettoyage tapis-->
  <url>
    <loc>${baseUrl}/tapis</loc>
    <lastmod>${staticDates.tapis}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <!--Page services de tapisserie-->
  <url>
    <loc>${baseUrl}/tapisserie</loc>
    <lastmod>${staticDates.tapisserie}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <!--Page nettoyage salon-->
  <url>
    <loc>${baseUrl}/salon</loc>
    <lastmod>${staticDates.salon}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
  </url>
  <!--Page nettoyage post chantier-->
  <url>
    <loc>${baseUrl}/tfc</loc>
    <lastmod>${staticDates.tfc}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
  </url>
  <!--About us-->
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${staticDates.about}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.70</priority>
  </url>
  <!--Contact-->
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${staticDates.contact}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
  <!--Faq-->
  <url>
    <loc>${baseUrl}/faq</loc>
    <lastmod>${staticDates.faq}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.60</priority>
  </url>
  <!--Reels and Posts (Server-Side Rendered, SEO Optimized)-->
  <url>
    <loc>${baseUrl}/blogs</loc>
    <lastmod>${staticDates.blogs}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.95</priority>
  </url>
  <!--Equipe-->
  <url>
    <loc>${baseUrl}/team</loc>
    <lastmod>${staticDates.team}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.50</priority>
  </url>
  <!--Simulateur de devis-->
  <url>
    <loc>${baseUrl}/devis</loc>
    <lastmod>${staticDates.devis}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
  <!--Conventions Entreprises B2B-->
  <url>
    <loc>${baseUrl}/entreprises</loc>
    <lastmod>${staticDates.entreprises}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <!-- Page d'Articles de conseils et astuces informatives -->
  <url>
    <loc>${baseUrl}/conseils</loc>
    <lastmod>${staticDates.conseils}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
  <!-- Articles individuels sont dans articles-sitemap.xml -->
</urlset>`;

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
    },
  });
}