
import { Suspense } from 'react';
import { notFound } from 'next/navigation';

// Component imports
import ReelPlayer from './components/ReelPlayer';
import LoadingSkeleton from './components/LoadingSkeleton';
import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import GreenBand from "@/utils/components/GreenBand/GreenBand";
import styles from "../../blogs/blog.module.css";
import ServiceDetails from '@/utils/components/servicesComponents/serviceDetails/serviceDetails';

// Fetch single reel data
async function getReelData(reelId) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
    
    const response = await fetch(`${baseUrl}/api/social/facebook?reels_limit=50`, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch reels data');
    }

    const data = await response.json();
    const reel = data.reels?.find(r => r.id === reelId);
    
    return reel || null;
  } catch (error) {
    console.error('Error fetching reel data:', error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { id } = await params;
  const reel = await getReelData(id);
  
  if (!reel) {
    return {
      title: 'Reel non trouvé | CCI Services',
      description: 'Ce reel n\'existe pas ou a été supprimé.'
    };
  }

  const title = reel.message ? 
    `${reel.message.slice(0, 50)}... | CCI Services Reels` : 
    'Reel CCI Services - Nettoyage Professionnel';
    
  const description = reel.message ? 
    `${reel.message.slice(0, 150)}...` : 
    'Découvrez nos services de nettoyage professionnel en vidéo. CCI Services, experts en nettoyage de tapis, marbre et intérieur automobile à Tunis.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'video.other',
      url: `https://cciservices.online/reels/${id}`,
      images: reel.thumbnail ? [
        {
          url: reel.thumbnail,
          width: 720,
          height: 1280,
          alt: title,
        }
      ] : undefined,
      videos: reel.video_url ? [
        {
          url: reel.video_url,
          width: 720,
          height: 1280,
          type: 'video/mp4',
        }
      ] : undefined,
    },
    twitter: {
      card: 'player',
      title,
      description,
      images: reel.thumbnail ? [reel.thumbnail] : undefined,
      players: reel.video_url ? [
        {
          playerUrl: reel.video_url,
          streamUrl: reel.video_url,
          width: 720,
          height: 1280,
        }
      ] : undefined,
    },
    alternates: {
      canonical: `https://cciservices.online/reels/${id}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Generate static params for all reels
export async function generateStaticParams() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
    
    const response = await fetch(`${baseUrl}/api/social/facebook?reels_limit=50`, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const reels = data.reels || [];

    return reels.map((reel) => ({
      id: reel.id,
    }));
  } catch (error) {
    console.error('Error generating static params for reels:', error);
    return [];
  }
}

// Main page component
export default async function ReelPage({ params }) {
  const { id } = await params;
  const reel = await getReelData(id);

  if (!reel) {
    notFound();
  }

  // Structured data for the video
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": reel.message || "Reel CCI Services",
    "description": (reel.message || "Vidéo reel publiée par CCI Services").slice(0, 500),
    "thumbnailUrl": reel.thumbnail,
    "uploadDate": reel.created_time,
    "contentUrl": reel.video_url,
    "embedUrl": reel.permalink_url,
    "duration": reel.length ? `PT${Math.round(reel.length)}S` : "PT30S",
    "publisher": {
      "@type": "Organization",
      "name": "CCI Services",
      "url": "https://cciservices.online"
    },
    "creator": {
      "@type": "Organization",
      "name": "CCI Services"
    },
    "interactionStatistic": [
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/WatchAction",
        "userInteractionCount": reel.views || 0
      },
      {
        "@type": "InteractionCounter", 
        "interactionType": "https://schema.org/LikeAction",
        "userInteractionCount": reel.likes || 0
      }
    ],
    "keywords": [
      "nettoyage professionnel",
      "CCI Services",
      "entretien",
      "rénovation",
      "Tunis"
    ].join(", ")
  };

  return (
    <main className={styles.main}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      
      <HeroHeader title="Reel CCI Services" />
 
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Suspense fallback={<LoadingSkeleton />}>
          <ReelPlayer reel={reel} />
        </Suspense>
    
      </div>

      <GreenBand className={styles.greenBandWrapper} />
    </main>
  );
}