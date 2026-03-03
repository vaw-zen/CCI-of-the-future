import tapisserieData from './tapisserie.json';

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';

  return {
    title: tapisserieData.metadata.title,
    description: tapisserieData.metadata.description,
    keywords: tapisserieData.metadata.keywords,
    alternates: {
      canonical: `${SITE_URL}/tapisserie`
    },
    openGraph: {
      title: tapisserieData.metadata.title,
      description: tapisserieData.metadata.description,
      url: `${SITE_URL}/tapisserie`,
      type: 'website'
      ,
      locale: 'fr_TN',
      siteName: 'CCI Services',
      images: tapisserieData.images && tapisserieData.images.length ? [{ url: `${SITE_URL}${tapisserieData.images[0].src}`, alt: tapisserieData.images[0].title }] : []
    },
    twitter: {
      title: tapisserieData.metadata.title,
      description: tapisserieData.metadata.description,
      card: 'summary_large_image',
      images: tapisserieData.images && tapisserieData.images.length ? [`${SITE_URL}${tapisserieData.images[0].src}`] : []
    }
  };
}

export default function TapisserieLayout({ children }) {
  return children;
}
