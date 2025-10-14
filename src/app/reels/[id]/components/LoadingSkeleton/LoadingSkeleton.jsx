import styles from './LoadingSkeleton.module.css';

const LoadingSkeleton = () => {
  return (
    <div className={styles.skeleton}>
      <div className={styles.header}>
        <div className={styles.backButton}></div>
        <div className={styles.info}>
          <div className={styles.title}></div>
          <div className={styles.meta}></div>
        </div>
      </div>
      
      <div className={styles.videoContainer}>
        <div className={styles.video}></div>
      </div>
      
      <div className={styles.actions}>
        <div className={styles.stats}></div>
        <div className={styles.shareButton}></div>
      </div>
      
      <div className={styles.description}>
        <div className={styles.descTitle}></div>
        <div className={styles.descText}></div>
        <div className={styles.descText}></div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;