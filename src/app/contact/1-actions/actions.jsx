import React from "react";
import styles from "./actions.module.css";
import { LineMdPhoneTwotone, SiMailDuotone } from "@/utils/components/icons";
import content from "./content.json";
 
export default function Actions() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h3 className={styles.subtitle}>{content.contactUs}</h3>
          <h2 className={styles.title}>{content.contactTitle}</h2>
        </div>
        <div className={styles.headerRight}>
          <h3 className={styles.headerMessage}>{content.headerMessage}</h3>
          <ul className={styles.socialList}>
            {Object.entries(content.socials).map(([key, url]) => (
              <li className={styles.socialItem} key={key}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className={styles.infoSection}>
        <div className={styles.mapContainer}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3192.571224004497!2d10.25237407668787!3d36.852743772232266!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xa2d22c796dfcf437%3A0x7dec63fbbbefa5c2!2sChaabane&#39;s%20Cleaning%20Intelligence!5e0!3m2!1sen!2stn!4v1740873409556!5m2!1sen!2stn"
            width="100%"
            height="100%"
            loading="lazy"
            allowFullScreen=""
          ></iframe>
        </div>
        <div className={styles.infoContainer}>
          <div className={styles.phoneSection}>
            <div className={styles.phoneInfoTop}>
              <LineMdPhoneTwotone className={styles.icon} />
              <h3 className={styles.label}>{content.callNow}</h3>
              <h4 className={styles.phoneNumber}>{content.phoneNumber}</h4>
            </div>
            <div className={styles.phoneInfoBottom}>
              <p className={styles.phoneInfoText}>{content.phoneInfoText}</p>
              <strong className={styles.phoneHours}>{content.phoneHours}</strong>
            </div>
          </div>
          <div className={styles.emailSection}>
            <div className={styles.emailInfoTop}>
              <SiMailDuotone className={styles.icon} />
              <h3 className={styles.label}>{content.emailLabel}</h3>
              <h4 className={styles.emailAddress}>{content.emailAddress}</h4>
            </div>
            <div className={styles.emailInfoBottom}>
              <p className={styles.emailInfoText}>{content.emailInfoText}</p>
              <strong className={styles.emailHours}>{content.emailHours}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  );
}
