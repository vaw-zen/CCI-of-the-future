import salonData from "./salon.json";

export async function generateMetadata() {
  const metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online');

  const canonical = new URL('/salon', metadataBase).toString();
  const ogImage = salonData.images && salonData.images.length ? new URL(salonData.images[0].src, metadataBase).toString() : null;

  return {
    title: salonData.metadata.title,
    description: salonData.metadata.description,
    keywords: salonData.metadata.keywords,
    alternates: {
      canonical
    },
    openGraph: {
      title: salonData.metadata.title,
      description: salonData.metadata.description,
      url: canonical,
      type: 'website',
      locale: 'fr_TN',
      siteName: 'CCI Services',
      images: ogImage ? [{ url: ogImage, alt: salonData.images[0].title }] : []
    },
    twitter: {
      title: salonData.metadata.title,
      description: salonData.metadata.description,
      card: 'summary_large_image',
      images: ogImage ? [ogImage] : []
    }
  };
}

export default function SalonLayout({ children }) {
  return (
    <>
      {children}
      {salonData.breadcrumbJSONLD && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(salonData.breadcrumbJSONLD) }} />
      )}
      {salonData.faqJSONLD && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(salonData.faqJSONLD) }} />
      )}
    </>
  );
}
