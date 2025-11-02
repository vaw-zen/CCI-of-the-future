import tfcData from "./tfc.json";

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';

  return {
    title: tfcData.metadata.title,
    description: tfcData.metadata.description,
    alternates: {
      canonical: `${SITE_URL}/tfc`
    },
    openGraph: {
      title: tfcData.metadata.title,
      description: tfcData.metadata.description,
      url: `${SITE_URL}/tfc`,
      type: 'website'
    },
    twitter: {
      title: tfcData.metadata.title,
      description: tfcData.metadata.description
    }
  };
}

export default function TFCLayout({ children }) {
  return children;
}
