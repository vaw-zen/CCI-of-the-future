"use client"
import React, { useEffect, useState } from "react";
import styles from "../presentation.module.css";
import content from "../presentation.json";

export default function ProgressBars() {
  const [progressValues, setProgressValues] = useState(content.map(() => 0));

  useEffect(() => {
    let isSubscribed = true;
    
    const timer = setTimeout(() => {
      if (isSubscribed) {
        setProgressValues(content.map((el) => parseInt(el.percentage)));
      }
    }, 100);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, []); // Empty dependency array since we only want to run this once

  return (
    <div className={styles.second}>
      {content.map((el, index) => (
        <div key={index} className={styles.bar}>
          <div className={styles.barText}>
            <h3>{el.content}</h3>
            <h3>{el.percentage}</h3>
          </div>
          <div className={styles.barBorder}>
            <div
              className={styles.progress}
              style={{ width: `${progressValues[index]}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}
