import React from "react";
import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import ReelsSection from "./components/reels/reelsSection";
import PostsGrid from "./components/posts/postsGrid";
export const metadata = {
  title: 'Publications & Conseils — CCI',
  description: 'Articles et vidéos sur la restauration du marbre, l’entretien des moquettes et les bonnes pratiques de nettoyage professionnel.',
};
const blogPageSchema = {
  "@context":"https://schema.org",
  "@type":"WebPage",
  name: "Publications & Conseils - CCI",
  description: "Articles et vidéos sur la restauration du marbre et l'entretien des moquettes.",
  url: "https://cciservices.online/blogs"
}
 
export default function Page() {
  return (
    <>
      <script type="application/ld+json">{JSON.stringify(blogPageSchema)}</script>
      <HeroHeader title={"Publications & Reels"} />
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%'}}>
        <ReelsSection />
        <PostsGrid />
      </div>
    </>
  );
}