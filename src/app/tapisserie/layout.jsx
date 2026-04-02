import tapisserieData from './tapisserie.json';

export async function generateMetadata() {
  const metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online');

  const canonical = new URL('/tapisserie', metadataBase).toString();
  const ogImage = tapisserieData.images && tapisserieData.images.length ? new URL(tapisserieData.images[0].src, metadataBase).toString() : null;

  return {
    title: tapisserieData.metadata.title,
    description: tapisserieData.metadata.description,
    keywords: tapisserieData.metadata.keywords,
    alternates: {
      canonical
    },
    openGraph: {
      title: tapisserieData.metadata.title,
      description: tapisserieData.metadata.description,
      url: canonical,
      type: 'website',
      locale: 'fr_TN',
      siteName: 'CCI Services',
      images: ogImage ? [{ url: ogImage, alt: tapisserieData.images[0].title }] : []
    },
    twitter: {
      title: tapisserieData.metadata.title,
      description: tapisserieData.metadata.description,
      card: 'summary_large_image',
      images: ogImage ? [ogImage] : []
    }
  };
}

export default function TapisserieLayout({ children }) {
  return (
    <>
      {children}
      {tapisserieData.localBusinessJSONLD && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tapisserieData.localBusinessJSONLD) }} />
      )}
      {tapisserieData.breadcrumbJSONLD && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tapisserieData.breadcrumbJSONLD) }} />
      )}
      {tapisserieData.faqJSONLD && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tapisserieData.faqJSONLD) }} />
      )}
    </>
  );
}
