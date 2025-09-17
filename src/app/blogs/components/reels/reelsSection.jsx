"use client";
import styles from './reelsSection.module.css';
import { useEffect, useState, useRef } from 'react';
import PostCardSkeleton from "../posts/postCardSkeleton.jsx";
import { MdiHeartOutline, MdiShareOutline, MdiCommentOutline, LineMdCalendar, BiPlayFill, CircularText } from '@/utils/components/icons';

const ReelsSection = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReelId, setActiveReelId] = useState(null);
  const videoRefs = useRef({});
  const [playingIds, setPlayingIds] = useState(() => new Set());
  const lastToggleAtRef = useRef(0);
  const [reelsPaging, setReelsPaging] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    async function loadReels() {
      try {
        const res = await fetch('/api/social/facebook?reels_limit=4');
        const data = await res.json();
        setReels(data.reels || []);
        setReelsPaging(data.reels_paging || null);
      } catch (error) {
        console.error("Error loading reels:", error);
        setReels([]);
        setReelsPaging(null);
      } finally {
        setTimeout(() => { 
          setLoading(false);
         }, 1000)
      }
    }
    loadReels();
  }, []);

  const loadMore = async () => {
    if (loadingMore) return;
    const after = reelsPaging?.cursors?.after || null;
    if (!after) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/social/facebook?reels_limit=4&reels_after=${encodeURIComponent(after)}`);
      const data = await res.json();
      setReels(prev => ([...(prev || []), ...((data.reels) || [])]));
      setReelsPaging(data.reels_paging || null);
    } catch (e) {
      // ignore
    } finally {
      setLoadingMore(false);
    }
  };

  const handlePlay = async (id) => {
    // Target video element first
    const targetVideo = videoRefs.current[id];

    // Pause and unload all other videos to stop background downloads
    Object.values(videoRefs.current).forEach(v => {
      if (!v || v === targetVideo) return;
      try { v.pause(); } catch (_) {}
      try { v.removeAttribute('src'); v.load(); } catch (_) {}
    });

    // Play only the clicked video
    if (targetVideo) {
      // Lazy-attach src on first play to avoid any pre-download
      if (!targetVideo.getAttribute('src')) {
        const dataSrc = targetVideo.getAttribute('data-src');
        if (dataSrc) targetVideo.setAttribute('src', dataSrc);
      }
      try {
        await targetVideo.play();
      } catch (err) {
        // Ignore play errors (e.g., autoplay restrictions)
      }
      setActiveReelId(id);
    }
  };

  const handleTogglePlay = async (id, e, source) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Prevent immediate re-toggle when overlay appears right after pausing via video click
    if (source === 'overlay') {
      const now = Date.now();
      if (now - lastToggleAtRef.current < 400) return;
    }

    lastToggleAtRef.current = Date.now();
    const video = videoRefs.current[id];
    if (!video) return;
    if (video.paused) {
      await handlePlay(id);
    } else {
      try {
        video.pause();
      } catch (err) {
        // Ignore pause errors
      }
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
            Array.from({ length: 4 }).map((_, index) => (
              <PostCardSkeleton className={styles['reel-card-skeleton']} key={`skeleton-${index}`} />
            ))
          ) : reels && reels.map((reel) => (
            <div key={reel.id} className={styles['reel-card']}>
              <div className={styles['reel-image-container']}>
                <video
                  ref={(el) => (videoRefs.current[reel.id] = el)}
                  className={styles['reel-image']}
                  data-src={reel.video_url}
                  poster={reel.thumbnail}
                  controls={activeReelId === reel.id} // controls only for active
                  preload="none"
                  playsInline
                  muted
                  onPointerDown={(e) => handleTogglePlay(reel.id, e, 'video')}
                  onPlay={() => {
                    setPlayingIds(prev => {
                      const next = new Set(prev);
                      next.add(reel.id);
                      return next;
                    });
                  }}
                  onPause={() => {
                    setPlayingIds(prev => {
                      const next = new Set(prev);
                      next.delete(reel.id);
                      return next;
                    });
                  }}
                  onEnded={() => {
                    setPlayingIds(prev => {
                      const next = new Set(prev);
                      next.delete(reel.id);
                      return next;
                    });
                  }}
                />

                {/* Play Overlay (visible when not playing) */}
                {!playingIds.has(reel.id) && (
                    <div className={`${styles.container} ${styles.showOverlay}`} onPointerDown={(e) => handleTogglePlay(reel.id, e, 'overlay')}>
                <div className={styles.filter} />
                <button className={styles.playButton} aria-label="voir-video">
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

                {/* Text Overlay */}
                <div className={`${styles['reel-overlay']} ${playingIds.has(reel.id) ? styles['overlayHidden'] : ''}`}>
                  <h3 className={styles['reel-title']}>
                    {reel.message}
                  </h3>
                  <div className={styles['reel-footer']}>
                    <div className={styles['reel-likes']}>
                      <MdiHeartOutline className={styles.icon} />
                      {reel.likes}
                    </div>
                    <MdiShareOutline className={`${styles['reel-share']} ${styles.icon}`} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {reelsPaging?.cursors?.after && (
          <div className={styles.loadMoreWrap}>
            <button className={styles.loadMoreBtn} onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ReelsSection;
