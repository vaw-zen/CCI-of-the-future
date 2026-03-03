import salonData from "./salon.json";

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';

  return {
    title: salonData.metadata.title,
    description: salonData.metadata.description,
    keywords: salonData.metadata.keywords,
    alternates: {
      canonical: `${SITE_URL}/salon`
    },
    openGraph: {
      title: salonData.metadata.title,
      description: salonData.metadata.description,
      url: `${SITE_URL}/salon`,
      type: 'website'
      ,
      locale: 'fr_TN',
      siteName: 'CCI Services',
      images: salonData.images && salonData.images.length ? [{ url: `${SITE_URL}${salonData.images[0].src}`, alt: salonData.images[0].title }] : []
    },
    twitter: {
      title: salonData.metadata.title,
      description: salonData.metadata.description,
      card: 'summary_large_image',
      images: salonData.images && salonData.images.length ? [`${SITE_URL}${salonData.images[0].src}`] : []
    }
  };
}

export default function SalonLayout({ children }) {
  return children;
}
