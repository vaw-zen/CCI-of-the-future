"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from './reelsSection.module.css';
import PostCardSkeleton from "../posts/postCardSkeleton.jsx";
import { MdiHeartOutline, MdiShareOutline, MdiCommentOutline, LineMdCalendar, BiPlayFill, CircularText, MdiPause, LineMdVolumeHighFilled, MdiVolumeMute, MdiFullscreen, CuidaOpenInNewTabOutline } from '@/utils/components/icons';
import { useReelsSection } from './reelsSection.func'
import SharedButton from "@/utils/components/SharedButton/SharedButton";
import useAutoHeightTransition from '@/libs/useAutoHeightTransition/useAutoHeightTransition';
import { getVideoPlaceholderDataUrl } from '@/utils/videoPlaceholder';

const ReelsSection = ({ initialReels = null, initialReelsPaging = null }) => {
  const {
    reels,
    loading,
    reelsPaging,
    loadingMore,
    initialSkeletonCount,
    loadingMoreSkeletonCount,
    loadMore,
  } = useReelsSection(initialReels, initialReelsPaging);

  // Enhanced video state management
  const videoRefs = useRef({});
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [showControls, setShowControls] = useState({});
  const [videoStates, setVideoStates] = useState({});
  const [isHovering, setIsHovering] = useState({});
  const controlTimeoutRefs = useRef({});

  // Helper function to reset video to idle state
  const resetVideoState = useCallback((videoId) => {
    const video = videoRefs.current[videoId];
    if (video) {
      video.pause();
      video.currentTime = 0;
      video.removeAttribute('src');
      video.load();
      // Reset controls attribute to false for normal viewing
      video.controls = false;
    }
    
    setVideoStates(prev => ({
      ...prev,
      [videoId]: {
        ...prev[videoId],
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
        isMuted: false,
        isFullscreen: false,
        isLoaded: false
      }
    }));
    
    setShowControls(prev => ({ ...prev, [videoId]: false }));
    
    if (controlTimeoutRefs.current[videoId]) {
      clearTimeout(controlTimeoutRefs.current[videoId]);
      delete controlTimeoutRefs.current[videoId];
    }
  }, []);

  // Helper function to set active video (ensures single playback)
  const setActiveVideo = useCallback(async (videoId) => {
    // Reset all other videos
    Object.keys(videoRefs.current).forEach(id => {
      if (id !== videoId) {
        resetVideoState(id);
      }
    });
    
    setActiveVideoId(videoId);
    
    const video = videoRefs.current[videoId];
    if (video) {
      // Set video source if not already set
      if (!video.getAttribute('src')) {
        const dataSrc = video.getAttribute('data-src');
        if (dataSrc) {
          video.setAttribute('src', dataSrc);
        }
      }
      
      try {
        await video.play();
      } catch (error) {
        console.warn('Video play failed:', error);
      }
    }
  }, [resetVideoState]);

  // Helper function to show controls for active video
  const showControlsForVideo = useCallback((videoId) => {
    if (videoId !== activeVideoId) return;
    
    setShowControls(prev => ({ ...prev, [videoId]: true }));
    
    // Clear existing timeout
    if (controlTimeoutRefs.current[videoId]) {
      clearTimeout(controlTimeoutRefs.current[videoId]);
    }
    
    // Hide controls after 3 seconds of inactivity
    controlTimeoutRefs.current[videoId] = setTimeout(() => {
      if (!isHovering[videoId]) {
        setShowControls(prev => ({ ...prev, [videoId]: false }));
      }
    }, 3000);
  }, [activeVideoId, isHovering]);

  // Handle overlay play button click
  const handleOverlayClick = useCallback((reelId, event) => {
    // Check if the click is on a link or inside a link
    const target = event?.target;
    const isLinkClick = target?.closest('a') || target?.tagName === 'A';
    
    // If clicking on a link, don't interfere - let the navigation happen
    if (isLinkClick) {
      return;
    }
    
    event?.preventDefault();
    event?.stopPropagation();
    
    if (activeVideoId === reelId) {
      // Pause active video and reset
      resetVideoState(reelId);
      setActiveVideoId(null);
    } else {
      // Start new video
      setActiveVideo(reelId);
    }
  }, [activeVideoId, resetVideoState, setActiveVideo]);

  // Prevent direct video clicks from playing/pausing
  const handleVideoClick = useCallback((event) => {
    // Check if the click is on a link or inside a link element
    const isLinkClick = event.target.closest('a') || event.target.tagName === 'A';
    
    if (!isLinkClick) {
      event.preventDefault();
      event.stopPropagation();
      // Do nothing - video should only be controlled by overlay/custom controls
    }
    // If it's a link click, allow it to proceed naturally
  }, []);

  // Custom control handlers
  const handleCustomPlayPause = useCallback((reelId, event) => {
    event?.preventDefault();
    event?.stopPropagation();
    
    if (activeVideoId === reelId) {
      const video = videoRefs.current[reelId];
      const isPlaying = videoStates[reelId]?.isPlaying;
      
      if (isPlaying) {
        video?.pause();
      } else {
        video?.play();
      }
    }
  }, [activeVideoId, videoStates]);

  const handleProgressChange = useCallback((reelId, event) => {
    if (activeVideoId !== reelId) return;
    
    const video = videoRefs.current[reelId];
    if (video && video.duration) {
      const newTime = (event.target.value / 100) * video.duration;
      video.currentTime = newTime;
    }
  }, [activeVideoId]);

  const handleVolumeChange = useCallback((reelId, event) => {
    if (activeVideoId !== reelId) return;
    
    const video = videoRefs.current[reelId];
    if (video) {
      const newVolume = event.target.value / 100;
      video.volume = newVolume;
      video.muted = newVolume === 0;
      
      setVideoStates(prev => ({
        ...prev,
        [reelId]: {
          ...prev[reelId],
          volume: newVolume,
          isMuted: newVolume === 0
        }
      }));
    }
  }, [activeVideoId]);

  const handleMuteToggle = useCallback((reelId, event) => {
    event?.preventDefault();
    event?.stopPropagation();
    
    if (activeVideoId !== reelId) return;
    
    const video = videoRefs.current[reelId];
    if (video) {
      video.muted = !video.muted;
      
      setVideoStates(prev => ({
        ...prev,
        [reelId]: {
          ...prev[reelId],
          isMuted: video.muted
        }
      }));
    }
  }, [activeVideoId]);

  const handleFullscreenToggle = useCallback((reelId, event) => {
    event?.preventDefault();
    event?.stopPropagation();
    
    if (activeVideoId !== reelId) return;
    
    const video = videoRefs.current[reelId];
    if (video) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        // Hide custom controls before entering fullscreen
        setShowControls(prev => ({ ...prev, [reelId]: false }));
        video.requestFullscreen?.() || video.webkitRequestFullscreen?.();
      }
    }
  }, [activeVideoId]);

  // Mouse/touch event handlers for hover behavior
  const handleMouseEnter = useCallback((reelId) => {
    setIsHovering(prev => ({ ...prev, [reelId]: true }));
    
    if (activeVideoId === reelId && videoStates[reelId]?.isPlaying) {
      showControlsForVideo(reelId);
    }
  }, [activeVideoId, videoStates, showControlsForVideo]);

  const handleMouseLeave = useCallback((reelId) => {
    setIsHovering(prev => ({ ...prev, [reelId]: false }));
    
    // Hide controls after a delay when not hovering
    if (controlTimeoutRefs.current[reelId]) {
      clearTimeout(controlTimeoutRefs.current[reelId]);
    }
    
    controlTimeoutRefs.current[reelId] = setTimeout(() => {
      setShowControls(prev => ({ ...prev, [reelId]: false }));
    }, 1000);
  }, []);

  const handleMouseMove = useCallback((reelId) => {
    if (activeVideoId === reelId && videoStates[reelId]?.isPlaying) {
      showControlsForVideo(reelId);
    }
  }, [activeVideoId, videoStates, showControlsForVideo]);

  // Video event handlers
  const handleVideoLoadedMetadata = useCallback((reelId) => {
    const video = videoRefs.current[reelId];
    if (video) {
      setVideoStates(prev => ({
        ...prev,
        [reelId]: {
          ...prev[reelId],
          isLoaded: true,
          duration: video.duration,
          volume: video.volume,
          isMuted: video.muted
        }
      }));
    }
  }, []);

  const handleVideoPlay = useCallback((reelId) => {
    setVideoStates(prev => ({
      ...prev,
      [reelId]: {
        ...prev[reelId],
        isPlaying: true
      }
    }));
    
    showControlsForVideo(reelId);
  }, [showControlsForVideo]);

  const handleVideoPause = useCallback((reelId) => {
    setVideoStates(prev => ({
      ...prev,
      [reelId]: {
        ...prev[reelId],
        isPlaying: false
      }
    }));
  }, []);

  const handleVideoEnded = useCallback((reelId) => {
    resetVideoState(reelId);
    setActiveVideoId(null);
  }, [resetVideoState]);

  const handleVideoTimeUpdate = useCallback((reelId) => {
    const video = videoRefs.current[reelId];
    if (video && activeVideoId === reelId) {
      setVideoStates(prev => ({
        ...prev,
        [reelId]: {
          ...prev[reelId],
          currentTime: video.currentTime
        }
      }));
    }
  }, [activeVideoId]);

  // Handle fullscreen change events
  const handleFullscreenChange = useCallback(() => {
    // Check different browser APIs for fullscreen element
    const isFullscreen = Boolean(
      document.fullscreenElement || 
      document.webkitFullscreenElement || 
      document.mozFullScreenElement || 
      document.msFullscreenElement
    );
    
    const fullscreenElement = 
      document.fullscreenElement || 
      document.webkitFullscreenElement || 
      document.mozFullScreenElement || 
      document.msFullscreenElement;
    
    // Find the video that's currently in fullscreen (if any)
    Object.keys(videoRefs.current).forEach(videoId => {
      const video = videoRefs.current[videoId];
      if (video) {
        if (isFullscreen && fullscreenElement === video) {
          // Enable browser controls when entering fullscreen
          video.controls = true;
          setVideoStates(prev => ({
            ...prev,
            [videoId]: {
              ...prev[videoId],
              isFullscreen: true
            }
          }));
        } else if (!isFullscreen) {
          // Disable browser controls when exiting fullscreen
          video.controls = false;
          setVideoStates(prev => ({
            ...prev,
            [videoId]: {
              ...prev[videoId],
              isFullscreen: false
            }
          }));
        }
      }
    });
  }, []);

  // Function to get the best video URL with audio
  const getBestVideoUrl = (reel) => {
    return reel.video_url;
  };

  // Handle share functionality
  const handleShare = useCallback(async (reel, event) => {
    event?.preventDefault();
    event?.stopPropagation();
    
    const url = `${window.location.origin}/reels/${reel.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: reel.message || 'Reel CCI Services',
          text: 'Découvrez ce reel CCI Services',
          url: url,
        });
      } catch (error) {
        // Share cancelled or failed silently
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Lien copié dans le presse-papiers !');
      } catch (error) {
        // Copy failed silently
      }
    }
  }, []);

  const showLoadMore = Boolean(reelsPaging?.next);
  const loadMoreRef = useAutoHeightTransition(showLoadMore, { duration: 250, easing: 'ease' });

  // Initialize video states for each reel
  useEffect(() => {
    if (reels?.length) {
      const initialStates = {};
      reels.forEach(reel => {
        initialStates[reel.id] = {
          isLoaded: false,
          isPlaying: false,
          currentTime: 0,
          duration: 0,
          volume: 1,
          isMuted: false,
          isFullscreen: false
        };
      });
      setVideoStates(prev => ({ ...prev, ...initialStates }));
    }
  }, [reels]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    // Add fullscreen change event listeners for different browsers
    const fullscreenEvents = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange'
    ];
    
    fullscreenEvents.forEach(event => {
      document.addEventListener(event, handleFullscreenChange);
    });
    
    return () => {
      Object.values(controlTimeoutRefs.current).forEach(timeout => {
        clearTimeout(timeout);
      });
      // Remove fullscreen change event listeners
      fullscreenEvents.forEach(event => {
        document.removeEventListener(event, handleFullscreenChange);
      });
    };
  }, [handleFullscreenChange]);

  // Format time for display
  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
            Array.from({ length: initialSkeletonCount }).map((_, index) => (
              <PostCardSkeleton className={styles['reel-card-skeleton']} key={`skeleton-${index}`} />
            ))
          ) : (
            <>
              {reels && reels.map((reel) => {
                const isActive = activeVideoId === reel.id;
                const isPlaying = videoStates[reel.id]?.isPlaying || false;
                const currentTime = videoStates[reel.id]?.currentTime || 0;
                const duration = videoStates[reel.id]?.duration || 0;
                const volume = videoStates[reel.id]?.volume || 1;
                const isMuted = videoStates[reel.id]?.isMuted || false;
                const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
                const volumePercent = isMuted ? 0 : volume * 100;

                return (
                  <div 
                    key={reel.id} 
                    className={styles['reel-card']} 
                    data-reel-id={reel.id}
                    onMouseEnter={() => handleMouseEnter(reel.id)}
                    onMouseLeave={() => handleMouseLeave(reel.id)}
                    onMouseMove={() => handleMouseMove(reel.id)}
                  >
                    <div 
                      className={styles['reel-image-container']}
                      onClick={(e) => handleOverlayClick(reel.id, e)}
                    >
                      <video
                        ref={(el) => {
                          if (el) {
                            videoRefs.current[reel.id] = el;
                          }
                        }}
                        className={styles['reel-image']}
                        data-src={getBestVideoUrl(reel)}
                        poster={reel.thumbnail || getVideoPlaceholderDataUrl()}
                        controls={false}
                        preload="none"
                        playsInline
                        onPlay={() => handleVideoPlay(reel.id)}
                        onPause={() => handleVideoPause(reel.id)}
                        onEnded={() => handleVideoEnded(reel.id)}
                        onLoadedMetadata={() => handleVideoLoadedMetadata(reel.id)}
                        onTimeUpdate={() => handleVideoTimeUpdate(reel.id)}
                      />

                      {/* Play Overlay - Only show when not playing */}
                      {!isPlaying && (
                        <div className={`${styles.container} ${styles.showOverlay}`}>
                          <div className={styles.filter} />
                          <button 
                            className={styles.playButton} 
                            aria-label="Play video"
                            onClick={(e) => handleOverlayClick(reel.id, e)}
                          >
                            <div className={styles.textContainer}>
                              <CircularText className={styles.circularText} />
                            </div>
                            <div className={styles.innerButton}>
                              <BiPlayFill className={styles.playIcon} />
                            </div>
                          </button>
                        </div>
                      )}

                      {/* Pause Overlay - Show when playing and controls are visible */}
                      {isActive && isPlaying && showControls[reel.id] && (
                        <div
                          className={`${styles.container} ${styles.showOverlay}`}
                          style={{ background: 'transparent' }}
                        >
                          <div className={styles.filter} />
                          <button 
                            className={styles.playButton} 
                            aria-label="Pause video"
                            onClick={(e) => handleOverlayClick(reel.id, e)}
                          >
                            <div className={styles.textContainer}>
                              <CircularText className={styles.circularText} />
                            </div>
                            <div className={styles.innerButton}>
                              <MdiPause className={styles.playIcon} />
                            </div>
                          </button>
                        </div>
                      )}

                      {/* Custom Controls - Only show for active video on hover/interaction and not in fullscreen */}
                      {isActive && isPlaying && !videoStates[reel.id]?.isFullscreen && (
                        <div className={`${styles['custom-controls']} ${showControls[reel.id] ? styles['controls-visible'] : ''}`}>
                          {/* Progress Bar */}
                          <div className={styles['progress-container']}>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={progressPercent}
                              className={styles['progress-bar']}
                              onChange={(e) => handleProgressChange(reel.id, e)}
                              aria-label="Video progress"
                            />
                          </div>

                          {/* Control Bar */}
                          <div className={styles['control-bar']}>
                            <div className={styles['control-group-left']}>
                              {/* Play/Pause Button */}
                              <button
                                className={styles['control-button']}
                                onClick={(e) => handleCustomPlayPause(reel.id, e)}
                                aria-label={isPlaying ? 'Pause' : 'Play'}
                              >
                                {isPlaying ? (
                                  <MdiPause className={styles['control-icon']} />
                                ) : (
                                  <BiPlayFill className={styles['control-icon']} />
                                )}
                              </button>

                              {/* Time Display */}
                              <div className={styles['time-display']}>
                                {formatTime(currentTime)} / {formatTime(duration)}
                              </div>
                            </div>

                            <div className={styles['control-group-right']}>
                              {/* Volume Controls */}
                              <div className={styles['volume-container']}>
                                <button
                                  className={styles['control-button']}
                                  onClick={(e) => handleMuteToggle(reel.id, e)}
                                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                                >
                                  {isMuted ? (
                                    <MdiVolumeMute className={styles['control-icon']} />
                                  ) : (
                                    <LineMdVolumeHighFilled className={styles['control-icon']} />
                                  )}
                                </button>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={volumePercent}
                                  className={styles['volume-bar']}
                                  style={{ '--volume-percentage': `${volumePercent}%` }}
                                  onChange={(e) => handleVolumeChange(reel.id, e)}
                                  aria-label="Volume"
                                />
                              </div>

                              {/* Fullscreen Button */}
                              <button
                                className={styles['control-button']}
                                onClick={(e) => handleFullscreenToggle(reel.id, e)}
                                aria-label="Fullscreen"
                              >
                                <MdiFullscreen className={styles['control-icon']} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Views Badge */}
                      <div className={styles['reel-views']}>
                        {reel.views} views
                      </div>

                      {/* Text Overlay - Hide when playing */}
                      <div className={`${styles['reel-overlay']} ${isPlaying ? styles['overlayHidden'] : ''}`}>
                        <h3 className={styles['reel-title']}>
                          <Link href={`/reels/${reel.id}`} className={styles['reel-title-link']}>
                            {reel.message}
                          </Link>
                        </h3>
                        <div className={styles['reel-footer']}>
                          <div className={styles['reel-likes']}>
                            <MdiHeartOutline className={styles.icon} />
                            {reel.likes}
                          </div>
                          <div className={styles['reel-actions']}>
                            <button 
                              className={`${styles['reel-share']} ${styles.icon}`}
                              onClick={(e) => handleShare(reel, e)}
                              aria-label="Share reel"
                            >
                              <MdiShareOutline />
                            </button>
                            <Link 
                              href={`/reels/${reel.id}`} 
                              className={`${styles['reel-open']} ${styles.icon}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Open reel in new tab"
                            >
                              <CuidaOpenInNewTabOutline />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 🔥 JSON-LD Metadata for SEO */}
                    <script
                      type="application/ld+json"
                      dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                          "@context": "https://schema.org",
                          "@type": "VideoObject",
                          name: reel.message || "Reel vidéo CCI Services",
                          description: reel.message && reel.message.trim() ? 
                            reel.message.slice(0, 150) : 
                            "Découvrez nos services de nettoyage professionnel en vidéo. CCI Services, experts en nettoyage de tapis, marbre et entretien automobile à Tunis.",
                          thumbnailUrl: reel.thumbnail || getVideoPlaceholderDataUrl(),
                          uploadDate: reel.created_time || new Date().toISOString(),
                          contentUrl: reel.video_url || reel.permalink_url || `https://www.facebook.com/watch/?v=${reel.id}`,
                          embedUrl: reel.permalink_url || reel.video_url || `https://www.facebook.com/watch/?v=${reel.id}`,
                          interactionStatistic: {
                            "@type": "InteractionCounter",
                            interactionType: "https://schema.org/WatchAction",
                            userInteractionCount: reel.views,
                          },
                        }),
                      }}
                    />
                  </div>
                );
              })}
              {loadingMore &&
                Array.from({ length: loadingMoreSkeletonCount }).map((_, index) => (
                  <PostCardSkeleton className={styles['reel-card-skeleton']} key={`more-skeleton-${index}`} />
                ))}
            </>
          )}
        </div>

        <div
          ref={loadMoreRef}
          className={`${styles.loadMoreWrap} ${!showLoadMore ? styles.loadMoreHidden : ''}`}
        >
          <SharedButton
            className={styles.loadMoreBtn}
            onClick={loadMore}
            disabled={loadingMore || !showLoadMore}
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </SharedButton>
        </div>
      </div>
    </section>
  );
};

export default ReelsSection;
