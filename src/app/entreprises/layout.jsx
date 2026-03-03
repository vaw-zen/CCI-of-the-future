import entreprisesData from "./entreprises.json";

export async function generateMetadata() {
  const metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online');

  const canonical = new URL('/entreprises', metadataBase).toString();
  const ogImage = entreprisesData.images && entreprisesData.images.length ? new URL(entreprisesData.images[0].src, metadataBase).toString() : new URL('/og/entreprises-og.svg', metadataBase).toString();

  return {
    title: entreprisesData.metadata.title,
    description: entreprisesData.metadata.description,
    keywords: entreprisesData.metadata.keywords,
    alternates: {
      canonical
    },
    openGraph: {
      title: entreprisesData.metadata.title,
      description: entreprisesData.metadata.description,
      url: canonical,
      type: 'website',
      locale: 'fr_TN',
      siteName: 'CCI Services',
      images: [{ url: ogImage, alt: entreprisesData.images && entreprisesData.images.length ? entreprisesData.images[0].title : 'Conventions Nettoyage Entreprises - CCI' }]
    },
    twitter: {
      title: entreprisesData.metadata.title,
      description: entreprisesData.metadata.description,
      card: 'summary_large_image',
      images: [ogImage]
    }
  };
}

export default function EntreprisesLayout({ children }) {
  return children;
}
