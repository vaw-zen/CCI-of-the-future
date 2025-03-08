"use client"
import React, { useEffect, useState, useRef } from "react";
import styles from "./strokeEffect.module.css";

export default function StrokeEffect() {
  const counters = [
    { value: 10, label: "projects <br /> completed", suffix: "K" },
    { value: 120, label: "worked <br /> employees", suffix: "+" },
    { value: 15, label: "years of <br /> experience", suffix: "+" },
    { value: 18, label: "skilled <br /> professionals", suffix: "+" },
  ];

  const [counts, setCounts] = useState(counters.map(() => 0));
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTimes = counters.map(() => null);
    const durations = [2000, 1500, 1500, 1500];

    function animateCounter(timestamp) {
      setCounts((prevCounts) => {
        return prevCounts.map((count, index) => {
          if (count >= counters[index].value) return count;

          if (!startTimes[index]) startTimes[index] = timestamp;
          const elapsed = timestamp - startTimes[index];
          const progress = Math.min(elapsed / durations[index], 1);

          return Math.floor(progress * counters[index].value);
        });
      });

      if (counts.some((count, i) => count < counters[i].value)) {
        requestAnimationFrame(animateCounter);
      }
    }

    requestAnimationFrame(animateCounter);
  }, [isVisible]);

  return (
    <div ref={containerRef} className={styles.container}>
      {counters.map((counter, index) => (
        <div key={index} className={styles.flexItem}>
          <div className={styles.strokeText}>
            {counts[index]}
            {counter.suffix && <span className={styles.suffix} style={{fontSize:'5.73vw', fontWeight:'600'}}>{counter.suffix}</span>}
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
