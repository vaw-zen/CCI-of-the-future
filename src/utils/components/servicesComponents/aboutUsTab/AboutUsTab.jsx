import React from 'react';
import styles from './AboutUsTab.module.css';

export default function AboutUsTab() {
  return (
    <section className={styles.container}>
      <div className={styles.background}>
        <div className={styles.content}>
          <h3 className={styles.heading}>Our History</h3>
          <p className={styles.text}>Lorem ipsum dolor sit amet, consectetur data adipiscing elit, sed do eiusmod tempor this incididunt ut labore.</p>
        </div>
      </div>
      <div className={styles.background}>
        <div className={styles.content}>
          <h3 className={styles.heading}>Our Mission</h3>
          <p className={styles.text}>Lorem ipsum dolor sit amet, consectetur data adipiscing elit, sed do eiusmod tempor this incididunt ut labore.</p>
        </div>
      </div>
      <div className={styles.background}>
        <div className={styles.content}>
          <h3 className={styles.heading}>Our Vision</h3>
          <p className={styles.text}>Lorem ipsum dolor sit amet, consectetur data adipiscing elit, sed do eiusmod tempor this incididunt ut labore.</p>
        </div>
      </div>
    </section>
  );
} 