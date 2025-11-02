import salonData from "./salon.json";

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';

  return {
    title: salonData.metadata.title,
    description: salonData.metadata.description,
    alternates: {
      canonical: `${SITE_URL}/salon`
    },
    openGraph: {
      title: salonData.metadata.title,
      description: salonData.metadata.description,
      url: `${SITE_URL}/salon`,
      type: 'website'
    },
    twitter: {
      title: salonData.metadata.title,
      description: salonData.metadata.description
    }
  };
}

export default function SalonLayout({ children }) {
  return children;
}
