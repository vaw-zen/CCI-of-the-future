import styles from './postCard.module.css';
import { MdiHeartOutline,MdiShareOutline,MdiCommentOutline,LineMdCalendar } from '@/utils/components/icons';
const PostCard = ({ title, content, image, date, likes, comments, permalink_url, type }) => {
  return (
    <a
      href={permalink_url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles['post-card-link']}
    >
      <div className={styles['post-card']}>
        {image && (
          <div className={styles['post-card-image-container']}>
            <img 
              src={image} 
              alt={title}
              className={styles['post-card-image']}
            />
            <div className={`${styles['post-card-badge']} ${styles[type] ? styles[type] : type}`}>
              {type === "reel" ? "🎥 Reel" : "📝 Post"}
            </div>
          </div>
        )}
        
        <div className={styles['post-card-content']}>
          <div className={styles['post-card-date']}>
            <LineMdCalendar className={styles.icon} />
            {date}
          </div>

          <h3 className={styles['post-card-title']}>
            {title}
          </h3>

          <p className={styles['post-card-excerpt']}>
            {content}
          </p>

          <div className={styles['post-card-footer']}>
            <div className={styles['post-card-stats']}>
              <div className={`${styles['post-card-stat']} ${styles.likes}`}>
                <MdiHeartOutline className={styles.icon} />
                {likes}
              </div>
              <div className={`${styles['post-card-stat']} ${styles.comments}`}>
                <MdiCommentOutline className={styles.icon} />
                {comments}
              </div>
            </div>

            <MdiShareOutline className={`${styles['post-card-share']} ${styles.icon}`} />
          </div>
        </div>
      </div>
    </a>
  );
};

export default PostCard;
