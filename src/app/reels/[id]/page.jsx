
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

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
  const localThumbnailUrl = `${baseUrl}/api/thumbnails/${id}`; // Use API endpoint

  return {
    title,
    description,
    metadataBase: new URL('https://cciservices.online'),
    openGraph: {
      title,
      description,
      type: 'video.other',
      url: `https://cciservices.online/reels/${id}`,
      images: [
        {
          url: localThumbnailUrl,
          width: 720,
          height: 1280,
          alt: title,
        }
      ],
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
      images: [localThumbnailUrl],
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
export default async function ReelPage({ params, searchParams }) {
  const { id } = await params;
  const reel = await getReelData(id);
  
  // Check if this is an embed request (for video:player_loc)
  const isEmbed = searchParams?.embed === 'true';

  if (!reel) {
    notFound();
  }

  // Ensure valid thumbnail URL for structured data (Google requires HTTP(S) URLs)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
  const localThumbnailUrl = `${baseUrl}/api/thumbnails/${reel.id}`; // Use API endpoint for reliable access
  const thumbnailUrl = localThumbnailUrl; // Always use local thumbnail for GSC compatibility

  // Clean description for structured data (remove problematic Unicode characters)
  const cleanDescription = reel.message && reel.message.trim() ? 
    reel.message.replace(/[^\x00-\x7F\u00C0-\u017F\u0100-\u024F]/g, '') : 
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
    "contentUrl": `https://cciservices.online/reels/${id}`, // Point to your local page for GSC
    "embedUrl": `https://cciservices.online/reels/${id}`, // Point to your local page for GSC
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

  // If embed mode, return minimal player view
  if (isEmbed) {
    return (
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#000'
      }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        <Suspense fallback={<LoadingSkeleton />}>
          <ReelPlayer reel={reel} />
        </Suspense>
      </div>
    );
  }

  return (
    <main className={styles.main} itemScope itemType="https://schema.org/VideoObject">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      
      {/* Hidden microdata for GSC */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <h1 itemProp="name">{reel.message && reel.message.trim() ? 
          reel.message.replace(/[^\x00-\x7F\u00C0-\u017F\u0100-\u024F]/g, '').slice(0, 100) : 
          "Reel vidéo CCI Services"}</h1>
        <p itemProp="description">{cleanDescription}</p>
        <img itemProp="thumbnailUrl" src={thumbnailUrl} alt="Video thumbnail" />
        <time itemProp="uploadDate" dateTime={reel.created_time || new Date().toISOString()}>
          {new Date(reel.created_time || new Date()).toLocaleDateString()}
        </time>
        <span itemProp="duration" content={reel.length ? `PT${Math.round(reel.length)}S` : "PT30S"}>
          {reel.length ? `${Math.round(reel.length)}s` : "30s"}
        </span>
        <div itemProp="interactionStatistic" itemScope itemType="https://schema.org/InteractionCounter">
          <span itemProp="interactionType" content="https://schema.org/WatchAction">Views</span>
          <span itemProp="userInteractionCount">{reel.views || 0}</span>
        </div>
        <div itemProp="publisher" itemScope itemType="https://schema.org/Organization">
          <span itemProp="name">CCI Services</span>
          <span itemProp="url">https://cciservices.online</span>
        </div>
      </div>
      
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