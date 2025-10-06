import React from "react";
import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import TeamMember from "./1-teamMember/teamMember";
import Equipe from "./2-Equipe/equipe";
import teamData from "./team.json";

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';

  return {
    title: teamData.metadata.title,
    description: teamData.metadata.description,
    alternates: {
      canonical: `${SITE_URL}/team`
    },
    openGraph: {
      title: teamData.metadata.title,
      description: teamData.metadata.description,
      url: `${SITE_URL}/team`,
      type: 'website'
    },
    twitter: {
      title: teamData.metadata.title,
      description: teamData.metadata.description
    }
  };
}

export default function ContactPage() {
  return (
    <>
      <script type="application/ld+json">{JSON.stringify(teamData.organizationJSONLD)}</script>
      <HeroHeader title={teamData.heroTitle} />
      <TeamMember />
      <Equipe />
    </>
  );
}
