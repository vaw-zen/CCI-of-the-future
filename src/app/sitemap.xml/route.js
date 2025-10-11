import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
  const currentDate = new Date().toISOString().split('T')[0];

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
  <!-- Articles individuels -->
  <url>
    <loc>${baseUrl}/conseils/guide-nettoyage-tapis-tunis-2025</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${baseUrl}/conseils/nettoyage-salons-voiture-tapisseries-tunis</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${baseUrl}/conseils/traitement-poncage-polissage-marbre-tunisie</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${baseUrl}/conseils/nettoyage-post-chantier-tunisie-fin-travaux</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${baseUrl}/conseils/prix-nettoyage-tapis-tunis-tarifs-2025</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.90</priority>
  </url>
  <url>
    <loc>${baseUrl}/conseils/comment-nettoyer-canape-cuir-tunis-guide-complet</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${baseUrl}/conseils/detartrage-marbre-cuisine-tunisie-guide-expert</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${baseUrl}/conseils/services-nettoyage-ariana-tunisie-2025</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.90</priority>
  </url>
  <url>
    <loc>${baseUrl}/conseils/services-nettoyage-la-marsa-carthage-2025</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.90</priority>
  </url>
</urlset>`;

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
    },
  });
}