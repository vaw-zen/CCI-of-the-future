import styles from './postCardSkeleton.module.css';

const PostCardSkeleton = ({ className }) => {
  return (
    <div className={`${styles['skeleton-card']} ${className}`}>
      <div className={styles['skeleton-image-container']}>
        <div className={styles['skeleton-image']}></div>
        <div className={styles['skeleton-badge']}></div>
      </div>
      
      <div className={styles['skeleton-content']}>
        <div className={styles['skeleton-date']}></div>
        
        <div className={styles['skeleton-title']}></div>
        
        <div className={styles['skeleton-excerpt']}>
          <div className={styles['skeleton-line']}></div>
          <div className={styles['skeleton-line']}></div>
          <div className={styles['skeleton-line-short']}></div>
        </div>
        
        <div className={styles['skeleton-footer']}>
          <div className={styles['skeleton-stats']}>
            <div className={styles['skeleton-stat']}></div>
            <div className={styles['skeleton-stat']}></div>
          </div>
          <div className={styles['skeleton-share']}></div>
        </div>
      </div>
    </div>
  );
};

export default PostCardSkeleton;
