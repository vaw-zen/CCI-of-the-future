import React from 'react';
import styles from './equipe.module.css';

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
  ];

  return (
    <div className={styles.container}>
      <h3>Our Team</h3>
      <h2>Meet the experienced team behind our success.</h2>
      <div className={styles.cardsContainer}>
        {cards.map((card, index) => (
          <div className={styles.card} key={index}>
            <div className={styles.imageContainer}>
              <img src={card.image} alt={card.name} />
            </div>
            <div className={styles.textContainer}>
              <h3>{card.name}</h3>
              <h4>{card.position}</h4>
              <div className={styles.socials}>
                <a href={card.socials.facebook} target="_blank" rel="noreferrer">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href={card.socials.twitter} target="_blank" rel="noreferrer">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href={card.socials.linkedin} target="_blank" rel="noreferrer">
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a href={card.socials.instagram} target="_blank" rel="noreferrer">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
