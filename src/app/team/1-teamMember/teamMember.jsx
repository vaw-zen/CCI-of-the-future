import styles from "./teamMember.module.css";
import React from "react";
export default function teamMember() {
    return (
        <div className={styles.container}>
            <div className={styles.imageContainer}></div>
            <div className={styles.infoContainer
            } >
                <h2>Our mission is to build for your comfort</h2>
                <p>We work to ensure people’s comfort at their home, and to provide the best and the fastest help at fair prices. We stand for quality, safety and credibility, so you could be sure about our work.</p>
                <div className={styles.memberInfo}>
                    <div className={styles.memberCard}>
                        <img src="/our-team/photo.png" alt="" />
                        <h3>Chaabane Fares Co-Founder</h3>
                    </div>
                    <div className={styles.memberAutograph}><img src="/our-team/autograph.png" alt="" /></div>
                </div>
            </div>
        </div>
    );
}