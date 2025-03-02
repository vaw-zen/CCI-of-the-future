import React from "react";
import styles from "./welcome.module.css";
export default function welcome() {
  return (
    <div className={styles.welcome}>
      <div className={styles.welcomeleft}>
        <img
          className={styles.image}
          src="/contact/welcome1.jpg"
          alt="welcoming image"
        />

        <div className={styles.welcomeinfotext}>
          <h3>Want to join our dream team?</h3>
          <div className={styles.nameandposition}>
            <h5>Jack Carter</h5>
            <div  className={styles.slash}  >/</div>
            <h6>Clients of boldmen</h6>
          </div>
          <h4>contact@cciservices.online</h4>
        </div>
      </div>
      <div className={styles.welcomeright}>
        <img
          className={styles.image}
          src="/contact/welcome2.jpg"
          alt="welcoming image"
        />
        <div className={styles.welcomeinfotext}>
          <h3>Want to join our dream team?</h3>
          <div className={styles.nameandposition}>
            <h5>Jack Carter</h5>
            <div className={styles.slash}>/</div>
            <h6>Clients of boldmen</h6>
          </div>
          <h4>contact@cciservices.online</h4>
        </div>
      </div>
    </div>
  );
}
