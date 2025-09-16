import styles from "./teamMember.module.css";
import React from "react";
export default function teamMember() {
  return (
    <div className={styles.container}>
      <div className={styles.imageContainer}></div>
      <div className={styles.infoContainer}>
        <h2>Notre mission est de construire pour votre confort</h2>
        <p>
          Nous sommes spécialisés dans la fourniture de services de nettoyage
          industriel et de tapisserie de premier ordre. Notre équipe, dotée
          d'une expertise approfondie et de technologies de pointe, s'engage à
          offrir des solutions de nettoyage inégalées dans une variété
          d'industries.
        </p>
        <div className={styles.memberInfo}>
          <div className={styles.memberCard}>
            <img src="/our-team/photo.png" alt="Chaabane Fares" title="Chaabane Fares" />
            <h3>Chaabane Fares Co-Founder</h3>
          </div>
          <div className={styles.memberAutograph}>
            <img src="/our-team/autograph.png" alt="Autograph of Chaabane Fares" title="Autograph of Chaabane Fares" />
          </div>
        </div>
      </div>
    </div>
  );
}
