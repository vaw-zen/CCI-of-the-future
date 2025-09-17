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
  "hasPart": [
    {
      "@type": "BlogPosting",
      "headline": "Comment entretenir une moquette après un nettoyage",
      "description":
        "Conseils pratiques pour garder votre moquette propre après un nettoyage professionnel.",
      "author": {
        "@type": "Organization",
        "name": "CCI Services",
      },
      "publisher": {
        "@type": "Organization",
        "name": "CCI Services",
        "logo": {
          "@type": "ImageObject",
          "url": "https://cciservices.online/logo.png",
        },
      },
      "mainEntityOfPage":
        "https://cciservices.online/blogs/comment-entretenir-moquette",
    },
    {
      "@type": "BlogPosting",
      "headline": "Vidéo : Restauration de marbre étape par étape",
      "description":
        "Découvrez en vidéo comment redonner de l’éclat à un sol en marbre.",
      "uploadDate": "2025-09-16",
      "author": {
        "@type": "Organization",
        "name": "CCI Services",
      },
      "publisher": {
        "@type": "Organization",
        "name": "CCI Services",
      },
      "mainEntityOfPage":
        "https://cciservices.online/blogs/restauration-marbre-video",
    },
  ],
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
