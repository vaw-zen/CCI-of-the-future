import React from 'react';
import styles from './hero.module.css';
import {
    LineMdTiktok, LineMdFacebook, LineMdInstagram, LineMdLinkedin
} from '@/app/utils/components/icons';
import Image from 'next/image';
import HeroImage from './Image';

export default function HeroContent() {
    return (
        <div className={`${styles.heroContainer} ${styles.skeleton}`}>
            <div className={styles.backgroundImages}>
                <HeroImage sizes="100vw" src='/home/1-hero/background.webp' alt="Background" priority className={styles.backgroundImage}  />
                <HeroImage sizes="100vw" src='/home/1-hero/lines-glow.webp' alt="Glow Lines" className={styles.glowLines}  />
                <div className={styles.mainImageContainer}>
                    <HeroImage sizes="50vw" src='/home/1-hero/main.webp' alt="Main Image" priority className={styles.mainImage} skeletonClassName={styles.skeletonMainImage} />

                </div>
                <HeroImage sizes="25vw" src='/home/1-hero/circle.webp' alt="Circle" priority className={styles.circleImage} skeletonClassName={styles.skeletonCircle} />
            </div>

            <div className={styles.content}>
                <h1 className={styles.title}>Augmenter la qualité de vos services de nettoyage</h1>
                <h2 className={styles.subtitle}>Experts en nettoyage, nous proposons des services variés et de qualité.</h2>
                <div className={styles.contactDetails}>
                    <div>
                        <a href='/'>contact@cciservices.online</a>
                        <br />
                        <a href='/' className={styles.phoneLink}>+216 98 557 766</a>
                    </div>
                    <div className={styles.addressAndSocial}>
                        <a href='/'>06 - Rue Galants de nuits - l'aouina</a>
                        <div className={styles.socialIcons}>
                            <a href='/'><LineMdFacebook className={styles.icon} /></a>
                            <a href='/'><LineMdInstagram className={styles.icon} /></a>
                            <a href='/'><LineMdLinkedin className={styles.icon} /></a>
                            <a href='/'><LineMdTiktok className={styles.icon} /></a>
                        </div>
                    </div>
                </div>
                <div className={styles.buttons}>
                    <button className={`${styles.button} ${styles.primaryButton}`}>Nous contacter</button>
                    <button className={`${styles.button} ${styles.secondaryButton}`}>Nos Services</button>
                </div>
            </div>
        </div>
    )
}