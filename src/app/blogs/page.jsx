import React from "react";
import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import ReelsSection from "./components/reels/reelsSection";
import PostsGrid from "./components/posts/postsGrid";
import GreenBand from "@/utils/components/GreenBand/GreenBand";
import styles from "./blog.module.css";
import blogsData from "./blogs.json";
import ResponsiveImage from '@/utils/components/Image/Image';
import { getVideoPlaceholderDataUrl } from '@/utils/videoPlaceholder';

// Helper function to clean Unicode characters for structured data
function cleanUnicodeForStructuredData(str) {
  if (!str) return '';
  
  // First, normalize the string to handle Unicode properly
  let cleaned = str.normalize('NFD');
  
  // Remove or replace problematic Unicode characters that cause GSC issues
  cleaned = cleaned
    // Fix common emoji and special characters
    .replace(/[✨🎥🧽🧼🏠💼⭐️👍💪📞📧🌐📍🛠️🎯✔️📩]/g, '') // Remove emojis
    .replace(/â¨/g, '') // Remove corrupted sparkles
    .replace(/ð/g, '') // Remove corrupted emojis
    .replace(/Ã©/g, 'é') // Fix é
    .replace(/Ã¨/g, 'è') // Fix è
    .replace(/Ã /g, 'à') // Fix à
    .replace(/Ã´/g, 'ô') // Fix ô
    .replace(/Ã¢/g, 'â') // Fix â
    .replace(/Ã/g, 'À') // Fix À
    .replace(/â/g, "'") // Fix apostrophes
    .replace(/â/g, "'") // Fix apostrophes
    .replace(/â/g, '"') // Fix quotes
    .replace(/â/g, '"') // Fix quotes
    .replace(/â/g, '-') // Fix dashes
    // Remove any remaining non-printable or problematic characters
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/[^\x00-\x7F\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF]/g, '') // Keep only Latin characters
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleaned;
}

// Fetch initial data on the server for SEO
async function getInitialData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
    
    // Fetch both posts and reels in parallel
    const [postsRes, reelsRes] = await Promise.all([
      fetch(`${baseUrl}/api/social/facebook?posts_limit=6`, { 
        next: { revalidate: 3600 } // Revalidate every hour (ISR)
      }),
      fetch(`${baseUrl}/api/social/facebook?reels_limit=6`, { 
        next: { revalidate: 3600 } // Revalidate every hour (ISR)
      })
    ]);

    const [postsData, reelsData] = await Promise.all([
      postsRes.ok ? postsRes.json() : { posts: [], posts_paging: null },
      reelsRes.ok ? reelsRes.json() : { reels: [], reels_paging: null }
    ]);

    return {
      posts: postsData.posts || [],
      postsPaging: postsData.posts_paging || null,
      reels: reelsData.reels || [],
      reelsPaging: reelsData.reels_paging || null
    };
  } catch (error) {
    console.error('Error fetching initial data:', error);
    return { posts: [], reels: [] };
  }
}

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';

  // Fetch data for dynamic metadata
  const { posts, reels } = await getInitialData();
  
  // Create a richer description based on actual content
  const contentCount = `${posts.length} publications et ${reels.length} reels`;
  const dynamicDescription = `${blogsData.metadata.description} Découvrez ${contentCount} de nos derniers travaux.`;

  return {
    title: blogsData.metadata.title,
    description: dynamicDescription,
    alternates: {
      canonical: `${SITE_URL}/blogs`
    },
    openGraph: {
      title: blogsData.metadata.title,
      description: dynamicDescription,
      url: `${SITE_URL}/blogs`,
      type: 'website',
      images: posts[0]?.attachments?.[0]?.src ? [{
        url: posts[0].attachments[0].src,
        width: 1200,
        height: 630,
        alt: posts[0].title || 'CCI Services'
      }] : []
    },
    twitter: {
      card: 'summary_large_image',
      title: blogsData.metadata.title,
      description: dynamicDescription,
      images: posts[0]?.attachments?.[0]?.src ? [posts[0].attachments[0].src] : []
    }
  };
}

export default async function Page() {
  // Fetch initial data on the server
  const { posts, postsPaging, reels, reelsPaging } = await getInitialData();

  // Generate comprehensive structured data for the entire page
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      // Collection Page
      blogsData.collectionPageJSONLD,
      
      // Separate VideoObject for each reel (plus visible)
      ...reels
        .filter(reel => reel && reel.id) // Only process reels with valid ID
        .map((reel) => {
          // Check if reel has a valid thumbnail (not a data URL placeholder)
          // Use direct Facebook CDN URL for better reliability with Google
          const hasValidThumbnail = reel.thumbnail && 
            (reel.thumbnail.startsWith('http://') || reel.thumbnail.startsWith('https://'));
          
          // Clean description for structured data (remove problematic Unicode characters)
          const cleanDescription = reel.message && reel.message.trim() ? 
            cleanUnicodeForStructuredData(reel.message) : 
            "Découvrez nos services de nettoyage professionnel en vidéo. CCI Services, experts en nettoyage de tapis, marbre et entretien automobile à Tunis.";
          
          // Ensure contentUrl and embedUrl are valid - Google requires at least one
          // Priority: video_url (direct) > permalink_url (Facebook) > fallback
          const hasVideoUrl = reel.video_url && reel.video_url.trim();
          const hasPermalinkUrl = reel.permalink_url && reel.permalink_url.trim();
          
          // Create fallback URL only if needed
          const fallbackUrl = `https://www.facebook.com/watch/?v=${reel.id}`;
          
          // Determine best URLs (avoid duplication and ensure validity)
          let contentUrl, embedUrl;
          
          if (hasVideoUrl) {
            contentUrl = reel.video_url.trim();
            embedUrl = hasPermalinkUrl ? reel.permalink_url.trim() : contentUrl;
          } else if (hasPermalinkUrl) {
            contentUrl = reel.permalink_url.trim();
            embedUrl = contentUrl;
          } else {
            contentUrl = fallbackUrl;
            embedUrl = fallbackUrl;
          }
          
          // Ensure URLs are different when possible to provide multiple access points
          if (contentUrl === embedUrl && hasVideoUrl && hasPermalinkUrl) {
            contentUrl = reel.video_url.trim();
            embedUrl = reel.permalink_url.trim();
          }
          
          // Ensure upload date is valid and properly formatted
          const uploadDate = reel.created_time || new Date().toISOString();
          
          // Validate URLs are properly formatted
          const isValidUrl = (url) => {
            try {
              new URL(url);
              return url.startsWith('http://') || url.startsWith('https://');
            } catch {
              return false;
            }
          };
          
          // Final validation - ensure we have valid URLs
          if (!isValidUrl(contentUrl)) {
            console.warn(`Invalid contentUrl for reel ${reel.id}:`, contentUrl);
            contentUrl = fallbackUrl;
          }
          if (!isValidUrl(embedUrl)) {
            console.warn(`Invalid embedUrl for reel ${reel.id}:`, embedUrl);
            embedUrl = fallbackUrl;
          }
          
          // Build VideoObject - only include thumbnailUrl if we have a valid HTTP(S) URL
          const videoObject = {
            "@type": "VideoObject",
            "@id": `https://cciservices.online/blogs#video-${reel.id}`, // Unique ID for blogs collection
            "name": reel.message && reel.message.trim() ? 
              cleanUnicodeForStructuredData(reel.message).slice(0, 100) : 
              "Reel vidéo CCI Services",
            "description": cleanDescription,
            "uploadDate": uploadDate,
            "contentUrl": contentUrl,
            "embedUrl": embedUrl,
          "duration": reel.length ? `PT${Math.round(reel.length)}S` : "PT30S",
          "publisher": {
            "@type": "Organization",
            "name": "CCI Services",
            "logo": {
              "@type": "ImageObject",
              "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online'}/logo.png`
            }
          },
          "author": {
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
            "@id": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online'}/blogs`
          }
        };
        
        // Only add thumbnailUrl if we have a valid HTTP(S) thumbnail from Facebook
        // This ensures Google can access the thumbnail directly from Facebook CDN
        if (hasValidThumbnail) {
          videoObject.thumbnailUrl = reel.thumbnail;
        }
        
        return videoObject;
      }),
      
      // ItemList for all content
      {
        "@type": "ItemList",
        "name": "Publications et Reels CCI",
        "description": "Liste complète de nos publications et vidéos",
        "numberOfItems": posts.filter(post => post && post.id).length + reels.filter(reel => reel && reel.id).length,
        "itemListElement": [
          // Map posts
          ...posts
            .filter(post => post && post.id) // Only process posts with valid ID
            .map((post, index) => {
              // Clean headline for structured data (remove problematic Unicode characters)
              const cleanHeadline = post.title || (post.message && post.message.trim() ? 
                post.message.replace(/[^\x00-\x7F\u00C0-\u017F\u0100-\u024F]/g, '').slice(0, 100) : 
                "Publication CCI Services - Nettoyage Professionnel");
              
              // Clean description for structured data (remove problematic Unicode characters)
              const cleanDescription = post.message && post.message.trim() ? 
                post.message.replace(/[^\x00-\x7F\u00C0-\u017F\u0100-\u024F]/g, '') : 
                "Découvrez nos services de nettoyage professionnel. CCI Services, experts en entretien de tapis, marbre et intérieur automobile à Tunis.";
              
              const datePublished = post.created_time || new Date().toISOString();
              const articleId = post.permalink_url || `https://cciservices.online/blogs#post-${post.id}`;
              
              // Ensure image URL is valid with fallback (use proper HTTP(S) URL)
              const imageUrl = post.attachments?.[0]?.src || "https://cciservices.online/logo.png";
              
              return {
                "@type": "ListItem",
                "position": index + 1,
                  "item": {
                    "@type": "Article",
                    "@id": articleId,
                    "headline": cleanHeadline,
                    "description": cleanDescription,
                    "image": imageUrl,
                    "url": articleId,
                    "datePublished": datePublished,
                  "author": {
                    "@type": "Organization",
                    "name": "CCI Services"
                  },
                  "publisher": {
                    "@type": "Organization",
                    "name": "CCI Services",
                    "logo": {
                      "@type": "ImageObject",
                      "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online'}/logo.png`
                    }
                  },
                  "interactionStatistic": [
                    {
                      "@type": "InteractionCounter",
                      "interactionType": "https://schema.org/LikeAction",
                      "userInteractionCount": post.likes || 0
                    },
                    {
                      "@type": "InteractionCounter",
                      "interactionType": "https://schema.org/CommentAction",
                      "userInteractionCount": post.comments || 0
                    }
                  ],
                  "mainEntityOfPage": articleId
                }
              };
            }),
          
          // Map reels as VideoObject references
          ...reels
            .filter(reel => reel && reel.id) // Only process reels with valid ID
            .map((reel, index) => {
              const validPostsCount = posts.filter(post => post && post.id).length;
              return {
                "@type": "ListItem",
                "position": validPostsCount + index + 1,
                "item": {
                  "@id": `https://cciservices.online/blogs#video-${reel.id}` // Reference the same video ID
                }
              };
            })
        ]
      }
    ]
  };

  return (
    <main className={styles.main}>
      {/* Enhanced Structured Data with all content */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Hidden content for search engines (rendered server-side) - AMÉLIORÉ */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <h1>{blogsData.metadata.title}</h1>
        <p>{blogsData.metadata.description}</p>
        
        {/* Section dédiée aux vidéos avec titre explicite */}
        <section>
          <h2>Vidéos et Reels CCI Services</h2>
          {reels.map((reel) => {
            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
            const localThumbnailUrl = `${baseUrl}/api/thumbnails/${reel.id}`;
            // Use Facebook CDN for user-facing images (performance), local for structured data (SEO)
            const userFacingThumbnailUrl = reel.thumbnail || reel.original_thumbnail || localThumbnailUrl;
            
            return (
            <article key={reel.id} itemScope itemType="https://schema.org/VideoObject">
              <h3 itemProp="name">{cleanUnicodeForStructuredData(reel.message) || 'Reel vidéo CCI Services'}</h3>
              <p itemProp="description">{cleanUnicodeForStructuredData(reel.message)}</p>
              <time itemProp="uploadDate" dateTime={reel.created_time}>
                {new Date(reel.created_time).toLocaleDateString()}
              </time>
              <video 
                itemProp="contentUrl"
                src={reel.video_url || reel.permalink_url || `https://www.facebook.com/watch/?v=${reel.id}`}
                poster={userFacingThumbnailUrl}
                width="320" 
                height="240"
                controls
                preload="metadata"
              >
                <source src={reel.video_url || reel.permalink_url || `https://www.facebook.com/watch/?v=${reel.id}`} type="video/mp4" />
                Votre navigateur ne supporte pas les vidéos HTML5.
              </video>
              {/* Use local thumbnail for SEO/structured data, Facebook CDN would fail for search engines */}
              <ResponsiveImage itemProp="thumbnailUrl" src={localThumbnailUrl} alt="Aperçu vidéo" sizes={[25, 30, 35]} />
              <span itemProp="duration" content={reel.length ? `PT${Math.round(reel.length)}S` : "PT30S"}>
                {reel.length ? `${Math.round(reel.length)}s` : "30s"}
              </span>
              <a href={reel.permalink_url} itemProp="url">Voir sur Facebook</a>
            </article>
            );
          })}
        </section>
        
        {/* Section dédiée aux publications */}
        <section>
          <h2>Publications CCI Services</h2>
          {posts.map((post) => (
            <article key={post.id}>
              <h3>{post.title || post.message?.slice(0, 100)}</h3>
              <p>{post.message}</p>
              <time dateTime={post.created_time}>{new Date(post.created_time).toLocaleDateString()}</time>
              {post.attachments?.[0]?.src && (
                <ResponsiveImage src={post.attachments[0].src} alt={post.title || 'Publication'} sizes={[40, 50, 60]} />
              )}
              <a href={post.permalink_url}>Voir sur Facebook</a>
            </article>
          ))}
        </section>
      </div>

      <HeroHeader title={blogsData.heroTitle} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <ReelsSection initialReels={reels} initialReelsPaging={reelsPaging} />
        <GreenBand className={styles.greenBandReels} />

        <PostsGrid initialPosts={posts} initialPostsPaging={postsPaging} />
      </div>

      <GreenBand className={styles.greenBandWrapper} />
    </main>
  );
}
