"use client"
import React, { useEffect, useState, useRef } from "react";
import styles from "./strokeEffect.module.css";

const counters = [
  { value: 10, label: "Projects  completed", suffix: "K" },
  { value: 120, label: "Worked  employees" },
  { value: 15, label: "years of  experience", suffix: "+" },
  { value: 18, label: "Skilled  professionals", suffix: "+" },
];

const durations = [2000, 1500, 1500, 1500];

export default function StrokeEffect() {
  const [counts, setCounts] = useState(counters.map(() => 0));
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);
  const frameRef = useRef(null);
  const startTimesRef = useRef(counters.map(() => null));

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

    let isCancelled = false;
    startTimesRef.current = counters.map(() => null);

    function animateCounter(timestamp) {
      if (isCancelled) return;

      let hasRemaining = false;

      setCounts((prevCounts) =>
        prevCounts.map((count, index) => {
          if (count >= counters[index].value) return count;

          if (!startTimesRef.current[index]) {
            startTimesRef.current[index] = timestamp;
          }

          const elapsed = timestamp - startTimesRef.current[index];
          const progress = Math.min(elapsed / durations[index], 1);
          const nextValue = Math.floor(progress * counters[index].value);

          if (nextValue < counters[index].value) {
            hasRemaining = true;
          }

          return nextValue;
        })
      );

      if (hasRemaining) {
        frameRef.current = requestAnimationFrame(animateCounter);
      }
    }

    frameRef.current = requestAnimationFrame(animateCounter);

    return () => {
      isCancelled = true;
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
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
