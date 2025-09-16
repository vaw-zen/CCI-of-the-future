import React from 'react';
import styles from './equipe.module.css';
import { LineMdInstagram, LineMdFacebook, LineMdLinkedin } from '@/utils/components/icons';
import GreenBand from '@/utils/components/GreenBand/GreenBand';
export default function Equipe() {
  const cards = [
    {
      name: 'John Doe',
      position: 'CEO & Founder',
      image: '/our-team/equippe.jpg',
      socials: {
        facebook: '#',
        twitter: '#',
        linkedin: '#',
        instagram: '#',
      },
    },
    {
      name: 'Jane Smith',
      position: 'Marketing Director',
      image: '/our-team/equippe.jpg',
      socials: {
        facebook: '#',
        twitter: '#',
        linkedin: '#',
        instagram: '#',
      },
    },
    {
      name: 'Emily Johnson',
      position: 'Lead Designer',
      image: '/our-team/equippe.jpg',
      socials: {
        facebook: '#',
        twitter: '#',
        linkedin: '#',
        instagram: '#',
      },
    },
    {
      name: 'Michael Brown',
      position: 'Head of Development',
      image: '/our-team/equippe.jpg',
      socials: {
        facebook: '#',
        twitter: '#',
        linkedin: '#',
        instagram: '#',
      },
    },
    {
      name: 'Michael Brown',
      position: 'Head of Development',
      image: '/our-team/equippe.jpg',
      socials: {
        facebook: '#',
        twitter: '#',
        linkedin: '#',
        instagram: '#',
      },
    },
  ];
  

  return (
    <div className={styles.container}>
      <h3>Our Team</h3>
      <h2>Meet the experienced team behind our success.</h2>
     
        <div className={styles.cardsContainer}>
          {cards.map((card, index) => (
            <div className={styles.card} key={index}>
              <div className={styles.imageContainer}>
                <img src={card.image} alt={card.name} title={card.name} />
              </div>
              <div className={styles.textContainer}>
                <div className={styles.textContainerContent}>
                  <div className={styles.textContainerContentTop}>
                    <h3>{card.name}</h3>
                    <h4>{card.position}</h4>
                  </div>

                  <div className={styles.socials} >
                    <a href="/">
                      <LineMdInstagram className={styles.icon} />
                    </a>
                    <a href="/">
                      <LineMdFacebook className={styles.icon} />
                    </a>
                    <a href="/">
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
