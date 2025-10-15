import React from 'react'
import Services from './sections/2-services/services'
import HeroHeader from '@/utils/components/reusableHeader/HeroHeader'
import Details from './sections/1-details/details'
import Band from '../home/sections/4-band/band'
import Testimonials from '../home/sections/8-testimonials/testimonials'
import GreenBand from '@/utils/components/GreenBand/GreenBand'
import styles from './page.module.css'
import FAQ from './sections/3-FAQ/FAQ'
import MobileServices from '../home/sections/3-services/services'
import { ImageSlider } from '@/utils/components/imageSlider/imageSlider'
import servicesData from './sections/2-services/services.json'

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
  
  return {
    title: 'Services CCI — Polissage marbre, Nettoyage moquettes, Tapisserie | Ariana Tunis',
    description: 'Services nettoyage Ariana, Tunis ✓ Polissage marbre ✓ Nettoyage moquettes ✓ Tapisserie ✓ Devis gratuit ✓ +216 98 557 766',
    keywords: ['services nettoyage ariana', 'nettoyage ariana', 'CCI services ariana', 'marbre ariana', 'services carthage', 'nettoyage la marsa', 'nettoyage prestige tunis'],
    alternates: {
      canonical: `${SITE_URL}/services`
    },
    openGraph: {
      title: 'Services CCI — Polissage marbre, Nettoyage moquettes, Tapisserie',
      description: 'Découvrez nos prestations professionnelles : polissage du marbre, nettoyage de moquettes, rénovation de tapisserie et nettoyages post-chantier. Devis gratuit.',
      url: `${SITE_URL}/services`,
      type: 'website'
    },
    twitter: {
      title: 'Services CCI — Polissage marbre, Nettoyage moquettes, Tapisserie',
      description: 'Découvrez nos prestations professionnelles : polissage du marbre, nettoyage de moquettes, rénovation de tapisserie et nettoyages post-chantier. Devis gratuit.'
    }
  };
}



export default function ServicesPage() {
    const servicesSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Services CCI",
        itemListElement: servicesData.services.map((s, i) => ({
            "@type": "ListItem",
            position: i+1,
            item: {
                "@type": "Service",
                name: Array.isArray(s.title) ? s.title.join(' ') : s.title,
                description: s.desc,
                url: `https://cciservices.online${s.link}`
            }
        }))
    };
    return (
        <main>
            <HeroHeader title={'Nos Services - CCI Tunisie'} />
            <script type="application/ld+json">{JSON.stringify(servicesSchema)}</script>
            <div className={styles.services}>
                <Details />
                <Services className={styles.desktopServices} />
                <MobileServices className={styles.mobileServices} />
                <FAQ />
                <Band />
                <Testimonials className={styles.testimonialsWrapper} />
                <GreenBand className={styles.greenBandWrapper} />
            </div>
        </main>
    )
}
