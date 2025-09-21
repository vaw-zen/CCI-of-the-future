import React from 'react';
import styles from './equipe.module.css';
import { LineMdInstagram, LineMdFacebook, LineMdLinkedin } from '@/utils/components/icons';
import GreenBand from '@/utils/components/GreenBand/GreenBand';
import data from './equipe.json';
import ResponsiveImage from '@/utils/components/Image/Image';
export default function Equipe() {
  return (
    <div className={styles.container}>
      <h3>{data.title}</h3>
      <h2>{data.subtitle}</h2>
     
        <div className={styles.cardsContainer}>
          {data.members.map((card, index) => (
            <div className={styles.card} key={index}>
              <div className={styles.imageContainer}>
                <ResponsiveImage
                  src={card.image}
                  alt={card.name}
                  title={card.name}
                  className={styles.imageContainer}
                  sizes={[21, 52, 97]}
                  skeleton
                />
              </div>
              <div className={styles.textContainer}>
                <div className={styles.textContainerContent}>
                  <div className={styles.textContainerContentTop}>
                    <h3>{card.name}</h3>
                    <h4>{card.position}</h4>
                  </div>

                  <div className={styles.socials} >
                    <a href={card.socials?.instagram || '#'}>
                      <LineMdInstagram className={styles.icon} />
                    </a>
                    <a href={card.socials?.facebook || '#'}>
                      <LineMdFacebook className={styles.icon} />
                    </a>
                    <a href={card.socials?.linkedin || '#'}>
                      <LineMdLinkedin className={styles.icon} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
     
      </div>
      <GreenBand className={styles.greenBandWrapper}/>
    </div>
  );
}
