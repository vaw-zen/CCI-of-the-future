import tfcData from "./tfc.json";

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';

  return {
    title: tfcData.metadata.title,
    description: tfcData.metadata.description,
    keywords: tfcData.metadata.keywords,
    alternates: {
      canonical: `${SITE_URL}/tfc`
    },
    openGraph: {
      title: tfcData.metadata.title,
      description: tfcData.metadata.description,
      url: `${SITE_URL}/tfc`,
      type: 'website'
      ,
      locale: 'fr_TN',
      siteName: 'CCI Services',
      images: tfcData.images && tfcData.images.length ? [{ url: `${SITE_URL}${tfcData.images[0].src}`, alt: tfcData.images[0].title }] : []
    },
    twitter: {
      title: tfcData.metadata.title,
      description: tfcData.metadata.description,
      card: 'summary_large_image',
      images: tfcData.images && tfcData.images.length ? [`${SITE_URL}${tfcData.images[0].src}`] : []
    }
  };
}

export default function TFCLayout({ children }) {
  return children;
}
