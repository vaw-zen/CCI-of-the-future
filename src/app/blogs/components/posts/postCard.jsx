import styles from './postCard.module.css';
import { MdiHeartOutline,MdiShareOutline,MdiCommentOutline,LineMdCalendar } from '@/utils/components/icons';
import { formatDate, isWithin } from '@/libs/dateHelper/dateHelper';
import ResponsiveImage from '@/utils/components/Image/Image';
const PostCard = ({ title, content, image, date, likes, comments, permalink_url, type }) => {
  const displayedDate = date
    ? (isWithin(date, { value: 1, unit: 'weeks' })
        ? formatDate(date, false, true)
        : formatDate(date, true, true, { year: true }))
    : '';

  // Normalize image prop: API passes an array of URLs as attachments
  const imageSrc = Array.isArray(image) ? (image.find(Boolean) || null) : (image || null);

  return (
    <a
      href={permalink_url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles['post-card-link']}
    >
      <div className={styles['post-card']}>
        {imageSrc && (
          <div className={styles['post-card-image-container']}>
            <ResponsiveImage
              src={imageSrc}
              alt={title}
              title={title}
              className={styles['post-card-image']}
              sizes={[21, 52, 97]}
              skeleton
              contain
            />
            <div className={`${styles['post-card-badge']} ${styles[type] ? styles[type] : type}`}>
              {/* hédhi badlélha logique mte3ha bch twarri indication soit instagram or facebook, currently 7atit'ha hard coded facebook */}
              {/* {type === "reel" ? "🎥 Reel" : "Post"} */}
              Facebook
            </div>
          </div>
        )}
        
        <div className={styles['post-card-content']}>
          <div className={styles['post-card-date']}>
            <LineMdCalendar className={styles.icon} />
            {displayedDate}
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
