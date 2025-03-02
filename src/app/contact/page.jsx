import React from "react";
import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import Actions from "./1-actions/actions";

export default function ContactPage() {
  const socials = {
    facebook: "https://www.facebook.com/your-profile",
    twitter: "https://twitter.com/your-profile",
    linkedin: "https://www.linkedin.com/in/your-profile",
    instagram: "https://www.instagram.com/your-profile",
  };

  return (
    <>
      <HeroHeader title="Contact Us" />
      <Actions />
    </>
  );
}
