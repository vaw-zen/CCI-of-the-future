import entreprisesData from "./entreprises.json";

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';

  return {
    title: entreprisesData.metadata.title,
    description: entreprisesData.metadata.description,
    keywords: entreprisesData.metadata.keywords,
    alternates: {
      canonical: `${SITE_URL}/entreprises`
    },
    openGraph: {
      title: entreprisesData.metadata.title,
      description: entreprisesData.metadata.description,
      url: `${SITE_URL}/entreprises`,
      type: 'website'
    },
    twitter: {
      title: entreprisesData.metadata.title,
      description: entreprisesData.metadata.description
    }
  };
}

export default function EntreprisesLayout({ children }) {
  return children;
}
