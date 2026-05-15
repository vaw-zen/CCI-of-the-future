import tapisData from "./tapis.json";

export async function generateMetadata() {
  const metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online');

  const canonical = new URL('/tapis', metadataBase).toString();
  const ogImage = tapisData.images && tapisData.images.length ? new URL(tapisData.images[0].src, metadataBase).toString() : null;

  return {
    title: tapisData.metadata.title,
    description: tapisData.metadata.description,
    keywords: tapisData.metadata.keywords,
    alternates: {
      canonical
    },
    openGraph: {
      title: tapisData.metadata.title,
      description: tapisData.metadata.description,
      url: canonical,
      type: 'website',
      locale: 'fr_TN',
      siteName: 'CCI Services',
      images: ogImage ? [{ url: ogImage, alt: tapisData.images[0].title }] : []
    },
    twitter: {
      card: 'summary_large_image',
      title: tapisData.metadata.title,
      description: tapisData.metadata.description,
      images: ogImage ? [ogImage] : []
    }
  };
}

export default function TapisLayout({ children }) {
  return (
    <>
      {children}
      {tapisData.breadcrumbJSONLD && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tapisData.breadcrumbJSONLD) }} />
      )}
      {tapisData.faqJSONLD && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tapisData.faqJSONLD) }} />
      )}
    </>
  );
}
