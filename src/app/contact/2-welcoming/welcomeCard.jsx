import React from "react";
import styles from "./welcome.module.css";
import ResponsiveImage from '@/utils/components/Image/Image';

const WelcomeCard = ({ imageSrc, title, name, position, email, id }) => {
  return (
    <div id={id} className={styles.welcomeCard}>
      <ResponsiveImage className={styles.image} src={imageSrc} alt="welcoming image" sizes={[30, 35, 40]} />
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
