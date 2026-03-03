import tapisData from "./tapis.json";

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';

  return {
    title: tapisData.metadata.title,
    description: tapisData.metadata.description,
    keywords: tapisData.metadata.keywords,
    alternates: {
      canonical: `${SITE_URL}/tapis`
    },
    openGraph: {
      title: "Nettoyage Tapis & Moquette Tunis - Injection Extraction | CCI",
      description: tapisData.metadata.description,
      url: `${SITE_URL}/tapis`,
      type: 'website',
      locale: 'fr_TN',
      siteName: 'CCI Services',
      images: tapisData.images && tapisData.images.length ? [{ url: `${SITE_URL}${tapisData.images[0].src}`, alt: tapisData.images[0].title }] : []
    },
    twitter: {
      card: 'summary_large_image',
      title: "Nettoyage Tapis & Moquette Tunis | CCI",
      description: tapisData.metadata.description,
      images: tapisData.images && tapisData.images.length ? [`${SITE_URL}${tapisData.images[0].src}`] : []
    }
  };
}

export default function TapisLayout({ children }) {
  return children;
}
