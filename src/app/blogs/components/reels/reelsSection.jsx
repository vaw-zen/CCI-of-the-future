"use client";
import styles from './reelsSection.module.css';
import { Play, Heart, Share2 } from "lucide-react";
import { useEffect, useState, useRef } from 'react';
import PostCardSkeleton from "../posts/postCardSkeleton.jsx";
import { parallax } from '@/libs/vz/mouseInteraction/parallax'
 import { BiPlayFill,CircularText } from '@/utils/components/icons';
const ReelsSection = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReelId, setActiveReelId] = useState(null);
  const videoRefs = useRef({});

  useEffect(() => {
    async function loadReels() {
      try {
        const res = await fetch('/api/social/facebook');
        const data = await res.json();
        setReels(data.reels || []);
      } catch (error) {
        console.error("Error loading reels:", error);
        setReels([]);
      } finally {
        setLoading(false);
      }
    }
    loadReels();
  }, []);

  const handlePlay = (id) => {
    // Pause all other videos
    Object.values(videoRefs.current).forEach(video => {
      if (video && !video.paused) video.pause();
    });

    // Play only the clicked video
    const video = videoRefs.current[id];
    if (video) {
      video.play();
      setActiveReelId(id);
    }
  };

  return (
    <section className={styles['reels-section']}>
      <div className={styles['reels-container']}>
        <div className={styles['reels-header']}>
          <h2 className={styles['reels-title']}>Featured Reels</h2>
          <p className={styles['reels-subtitle']}>
            Quick, engaging videos that capture life's best moments and creative ideas
          </p>
        </div>

        <div className={styles['reels-grid']}>
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <PostCardSkeleton key={`skeleton-${index}`} />
            ))
          ) : reels && reels.map((reel) => (
            <div key={reel.id} className={styles['reel-card']}>
              <div className={styles['reel-image-container']}>
                <video
                  ref={(el) => (videoRefs.current[reel.id] = el)}
                  className={styles['reel-image']}
                  src={reel.video_url}
                  poster={reel.thumbnail}
                  controls={activeReelId === reel.id} // controls only for active
                  playsInline
                  muted
                />

                {/* Play Overlay */}
                {activeReelId !== reel.id && (
                  
                    <div className={styles.container} >
                <div className={styles.filter} />
                <button onMouseMove={parallax} onMouseLeave={parallax} onClick={() => handlePlay(reel.id)} className={styles.playButton} aria-label="voir-video">
                    <div className={styles.textContainer}>
                        <CircularText className={styles.circularText} />
                    </div>
                    <div className={styles.innerButton}>
                        <BiPlayFill className={styles.playIcon} />
                    </div>
                </button>
            </div>
                   
                 
                )}

                {/* Views Badge */}
                <div className={styles['reel-views']}>
                  {reel.views} views
                </div>
              </div>

              <div className={styles['reel-content']}>
                <h3 className={styles['reel-title']}>
                  {reel.message}
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
