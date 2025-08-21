import React from 'react';
import styles from './AboutUsTab.module.css';

export default function AboutUsTab({
  historyText = "Lorem ipsum dolor sit amet, consectetur data adipiscing elit, sed do eiusmod tempor this incididunt ut labore.",
  missionText = "Lorem ipsum dolor sit amet, consectetur data adipiscing elit, sed do eiusmod tempor this incididunt ut labore.",
  visionText = "Lorem ipsum dolor sit amet, consectetur data adipiscing elit, sed do eiusmod tempor this incididunt ut labore."
}) {
  return (
    <section className={styles.container}>
      <div className={styles.background}>
        <div className={styles.content}>
          <h3 className={styles.heading}>Notre histoire</h3>
          <p className={styles.text}>{historyText}</p>
        </div>
      </div>
      <div className={styles.background}>
        <div className={styles.content}>
          <h3 className={styles.heading}>Notre mission</h3>
          <p className={styles.text}>{missionText}</p>
        </div>
      </div>
      <div className={styles.background}>
        <div className={styles.content}>
          <h3 className={styles.heading}>Notre vision</h3>
          <p className={styles.text}>{visionText}</p>
        </div>
      </div>
    </section>
  );
}