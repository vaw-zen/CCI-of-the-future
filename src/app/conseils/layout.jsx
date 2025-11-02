export const metadata = {
  title: 'Conseils Nettoyage & Rénovation Tunis | Blog Expert CCI Services',
  description: 'Guides complets, tutoriels et conseils d\'expert en nettoyage tapis, ponçage marbre et retapissage salon à Tunis. Astuces professionnelles et tarifs 2025.',
  keywords: 'conseils nettoyage tunis, guide tapis, ponçage marbre, retapissage salon, blog nettoyage professionnel',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online'}/conseils`
  },
  openGraph: {
    title: 'Conseils Nettoyage & Rénovation Tunis | CCI Services',
    description: 'Guides, tutoriels et conseils d\'expert en nettoyage et rénovation à Tunis.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online'}/conseils`,
    type: 'website',
    locale: 'fr_TN',
    siteName: 'CCI Services Tunis',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online'}/og-conseils.png`,
        width: 1200,
        height: 630,
        alt: 'Conseils nettoyage professionnel Tunis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conseils Nettoyage & Rénovation Tunis | CCI Services',
    description: 'Guides, tutoriels et conseils d\'expert en nettoyage et rénovation à Tunis.',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online'}/og-conseils.png`],
  }
};

export default function ConseilsLayout({ children }) {
  return children;
}
