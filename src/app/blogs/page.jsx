import React from "react";
import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import ReelsSection from "./components/reels/reelsSection";
import PostsGrid from "./components/posts/postsGrid";

export const metadata = {
  title: "Publications & Conseils — CCI",
  description:
    "Articles et vidéos sur la restauration du marbre, l’entretien des moquettes et les bonnes pratiques de nettoyage professionnel.",
};

// Example static schema for now (you can generate dynamically inside ReelsSection / PostsGrid)
const blogPageSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Publications & Conseils - CCI",
  "description":
    "Articles et vidéos sur la restauration du marbre et de tout typpe de sol et mur, l'entretien des tapis et des moquettes, le nettoyage salon étape par étape.",
  "url": "https://cciservices.online/blogs",
  
};

export default function Page() {
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPageSchema) }}
      />

      <HeroHeader title={"Publications & Reels"} />
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
        <PostsGrid />
      </div>
    </>
  );
}
