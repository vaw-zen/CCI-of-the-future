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
} from "@/utils/components/icons";
import ResponsiveImage from "@/utils/components/Image/Image";

export default function Hero() {
  return (
    <div className={styles.heroContainer}>
      <div className={styles.backgroundImages}>
        <ResponsiveImage
          sizes={[100, 150, 200]}
          src="/home/1-hero/background.jpg"
          alt="Background"
          className={styles.backgroundImage}
        />
        <ResponsiveImage
          sizes={[100, 90]}
          src="/home/1-hero/linesGlow.webp"
          position="bottom right"
          alt="Glow Lines"
          priority
          className={styles.glowLines}
        />
        <div className={styles.mainImageContainer}>
          <ResponsiveImage
            skeleton
            sizes={[60, 80, 85]}
            src="/home/1-hero/main.webp"
            alt="Main Image"
            className={styles.mainImage}
          />
        </div>
        <ResponsiveImage
          skeleton
          sizes={[60, 80, 85]}
          src="/home/1-hero/circle.webp"
          alt="Circle"
          className={styles.circleImage}
        />
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>
          Augmenter la qualité de vos services de nettoyage
        </h1>
        <h2 className={styles.subtitle}>
          Experts en nettoyage, nous proposons des services variés et de
          qualité.
        </h2>
        <div className={styles.contactDetails}>
          <div>
           <a href="mailto:contact@cciservices.online">
      contact@cciservices.online
    </a>
    <br />
             <a
      href="https://wa.me/21698557766"
      target="_blank"
      rel="noopener noreferrer"
      className={styles.phoneLink}
    >
      +216 98 557 766
    </a>
          </div>
          <div className={styles.addressAndSocial}>
          <a
  href="https://www.google.com/maps/dir/?api=1&destination=06+Rue+Galant+de+nuit,+L'Aouina,+Tunis,+2045,+Tunisie"
  target="_blank"
  rel="noopener noreferrer"
>
  06 - Rue Galants de nuits - l'aouina
</a>

            <div className={styles.socialIcons}>
              <a href="/">
                <LineMdPhoneTwotone className={styles.icon} />
              </a>
              <a href="/">
                <SiMailDuotone className={styles.icon} />
              </a>
              <a href="/https://www.instagram.com/cci.services/">
                <LineMdInstagram className={styles.icon} />
              </a>
              <a href="/https://www.facebook.com/Chaabanes.Cleaning.Intelligence">
                <LineMdFacebook className={styles.icon} />
              </a>
              <a href="/">
                <LineMdLinkedin className={styles.icon} />
              </a>
              <a href="/">
                <LineMdTiktok className={styles.icon} />
              </a>
            </div>
          </div>
        </div>
        <div className={styles.buttons}>
            <Link href="/contact">
            <button className={`${styles.button} ${styles.primaryButton}`}>
              Nous contacter
            </button>
          </Link>
          <Link href="/services">
            <button className={`${styles.button} ${styles.secondaryButton}`}>
              Nos Services
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
