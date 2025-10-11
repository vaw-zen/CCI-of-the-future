import React from "react";
import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import ReelsSection from "./components/reels/reelsSection";
import PostsGrid from "./components/posts/postsGrid";
import GreenBand from "@/utils/components/GreenBand/GreenBand";
import styles from "./blog.module.css";
import blogsData from "./blogs.json";

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
      
      // ItemList for all content
      {
        "@type": "ItemList",
        "name": "Publications et Reels CCI",
        "description": "Liste complète de nos publications et vidéos",
        "numberOfItems": posts.length + reels.length,
        "itemListElement": [
          // Map posts
          ...posts.map((post, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "Article",
              "@id": post.permalink_url,
              "headline": post.title || post.message?.slice(0, 100) || "Publication CCI",
              "description": post.message?.slice(0, 200) || "Publication Facebook partagée sur CCI",
              "image": post.attachments?.[0]?.src || undefined,
              "datePublished": post.created_time,
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
              "mainEntityOfPage": post.permalink_url
            }
          })),
          
          // Map reels
          ...reels.map((reel, index) => ({
            "@type": "ListItem",
            "position": posts.length + index + 1,
            "item": {
              "@type": "VideoObject",
              "@id": reel.permalink_url,
              "name": reel.message || "Reel CCI",
              "description": reel.message?.slice(0, 200) || "Reel vidéo publié par CCI Services",
              "thumbnailUrl": reel.thumbnail,
              "uploadDate": reel.created_time,
              "contentUrl": reel.video_url,
              "embedUrl": reel.permalink_url,
              "duration": reel.length ? `PT${Math.round(reel.length)}S` : undefined,
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
              ]
            }
          }))
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

      {/* Hidden content for search engines (rendered server-side) */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <h1>{blogsData.metadata.title}</h1>
        <p>{blogsData.metadata.description}</p>
        
        {/* Posts content for crawlers */}
        {posts.map((post) => (
          <article key={post.id}>
            <h2>{post.title || post.message?.slice(0, 100)}</h2>
            <p>{post.message}</p>
            <time dateTime={post.created_time}>{new Date(post.created_time).toLocaleDateString()}</time>
            {post.attachments?.[0]?.src && (
              <img src={post.attachments[0].src} alt={post.title || 'Publication'} />
            )}
            <a href={post.permalink_url}>Voir sur Facebook</a>
          </article>
        ))}
        
        {/* Reels content for crawlers */}
        {reels.map((reel) => (
          <article key={reel.id}>
            <h2>{reel.message || 'Reel vidéo'}</h2>
            <p>{reel.message}</p>
            <time dateTime={reel.created_time}>{new Date(reel.created_time).toLocaleDateString()}</time>
            <video poster={reel.thumbnail}>
              <source src={reel.video_url} type="video/mp4" />
            </video>
            <a href={reel.permalink_url}>Voir sur Facebook</a>
          </article>
        ))}
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
