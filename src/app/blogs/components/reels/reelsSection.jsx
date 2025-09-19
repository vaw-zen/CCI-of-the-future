"use client";
import styles from './reelsSection.module.css';
import PostCardSkeleton from "../posts/postCardSkeleton.jsx";
import { MdiHeartOutline, MdiShareOutline, MdiCommentOutline, LineMdCalendar, BiPlayFill, CircularText } from '@/utils/components/icons';
import { useReelsSection } from './reelsSection.func'
import SharedButton from "@/utils/components/SharedButton/SharedButton";

const ReelsSection = () => {
  const {
    reels,
    loading,
    activeReelId,
    videoRefs,
    playingIds,
    reelsPaging,
    loadingMore,
    initialSkeletonCount,
    loadingMoreSkeletonCount,
    loadMore,
    handlePlay,
    handleTogglePlay,
    videoEventHandlers,
  } = useReelsSection()

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
            Array.from({ length: initialSkeletonCount }).map((_, index) => (
              <PostCardSkeleton className={styles['reel-card-skeleton']} key={`skeleton-${index}`} />
            ))
          ) : (
            <>
              {reels && reels.map((reel) => (
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
                      onPlay={() => videoEventHandlers.onPlay(reel.id)}
                      onPause={() => videoEventHandlers.onPause(reel.id)}
                      onEnded={() => videoEventHandlers.onEnded(reel.id)}
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
              {loadingMore && Array.from({ length: loadingMoreSkeletonCount }).map((_, index) => (
                <PostCardSkeleton className={styles['reel-card-skeleton']} key={`more-skeleton-${index}`} />
              ))}
            </>
          )}
        </div>
        {reelsPaging?.next && (
          <div className={styles.loadMoreWrap}>
            <SharedButton
              className={styles.loadMoreBtn}
              onClick={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? 'Loading…' : 'Load more'}
            </SharedButton>
          </div>
        )}
      </div>
    </section>
  );
};

export default ReelsSection;
