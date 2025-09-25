import React from 'react'
import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import Presentation from './1-section/presentation';
import Vision from './2-vision/vision';
import StrokeEffect from './3-webkit/strokeEffect';
import Showcase from '../home/sections/5-showcase/showcase';
import styles from './page.module.css'
import Refrences from '../home/sections/7-refrences/refrences';
import GreenBand from '@/utils/components/GreenBand/GreenBand';

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
  
  return {
    title: 'À propos de nous — CCI',
    description: 'CCI, experts en restauration de marbre, nettoyage de moquettes et tapisserie en Tunisie. Notre équipe s\'engage pour qualité et durabilité.',
    alternates: {
      canonical: `${SITE_URL}/about`
    },
    openGraph: {
      title: 'À propos de nous — CCI',
      description: 'CCI, experts en restauration de marbre, nettoyage de moquettes et tapisserie en Tunisie. Notre équipe s\'engage pour qualité et durabilité.',
      url: `${SITE_URL}/about`,
      type: 'website'
    },
    twitter: {
      title: 'À propos de nous — CCI',
      description: 'CCI, experts en restauration de marbre, nettoyage de moquettes et tapisserie en Tunisie. Notre équipe s\'engage pour qualité et durabilité.'
    }
  };
}

export default function page() {
  return (
    <main className={styles.page}>
    <script type="application/ld+json">{JSON.stringify({
      "@context":"https://schema.org",
      "@type":"Organization",
      name: "CCI",
      url: "https://cciservices.online/about",
      logo: "https://cciservices.online/logo.png"
    })}</script>
    <HeroHeader title={"About us"}/>
    <Presentation/>
    <Vision/>
    <StrokeEffect/>
    <Showcase className={styles.showCase}  />
    <Refrences className={styles.refrences}/>
    <GreenBand className={styles.greenBandWrapper}/>
    </main>
  )
}