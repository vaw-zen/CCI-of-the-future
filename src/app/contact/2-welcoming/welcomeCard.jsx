import React from "react";
import styles from "./welcomeCard.module.css";

const WelcomeCard = ({ imageSrc, title, name, position, email }) => {
  return (
    <div className={styles.welcomeCard}>
      <img className={styles.image} src={imageSrc} alt="welcoming image" />
      <div className={styles.welcomeinfotext}>
        <h3>{title}</h3>
        <div className={styles.nameandposition}>
          <h5>{name}</h5>
          <div className={styles.slash}>/</div>
          <h6>{position}</h6>
        </div>
        <h4>{email}</h4>
      </div>
    </div>
  );
};

export default WelcomeCard;
