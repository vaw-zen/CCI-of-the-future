import React, { useEffect, useState } from "react";
import styles from "./strokeEffect.module.css";

export default function StrokeEffect() {
  const counters = [
    { value: 10, label: "projects <br /> completed", suffix: "K" },
    { value: 120, label: "worked <br /> employees", suffix: "+" },
    { value: 15, label: "years of <br /> experience", suffix: "+" },
    { value: 18, label: "skilled <br /> professionals", suffix: "+" },
  ];

  const [counts, setCounts] = useState(counters.map(() => 0));

  useEffect(() => {
    let startTimes = counters.map(() => null);
    const durations = [2000, 1500, 1500, 1500]; // Animation duration for each counter

    function animateCounter(timestamp) {
      setCounts((prevCounts) => {
        return prevCounts.map((count, index) => {
          if (count >= counters[index].value) return count; // Stop if already reached

          if (!startTimes[index]) startTimes[index] = timestamp;
          const elapsed = timestamp - startTimes[index];
          const progress = Math.min(elapsed / durations[index], 1); // Ensure max is 1

          return Math.floor(progress * counters[index].value);
        });
      });

      if (counts.some((count, i) => count < counters[i].value)) {
        requestAnimationFrame(animateCounter);
      }
    }

    requestAnimationFrame(animateCounter);
  }, []);

  return (
    <div className={styles.container}>
      {counters.map((counter, index) => (
        <div key={index} className={styles.flexItem}>
          <div className={styles.strokeText}>
            {counts[index]}
            {counter.suffix && <span className={styles.suffix}>{counter.suffix}</span>}
          </div>
          <div
            className={styles.labelText}
            dangerouslySetInnerHTML={{ __html: counter.label }}
          />
        </div>
      ))}
    </div>
  );
}
