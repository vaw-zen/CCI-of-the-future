import React from 'react'
import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import Presentation from './1-section/presentation';
import Vision from './2-vision/vision';
import StrokeEffect from './3-webkit/strokeEffect';
import Showcase from '../home/sections/5-showcase/showcase';
import styles from './page.module.css'
import Refrences from '../home/sections/7-refrences/refrences';
import GreenBand from '@/utils/components/GreenBand/GreenBand';
import aboutData from './about.json';
import Certifications from './4-certifications/certifications';
import Equipements from './5-equipements/equipements';

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';

  return {
    title: aboutData.metadata.title,
    description: aboutData.metadata.description,
    alternates: {
      canonical: `${SITE_URL}/about`
    },
    openGraph: {
      title: aboutData.metadata.title,
      description: aboutData.metadata.description,
      url: `${SITE_URL}/about`,
      type: 'website'
    },
    twitter: {
      title: aboutData.metadata.title,
      description: aboutData.metadata.description
    }
  };
}

export default function page() {
  return (
    <main className={styles.page}>
    <script type="application/ld+json">{JSON.stringify(aboutData.organizationJSONLD)}</script>
    <HeroHeader title={aboutData.heroTitle}/>
    <Presentation/>
    <Vision/>
    <StrokeEffect/>
    <Showcase className={styles.showCase}  />
    <Equipements/>
    <GreenBand className={styles.greenBandWrapper}/>
    <Refrences className={styles.refrences}/>
    <Certifications/>
    </main>
  )
}
