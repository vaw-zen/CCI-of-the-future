import styles from './ReelsSection.module.css';
import { Play, Heart, Share2 } from "lucide-react";

const ReelsSection = () => {
  // Sample data - replace with actual Facebook reels data
  const reels = [
    {
      id: "1",
      title: "Amazing Sunset Timelapse",
      thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop",
      duration: "0:45",
      views: "2.3K",
      likes: 156
    },
    {
      id: "2", 
      title: "Creative Art Process",
      thumbnail: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=600&fit=crop",
      duration: "1:20",
      views: "1.8K",
      likes: 89
    },
    {
      id: "3",
      title: "Food Recipe Quick Tutorial", 
      thumbnail: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=600&fit=crop",
      duration: "0:30",
      views: "3.1K", 
      likes: 245
    },
    {
      id: "4",
      title: "Travel Adventure Highlights",
      thumbnail: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=600&fit=crop",
      duration: "1:15",
      views: "4.2K",
      likes: 312
    }
  ];

  return (
    <section className={styles['reels-section']}>
      <div className={styles['reels-container']}>
        <div className={styles['reels-header']}>
          <h2 className={styles['reels-title']}>
            Featured Reels
          </h2>
          <p className={styles['reels-subtitle']}>
            Quick, engaging videos that capture life's best moments and creative ideas
          </p>
        </div>

        <div className={styles['reels-grid']}>
          {reels.map((reel) => (
            <div key={reel.id} className={styles['reel-card']}>
              <div className={styles['reel-image-container']}>
                <img
                  src={reel.thumbnail}
                  alt={reel.title}
                  className={styles['reel-image']}
                />

                {/* Play Overlay */}
                <div className={styles['reel-play-overlay']}>
                  <button className={styles['reel-play-button']}>
                    <Play className={styles['reel-play-icon']} fill="currentColor" />
                  </button>
                </div>

                {/* Duration Badge */}
                <div className={styles['reel-duration']}>
                  {reel.duration}
                </div>

                {/* Views Badge */}
                <div className={styles['reel-views']}>
                  {reel.views} views
                </div>
              </div>

              <div className={styles['reel-content']}>
                <h3 className={styles['reel-title']}>
                  {reel.title}
                </h3>

                <div className={styles['reel-footer']}>
                  <div className={styles['reel-likes']}>
                    <Heart className={styles.icon} />
                    {reel.likes}
                  </div>
                  <Share2 className={`${styles['reel-share']} ${styles.icon}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReelsSection;