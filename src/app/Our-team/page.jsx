import React from "react";
import styles from './page.module.css'
import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import TeamMember from "./1-teamMember/teamMember"
import Equipe from "./2-Equipe/equipe"
export default function ContactPage() {
  const socials = {
    facebook: "https://www.facebook.com/your-profile",
    twitter: "https://twitter.com/your-profile",
    linkedin: "https://www.linkedin.com/in/your-profile",
    instagram: "https://www.instagram.com/your-profile",
  };

  return (
    <>
      <HeroHeader title="Our team" />
        <TeamMember />
        <Equipe />
   
    </>
  );
}
