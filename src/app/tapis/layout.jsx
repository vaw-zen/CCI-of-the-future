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
      siteName: 'CCI Services'
    },
    twitter: {
      card: 'summary_large_image',
      title: "Nettoyage Tapis & Moquette Tunis | CCI",
      description: tapisData.metadata.description
    }
  };
}

export default function TapisLayout({ children }) {
  return children;
}
