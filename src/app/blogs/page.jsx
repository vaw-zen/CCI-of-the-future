import React from "react";
import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import ReelsSection from "./components/reels/reelsSection";
import PostsGrid from "./components/posts/postsGrid";
 
export default function Page() {
  return (
    <>
      <HeroHeader title={"Publications & Reels"} />
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%'}}>
        <ReelsSection />
        <PostsGrid />
      </div>
    </>
  );
}