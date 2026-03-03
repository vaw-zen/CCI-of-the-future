import marbreData from "./marbre.json";

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';

  return {
    title: marbreData.metadata.title,
    description: marbreData.metadata.description,
    keywords: marbreData.metadata.keywords,
    alternates: {
      canonical: `${SITE_URL}/marbre`
    },
    openGraph: {
      title: marbreData.metadata.title,
      description: marbreData.metadata.description,
      url: `${SITE_URL}/marbre`,
      type: 'website'
      ,
      locale: 'fr_TN',
      siteName: 'CCI Services',
      images: marbreData.images && marbreData.images.length ? [{ url: `${SITE_URL}${marbreData.images[0].src}`, alt: marbreData.images[0].title }] : []
    },
    twitter: {
      title: marbreData.metadata.title,
      description: marbreData.metadata.description,
      card: 'summary_large_image',
      images: marbreData.images && marbreData.images.length ? [`${SITE_URL}${marbreData.images[0].src}`] : []
    }
  };
}

export default function MarbreLayout({ children }) {
  return children;
}
