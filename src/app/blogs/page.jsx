import React from "react";
import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import ReelsSection from "./components/reels/reelsSection";
import PostsGrid from "./components/posts/postsGrid";
import GreenBand from "@/utils/components/GreenBand/GreenBand";
import styles from "./blog.module.css";
import blogsData from "./blogs.json";
import ResponsiveImage from '@/utils/components/Image/Image';

function getReelStructuredUrls(reelId) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
  const reelPageUrl = `${baseUrl}/reels/${reelId}`;

  return {
    baseUrl,
    reelPageUrl,
    reelEmbedUrl: `${reelPageUrl}?player=1`,
    reelContentUrl: `${baseUrl}/api/video/${reelId}`,
    reelThumbnailUrl: `${baseUrl}/api/thumbnails/${reelId}`,
  };
}

// Helper function to clean Unicode characters for structured data
function cleanUnicodeForStructuredData(str) {
  if (!str) return '';
  
  // Use NFC normalization to compose characters (keeps accents intact)
  let cleaned = str.normalize('NFC');
  
  // Remove emojis and special Unicode symbols while preserving French accented characters
  cleaned = cleaned
    // Remove all emoji ranges
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc symbols & pictographs
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport & map
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation selectors
    .replace(/[\u{200D}]/gu, '')             // Zero-width joiner
    .replace(/[\u{20E3}]/gu, '')             // Combining enclosing keycap
    .replace(/[\u{E0020}-\u{E007F}]/gu, '') // Tags
    .replace(/[✨🎥🧽🧼🏠💼⭐️👍💪📞📧🌐📍🛠️🎯✔️📩✓✅❌⭐☎]/g, '') // Common symbols
    // Fix mojibake (UTF-8 bytes misread as Latin-1)
    .replace(/Ã©/g, 'é').replace(/Ã¨/g, 'è').replace(/Ã /g, 'à')
    .replace(/Ã´/g, 'ô').replace(/Ã¢/g, 'â').replace(/Ã§/g, 'ç')
    .replace(/Ã®/g, 'î').replace(/Ã¹/g, 'ù').replace(/Ãª/g, 'ê')
    // Fix smart quotes and dashes
    .replace(/[\u2018\u2019\u201A]/g, "'")  // Smart single quotes → '
    .replace(/[\u201C\u201D\u201E]/g, '"')  // Smart double quotes → "
    .replace(/[\u2013\u2014]/g, '-')         // En/em dashes → -
    .replace(/[\u2026]/g, '...')              // Ellipsis
    // Remove control characters but keep standard whitespace
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleaned;
}

// Extract a short, clean title from a reel/post message (max 60 chars)
function extractShortTitle(message, fallback) {
  if (!message || !message.trim()) return fallback;
  const cleaned = cleanUnicodeForStructuredData(message);
  // Take first sentence or first 60 chars
  const firstSentence = cleaned.split(/[.!?\n]/)[0]?.trim();
  if (firstSentence && firstSentence.length > 5) {
    return firstSentence.length > 60 ? firstSentence.slice(0, 57) + '...' : firstSentence;
  }
  return cleaned.length > 60 ? cleaned.slice(0, 57) + '...' : cleaned;
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
          const {
            baseUrl,
            reelPageUrl,
            reelEmbedUrl,
            reelContentUrl,
            reelThumbnailUrl,
          } = getReelStructuredUrls(reel.id);
          
          // Clean description for structured data (remove problematic Unicode characters)
          const cleanDescription = reel.message && reel.message.trim() ? 
            cleanUnicodeForStructuredData(reel.message) : 
            "Découvrez nos services de nettoyage professionnel en vidéo. CCI Services, experts en nettoyage de tapis, marbre et entretien automobile à Tunis.";
          
          // Ensure upload date is valid and properly formatted
          const uploadDate = reel.created_time || new Date().toISOString();
          
          // Build VideoObject with explicit local URLs so Google can keep a stable crawl target
          const videoObject = {
            "@type": "VideoObject",
            "@id": `https://cciservices.online/blogs#video-${reel.id}`,
            "name": extractShortTitle(reel.message, "Vidéo CCI Services - Nettoyage Professionnel Tunis"),
            "description": cleanDescription.length > 10 ? cleanDescription : "Découvrez nos services de nettoyage professionnel en vidéo. CCI Services Tunis.",
            "uploadDate": uploadDate,
            "url": reelPageUrl,
            "contentUrl": reelContentUrl,
            "embedUrl": reelEmbedUrl,
          "duration": reel.length ? `PT${Math.round(reel.length)}S` : "PT30S",
          "publisher": {
            "@type": "Organization",
            "name": "CCI Services",
            "logo": {
              "@type": "ImageObject",
              "url": `${baseUrl}/logo.png`
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
            "@id": reelPageUrl
          }
        };
        
        videoObject.thumbnailUrl = reelThumbnailUrl;
        
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
              // Clean headline for structured data - use short title extraction
              const cleanHeadline = extractShortTitle(
                post.title || post.message,
                "Publication CCI Services - Nettoyage Professionnel Tunis"
              );
              
              // Clean description for structured data
              const cleanDescription = post.message && post.message.trim() ? 
                cleanUnicodeForStructuredData(post.message) : 
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
            const {
              reelPageUrl,
              reelEmbedUrl,
              reelContentUrl,
              reelThumbnailUrl,
            } = getReelStructuredUrls(reel.id);
            
            return (
            <article key={reel.id} itemScope itemType="https://schema.org/VideoObject">
              <link itemProp="url" href={reelPageUrl} />
              <link itemProp="contentUrl" href={reelContentUrl} />
              <link itemProp="embedUrl" href={reelEmbedUrl} />
              <meta itemProp="thumbnailUrl" content={reelThumbnailUrl} />
              <h3 itemProp="name">{extractShortTitle(reel.message, 'Vidéo CCI Services - Nettoyage Professionnel')}</h3>
              <p itemProp="description">{cleanUnicodeForStructuredData(reel.message) || 'Découvrez nos services de nettoyage professionnel en vidéo.'}</p>
              <time itemProp="uploadDate" dateTime={reel.created_time}>
                {new Date(reel.created_time).toLocaleDateString()}
              </time>
              <span itemProp="duration" content={reel.length ? `PT${Math.round(reel.length)}S` : "PT30S"}>
                {reel.length ? `${Math.round(reel.length)}s` : "30s"}
              </span>
              <a href={reelPageUrl}>Voir le reel</a>
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
