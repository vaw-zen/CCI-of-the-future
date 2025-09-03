import styles from './postCard.module.css';
import { Heart, Share2, MessageCircle, Calendar } from "lucide-react";

const PostCard = ({ title, content, image, date, likes, comments, type }) => {
  return (
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
          <Calendar className={styles.icon} />
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
              <Heart className={styles.icon} />
              {likes}
            </div>
            <div className={`${styles['post-card-stat']} ${styles.comments}`}>
              <MessageCircle className={styles.icon} />
              {comments}
            </div>
          </div>

          <Share2 className={`${styles['post-card-share']} ${styles.icon}`} />
        </div>
      </div>
    </div>
  );
};

export default PostCard;