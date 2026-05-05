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
const initialCounts = counters.map(() => 0);

export default function StrokeEffect() {
  const [counts, setCounts] = useState(initialCounts);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);
  const frameRef = useRef(null);
  const startTimeRef = useRef(null);
  const countsRef = useRef(initialCounts);

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
    startTimeRef.current = null;
    countsRef.current = initialCounts;

    function animateCounter(timestamp) {
      if (isCancelled) return;

      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const nextCounts = counters.map((counter, index) => {
        const progress = Math.min(elapsed / durations[index], 1);
        return Math.min(counter.value, Math.floor(progress * counter.value));
      });

      const hasChanged = nextCounts.some(
        (nextValue, index) => nextValue !== countsRef.current[index]
      );

      if (hasChanged) {
        countsRef.current = nextCounts;
        setCounts(nextCounts);
      }

      const hasRemaining = nextCounts.some(
        (nextValue, index) => nextValue < counters[index].value
      );

      if (hasRemaining) {
        frameRef.current = requestAnimationFrame(animateCounter);
      } else {
        frameRef.current = null;
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
