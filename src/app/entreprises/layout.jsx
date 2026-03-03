import entreprisesData from "./entreprises.json";

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';

  return {
    title: entreprisesData.metadata.title,
    description: entreprisesData.metadata.description,
    keywords: entreprisesData.metadata.keywords,
    alternates: {
      canonical: `${SITE_URL}/entreprises`
    },
    openGraph: {
      title: entreprisesData.metadata.title,
      description: entreprisesData.metadata.description,
      url: `${SITE_URL}/entreprises`,
      type: 'website'
      ,
      locale: 'fr_TN',
      siteName: 'CCI Services',
      images: entreprisesData.images && entreprisesData.images.length ? [{ url: `${SITE_URL}${entreprisesData.images[0].src}`, alt: entreprisesData.images[0].title }] : [{ url: `${SITE_URL}/og/entreprises-og.svg`, alt: 'Conventions Nettoyage Entreprises - CCI' }]
    },
    twitter: {
      title: entreprisesData.metadata.title,
      description: entreprisesData.metadata.description,
      card: 'summary_large_image',
      images: entreprisesData.images && entreprisesData.images.length ? [`${SITE_URL}${entreprisesData.images[0].src}`] : [`${SITE_URL}/og/entreprises-og.svg`]
    }
  };
}

export default function EntreprisesLayout({ children }) {
  return children;
}
