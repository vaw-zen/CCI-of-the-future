import React from "react";
import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import ReelsSection from "./components/reels/reelsSection";
import PostsGrid from "./components/posts/postsGrid";
import GreenBand from "@/utils/components/GreenBand/GreenBand";
import styles from "./blog.module.css";
import blogsData from "./blogs.json";

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';

  return {
    title: blogsData.metadata.title,
    description: blogsData.metadata.description,
    alternates: {
      canonical: `${SITE_URL}/blogs`
    },
    openGraph: {
      title: blogsData.metadata.title,
      description: blogsData.metadata.description,
      url: `${SITE_URL}/blogs`,
      type: 'website'
    },
    twitter: {
      title: blogsData.metadata.title,
      description: blogsData.metadata.description
    }
  };
}

export default function Page() {
  return (
    <main className={styles.main}>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogsData.collectionPageJSONLD) }}
      />

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
        <ReelsSection />
        <GreenBand className={styles.greenBandReels} />

        <PostsGrid />
      </div>

      <GreenBand className={styles.greenBandWrapper} />
    </main>
  );
}
