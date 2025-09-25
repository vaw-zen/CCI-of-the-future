import React from "react";
import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import TeamMember from "./1-teamMember/teamMember";
import Equipe from "./2-Equipe/equipe";

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
  
  return {
    title: 'Équipe CCI — Experts en restauration & nettoyage',
    description: 'Rencontrez l\'équipe CCI : techniciens qualifiés spécialisés en marbre, moquettes, tapisserie et nettoyages après chantier.',
    alternates: {
      canonical: `${SITE_URL}/team`
    },
    openGraph: {
      title: 'Équipe CCI — Experts en restauration & nettoyage',
      description: 'Rencontrez l\'équipe CCI : techniciens qualifiés spécialisés en marbre, moquettes, tapisserie et nettoyages après chantier.',
      url: `${SITE_URL}/team`,
      type: 'website'
    },
    twitter: {
      title: 'Équipe CCI — Experts en restauration & nettoyage',
      description: 'Rencontrez l\'équipe CCI : techniciens qualifiés spécialisés en marbre, moquettes, tapisserie et nettoyages après chantier.'
    }
  };
}

const teamOrgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "CCI",
  url: "https://cciservices.online/team",
  logo: "https://cciservices.online/logo.png"
}

export default function ContactPage() {
  const socials = {
    facebook: "https://www.facebook.com/Chaabanes.Cleaning.Intelligence/",
    twitter: "https://twitter.com/your-profile",
    linkedin: "https://www.linkedin.com/company/chaabanes-cleaning-int",
    instagram: "https://www.instagram.com/cci.services/",
  };
  const teamImages = ['/home/1.webp','/home/3.webp'];

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(teamOrgSchema)}</script>
      <HeroHeader title="Our team" />
      <TeamMember />
      <Equipe />
    </>
  );
}