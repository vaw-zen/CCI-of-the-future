import React from "react";
import styles from "./hero.module.css";
import Link from "next/link"; // ✅ Import Link from Next.js
import {
  LineMdTiktok,
  LineMdFacebook,
  LineMdInstagram,
  LineMdLinkedin,
  LineMdPhoneTwotone,
  SiMailDuotone,
  LineMdYoutubeTwotone,
} from "@/utils/components/icons";
import ResponsiveImage from "@/utils/components/Image/Image";
import GoogleAnalytics from "@/utils/components/GoogleAnalytics";

export default function Hero() {
  return (
    <div className={styles.heroContainer}>
      <div className={styles.backgroundImages}>
        <ResponsiveImage
          sizes={[100, 150, 200]}
          src="/home/1-hero/background.jpg"
          alt="CCI Services - Nettoyage professionnel moquettes et salons en Tunisie"
          className={styles.backgroundImage}
          title="CCI Services - Leader du nettoyage professionnel en Tunisie"
        />
        <ResponsiveImage
          sizes={[100, 90]}
          src="/home/1-hero/linesGlow.webp"
          position="bottom right"
          alt="Éléments décoratifs CCI Services"
          title="Design moderne CCI Services"
          priority
          className={styles.glowLines}
        />
        <div className={styles.mainImageContainer}>
          <ResponsiveImage
            skeleton
            sizes={[60, 80, 85]}
            src="/feedback/content (2).jpeg"
            alt="Nettoyage professionnel salons, canapés, fauteuils, matelas, rideaux et moquettes par CCI Tunisie"
            className={styles.mainImage}
            title="Nettoyage professionnel: salons, voitures, chaises, matelas, rideaux, moquettes - CCI Services"
          />
        </div>
        <ResponsiveImage
          skeleton
          sizes={[60, 80, 85]}
          src="/home/1-hero/circle.webp"
          alt="Équipement professionnel CCI - Essoreuse automatique de tapis"
          className={styles.circleImage}
          title="Première essoreuse automatique de tapis en Tunisie - CCI Services"
        />
      </div>

      <div className={styles.content}>
        <header>
          <h1 className={styles.title}>
          Augmenter la qualité de vos services de nettoyage
          </h1>
          <p className={styles.subtitle}>
          Experts en nettoyage, nous proposons des services variés et de
          qualité.
          </p>
        </header>
        <div className={styles.contactDetails}>
          <div itemScope itemType="https://schema.org/ContactPoint">
            <a 
              href="mailto:contact@cciservices.online"
              itemProp="email"
              title="Contactez CCI Services par email"
              id="email"
            >
              contact@cciservices.online
            </a>
            <br />
            <a
              href="https://wa.me/21698557766"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.phoneLink}
              itemProp="telephone"
              title="Appelez CCI Services - Devis gratuit"
            >
               +216 98 557 766
            </a>
          </div>
          <div className={styles.addressAndSocial}>
            <address itemScope itemType="https://schema.org/PostalAddress">
              <a
                href="https://www.google.com/maps/dir/36.8432852,10.2488076/Chaabane's+Cleaning+Intelligence,+06+Rue+Galant+De+Nuit%D8%8C+Tunis+2045%E2%80%AD/@36.8379036,10.206256,14z/data=!3m1!4b1!4m9!4m8!1m1!4e1!1m5!1m1!1s0xa2d22c796dfcf437:0x7dec63fbbbefa5c2!2m2!1d10.254949!2d36.8527438!5m1!1e2?entry=ttu&g_ep=EgoyMDI1MDkxNS4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                title="Localiser CCI Services sur Google Maps - El Aouina, Tunis"
              >
                 <span itemProp="streetAddress">06 Rue Galant de nuit</span>, <span itemProp="addressLocality">El Aouina</span>, <span itemProp="addressRegion">Tunis</span>
              </a>
            </address>

            <div className={styles.socialIcons}>
              <a
                href="https://wa.me/21698557766"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contacter via WhatsApp"
              >
                <LineMdPhoneTwotone className={styles.icon} />
              </a>
              <a  href="mailto:contact@cciservices.online" aria-label="Envoyer un email">
                <SiMailDuotone className={styles.icon} />
              </a>
              <a href="https://www.instagram.com/cci.services/" target="_blank" rel="noopener noreferrer" title="Suivez CCI Services sur Instagram - Photos avant/après nettoyage" aria-label="Instagram CCI Services">
                <LineMdInstagram className={styles.icon} />
              </a>
              <a href="https://www.facebook.com/Chaabanes.Cleaning.Intelligence" target="_blank" rel="noopener noreferrer" title="Page Facebook CCI Services - Avis clients et promotions" aria-label="Facebook CCI Services">
                <LineMdFacebook className={styles.icon} />
              </a>
              <a href="https://www.linkedin.com/company/chaabanes-cleaning-int" target="_blank" rel="noopener noreferrer" title="Profil professionnel CCI Services sur LinkedIn" aria-label="LinkedIn CCI Services">
                <LineMdLinkedin className={styles.icon} />
              </a>
              <a href="https://www.youtube.com/@ChaabanesCleaningIntelligence" title="Youtube channel CCI Services" aria-label="YouTube CCI Services">
                <LineMdYoutubeTwotone className={styles.icon} />
              </a>
            </div>
          </div>
        </div>
        <div className={styles.buttons}>
          <Link href="/contact#devis" title="Demander un devis gratuit CCI Services">
            <button className={`${styles.button} ${styles.primaryButton}`} type="button">
               Devis Gratuit
            </button>
          </Link>
          <Link href="/services" title="Découvrir tous nos services de nettoyage professionnel">
            <button className={`${styles.button} ${styles.secondaryButton}`} type="button">
               Nos Services
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
