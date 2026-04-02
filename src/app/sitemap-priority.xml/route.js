import { NextResponse } from 'next/server';

const PRIORITY_PATHS = [
  '/conseils/comment-nettoyer-canape-cuir-tunis-guide-complet',
  '/conseils/cristallisation-marbre-tunisie-guide-complet',
  '/conseils/guide-nettoyage-tapis-tunis-2025',
  '/conseils/nettoyage-a-sec-tunis-2025',
  '/conseils/nettoyage-post-chantier-tunisie-fin-travaux',
  '/conseils/nettoyage-professionnel-el-aouina-cci-services',
  '/conseils/nettoyage-salon-canape-tunis-2026',
  '/conseils/nettoyage-urgent-tapis-tunis-service-express',
  '/conseils/polissage-marbre-tunisie-techniques-tarifs',
  '/conseils/services-nettoyage-ariana-tunisie-2025',
  '/conseils/services-nettoyage-el-aouina-guide-complet',
  '/conseils/services-nettoyage-la-marsa-carthage-2025',
  '/conseils/traitement-poncage-polissage-marbre-tunisie',
  '/entreprises',
  '/reels/868355819475987',
  '/tfc',
];

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
  const currentDate = new Date().toISOString().split('T')[0];

  const urls = PRIORITY_PATHS.map((path) => `  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>`).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
