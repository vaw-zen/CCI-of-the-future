import React from "react";
import styles from "./presentation.module.css";
import content from "./presentation.json";

export default function Presentation() {
  return (
    <div className={styles.container}>
      <div className={styles.first}>
        <h3>Trusted Experience</h3>
        <h2>We are a team of professional & skilled experts</h2>
        <p>
          We work to ensure people’s comfort at their home and to provide the
          best and the fastest help at fair prices. We work to ensure people’s
          comfort at their home and to provide the best and the fastest help at
          a fair price.
        </p>
      </div>
      <div className={styles.second}>
        {content.map((el, key) => {
          const percentage = parseInt(el.percentage); // Convert string "87%" to number

          return (
            <div key={key} className={styles.bar}>
              <div className={styles.barText}>
                <h3>{el.content}</h3>
                <h3>{el.percentage}</h3>
              </div>
              <div className={styles.barBorder}>
                <div
                  className={styles.progress}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
