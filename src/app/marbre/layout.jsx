import marbreData from "./marbre.json";

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';

  return {
    title: marbreData.metadata.title,
    description: marbreData.metadata.description,
    alternates: {
      canonical: `${SITE_URL}/marbre`
    },
    openGraph: {
      title: marbreData.metadata.title,
      description: marbreData.metadata.description,
      url: `${SITE_URL}/marbre`,
      type: 'website'
    },
    twitter: {
      title: marbreData.metadata.title,
      description: marbreData.metadata.description
    }
  };
}

export default function MarbreLayout({ children }) {
  return children;
}
