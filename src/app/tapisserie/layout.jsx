import tapisserieData from './tapisserie.json';

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';

  return {
    title: tapisserieData.metadata.title,
    description: tapisserieData.metadata.description,
    alternates: {
      canonical: `${SITE_URL}/tapisserie`
    },
    openGraph: {
      title: tapisserieData.metadata.title,
      description: tapisserieData.metadata.description,
      url: `${SITE_URL}/tapisserie`,
      type: 'website'
    },
    twitter: {
      title: tapisserieData.metadata.title,
      description: tapisserieData.metadata.description
    }
  };
}

export default function TapisserieLayout({ children }) {
  return children;
}
