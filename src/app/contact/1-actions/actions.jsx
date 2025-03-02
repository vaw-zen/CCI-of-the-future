import React from "react";
import styles from "./actions.module.css";
import { LineMdPhoneTwotone, SiMailDuotone } from "@/utils/components/icons";

export default function Actions() {
    const socials = {
        facebook: "https://www.facebook.com/your-profile",
        twitter: "https://twitter.com/your-profile",
        linkedin: "https://www.linkedin.com/in/your-profile",
        instagram: "https://www.instagram.com/your-profile",
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h3 className={styles.subtitle}>CONTACT US</h3>
                    <h2 className={styles.title}>We'd love to hear from you.</h2>
                </div>
                <div className={styles.headerRight}>
                    <h3 className={styles.headerMessage}>Get in touch and let's create together</h3>
                    <ul className={styles.socialList}>
                        {Object.entries(socials).map(([key, url]) => (
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

                    ></iframe>

            
                </div>
                <div className={styles.infoContainer}>
                    <div className={styles.phoneSection}>
                        <div className={styles.phoneInfoTop}>
                            <LineMdPhoneTwotone className={styles.icon} />
                            <h3 className={styles.label}>Call now</h3>
                            <h4 className={styles.phoneNumber}>+216 98 55 77 66</h4>
                        </div>
                        <div className={styles.phoneInfoBottom}>
                            <p className={styles.phoneInfoText}>
                                Team of professional and skilled experts in all domestic spheres.
                            </p>
                            <strong className={styles.phoneHours}>Working hours: 9am to 6pm</strong>
                        </div>
                    </div>
                    <div className={styles.emailSection}>
                        <div className={styles.emailInfoTop}>
                            <SiMailDuotone className={styles.icon} />
                            <h3 className={styles.label}>E-mail</h3>
                            <h4 className={styles.emailAddress}>contact@cciservices.online</h4>
                        </div>
                        <div className={styles.emailInfoBottom}>
                            <p className={styles.emailInfoText}>
                                Our online scheduling and payment system is safe.
                            </p>
                            <strong className={styles.emailHours}>Working hours: 8am to 5pm</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
