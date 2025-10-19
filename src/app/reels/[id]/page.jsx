
import { Suspense } from 'react';
import { notFound } from 'next/navigation';

// Component imports
import ReelPlayer from './components/ReelPlayer/ReelPlayer';
import LoadingSkeleton from './components/LoadingSkeleton/LoadingSkeleton';
import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import GreenBand from "@/utils/components/GreenBand/GreenBand";
import styles from "../../blogs/blog.module.css";
import ServiceDetails from '@/utils/components/servicesComponents/serviceDetails/serviceDetails';
import { getVideoPlaceholderDataUrl } from '@/utils/videoPlaceholder';

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

  const title = reel.message && reel.message.trim() ? 
    `${reel.message.slice(0, 50)}... | CCI Services Reels` : 
    'Reel CCI Services - Nettoyage Professionnel';
    
  const description = reel.message && reel.message.trim() ? 
    `${reel.message.slice(0, 150)}...` : 
    'Découvrez nos services de nettoyage professionnel en vidéo. CCI Services, experts en nettoyage de tapis, marbre et intérieur automobile à Tunis.';

  return {
    title,
    description,
    metadataBase: new URL('https://cciservices.online'),
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

  // Ensure valid thumbnail URL for structured data (Google requires HTTP(S) URLs)
  const thumbnailUrl = reel.thumbnail || "https://cciservices.online/logo.png";

  // Clean description for structured data (remove problematic Unicode characters)
  const cleanDescription = reel.message && reel.message.trim() ? 
    reel.message.replace(/[^\x00-\x7F\u00C0-\u017F\u0100-\u024F]/g, '').slice(0, 500) : 
    "Découvrez nos services de nettoyage professionnel en vidéo. CCI Services, experts en nettoyage de tapis, marbre et entretien automobile à Tunis.";

  // Structured data for the individual video page with robust validation
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "@id": `https://cciservices.online/reels/${id}`, // Unique ID for individual page
    "name": reel.message && reel.message.trim() ? 
      reel.message.replace(/[^\x00-\x7F\u00C0-\u017F\u0100-\u024F]/g, '').slice(0, 100) : 
      "Reel vidéo CCI Services",
    "description": cleanDescription,
    "thumbnailUrl": thumbnailUrl,
    "uploadDate": reel.created_time || new Date().toISOString(),
    "contentUrl": reel.video_url || reel.permalink_url || `https://www.facebook.com/watch/?v=${reel.id}`,
    "embedUrl": reel.permalink_url || reel.video_url || `https://www.facebook.com/watch/?v=${reel.id}`,
    "duration": reel.length ? `PT${Math.round(reel.length)}S` : "PT30S",
    "publisher": {
      "@type": "Organization",
      "name": "CCI Services",
      "url": "https://cciservices.online",
      "logo": {
        "@type": "ImageObject",
        "url": "https://cciservices.online/logo.png"
      }
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
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://cciservices.online/reels/${id}`
    },
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