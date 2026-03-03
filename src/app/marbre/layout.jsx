import marbreData from "./marbre.json";

export async function generateMetadata() {
  const metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online');

  const canonical = new URL('/marbre', metadataBase).toString();
  const ogImage = marbreData.images && marbreData.images.length ? new URL(marbreData.images[0].src, metadataBase).toString() : null;

  return {
    title: marbreData.metadata.title,
    description: marbreData.metadata.description,
    keywords: marbreData.metadata.keywords,
    alternates: {
      canonical
    },
    openGraph: {
      title: marbreData.metadata.title,
      description: marbreData.metadata.description,
      url: canonical,
      type: 'website',
      locale: 'fr_TN',
      siteName: 'CCI Services',
      images: ogImage ? [{ url: ogImage, alt: marbreData.images[0].title }] : []
    },
    twitter: {
      title: marbreData.metadata.title,
      description: marbreData.metadata.description,
      card: 'summary_large_image',
      images: ogImage ? [ogImage] : []
    }
  };
}

export default function MarbreLayout({ children }) {
  return children;
}
