import React from "react";
import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import PostsGrid from "@/utils/components/blogComponents/Posts/PostsGrid";
import ReelsSection from "@/utils/components/blogComponents/reels/ReelsSection";

export default function Page() {
  return (
    <>
      <HeroHeader title={"Blog & Reels"} />
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%'}}>
        <ReelsSection />
        <PostsGrid />
      </div>
    </>
  );
}