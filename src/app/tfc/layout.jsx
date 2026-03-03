import tfcData from "./tfc.json";

export async function generateMetadata() {
  const metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online');

  const canonical = new URL('/tfc', metadataBase).toString();
  const ogImage = tfcData.images && tfcData.images.length ? new URL(tfcData.images[0].src, metadataBase).toString() : null;

  return {
    title: tfcData.metadata.title,
    description: tfcData.metadata.description,
    keywords: tfcData.metadata.keywords,
    alternates: {
      canonical
    },
    openGraph: {
      title: tfcData.metadata.title,
      description: tfcData.metadata.description,
      url: canonical,
      type: 'website',
      locale: 'fr_TN',
      siteName: 'CCI Services',
      images: ogImage ? [{ url: ogImage, alt: tfcData.images[0].title }] : []
    },
    twitter: {
      title: tfcData.metadata.title,
      description: tfcData.metadata.description,
      card: 'summary_large_image',
      images: ogImage ? [ogImage] : []
    }
  };
}

export default function TFCLayout({ children }) {
  return children;
}
