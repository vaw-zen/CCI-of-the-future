"use client";
import { useState, useRef, useEffect } from 'react';
import styles from './reelsSection.module.css';
import PostCardSkeleton from "../posts/postCardSkeleton.jsx";
import { MdiHeartOutline, MdiShareOutline, MdiCommentOutline, LineMdCalendar, BiPlayFill, CircularText, MdiPause, LineMdVolumeHighFilled, MdiVolumeMute, MdiFullscreen } from '@/utils/components/icons';
import { useReelsSection } from './reelsSection.func'
import SharedButton from "@/utils/components/SharedButton/SharedButton";
import useAutoHeightTransition from '@/libs/useAutoHeightTransition/useAutoHeightTransition';

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
    handleTogglePlay,
    videoEventHandlers,
  } = useReelsSection();

  // Custom video controls state
  const [videoStates, setVideoStates] = useState({});
  const [showControls, setShowControls] = useState({});
  const controlTimeouts = useRef({});

  const showLoadMore = Boolean(reelsPaging?.next);
  const loadMoreRef = useAutoHeightTransition(showLoadMore, { duration: 250, easing: 'ease' });

  // Function to get the best video URL with audio
  const getBestVideoUrl = (reel) => {
    return reel.video_url;
  };

  // Initialize video state for each reel
  useEffect(() => {
    if (reels?.length) {
      const initialStates = {};
      reels.forEach(reel => {
        initialStates[reel.id] = {
          currentTime: 0,
          duration: 0,
          volume: 1,
          isLoaded: false,
          hasAudio: true // Default to true, will be updated when metadata loads
        };
      });
      setVideoStates(prev => ({ ...prev, ...initialStates }));
    }
  }, [reels]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(controlTimeouts.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  // Custom video control handlers
  const handleVideoLoadedMetadata = (reelId) => {
    const video = videoRefs.current[reelId];
    if (video) {
      // Enhanced audio detection for different video formats
      const audioDetection = {
        // Standard HTML5 audio detection
        hasAudioTracks: video.audioTracks?.length > 0,
        webkitAudioBytes: video.webkitAudioDecodedByteCount > 0,
        mozHasAudio: video.mozHasAudio,
        // Additional checks for DASH/HLS streams
        mediaSource: video.src?.includes('dash') || video.src?.includes('hls'),
        // Check if video has multiple tracks (usually indicates audio)
        videoTracks: video.videoTracks?.length || 0,
        // Format-specific detection
        isDashVideo: video.src?.includes('dash'),
        isSveVideo: video.src?.includes('sve'),
        // Bitrate analysis from URL
        urlBitrate: video.src?.match(/bitrate=(\d+)/)?.[1] || '0',
        hasEffectiveAudio: false
      };
      
      // Determine if audio is effectively available
      const bitrate = parseInt(audioDetection.urlBitrate);
      audioDetection.hasEffectiveAudio = 
        audioDetection.hasAudioTracks || 
        audioDetection.webkitAudioBytes || 
        audioDetection.mozHasAudio ||
        (audioDetection.isDashVideo && video.duration > 0) || // DASH videos usually have audio
        (bitrate > 0) || // Videos with bitrate > 0 should have audio
        (!audioDetection.isSveVideo && video.duration > 0); // Non-SVE videos likely have audio
      
      // For videos with no audio, set muted and volume to 0
      const hasAudio = audioDetection.hasEffectiveAudio;
      if (!hasAudio) {
        video.muted = true;
        video.volume = 0;
      } else {
        video.muted = false;
        video.volume = 1;
      }
      
      setVideoStates(prev => ({
        ...prev,
        [reelId]: {
          ...prev[reelId],
          duration: video.duration,
          volume: hasAudio ? 1 : 0,
          hasAudio: hasAudio,
          isLoaded: true
        }
      }));
      
      // Initialize volume bar styling based on audio availability
      setTimeout(() => {
        const volumeBar = document.querySelector(`[data-reel-id="${reelId}"] .volume-bar`);
        if (volumeBar) {
          const volumePercentage = hasAudio ? 100 : 0;
          volumeBar.style.setProperty('--volume-percentage', `${volumePercentage}%`);
        }
      }, 100);
    }
  };

  const handleTimeUpdate = (reelId) => {
    const video = videoRefs.current[reelId];
    if (video) {
      setVideoStates(prev => ({
        ...prev,
        [reelId]: {
          ...prev[reelId],
          currentTime: video.currentTime
        }
      }));
    }
  };

  const handleProgressChange = (reelId, newTime) => {
    const video = videoRefs.current[reelId];
    if (video) {
      video.currentTime = newTime;
      setVideoStates(prev => ({
        ...prev,
        [reelId]: {
          ...prev[reelId],
          currentTime: newTime
        }
      }));
    }
  };

  const handleVolumeChange = (reelId, newVolume) => {
    const video = videoRefs.current[reelId];
    const hasAudio = videoStates[reelId]?.hasAudio;
    
    if (video && hasAudio) {
      video.volume = newVolume;
      setVideoStates(prev => ({
        ...prev,
        [reelId]: {
          ...prev[reelId],
          volume: newVolume
        }
      }));
      
      // Update CSS custom property for volume bar styling
      const volumeBar = document.querySelector(`[data-reel-id="${reelId}"] .volume-bar`);
      if (volumeBar) {
        volumeBar.style.setProperty('--volume-percentage', `${newVolume * 100}%`);
      }
    }
  };

  const handleFullscreen = (reelId) => {
    const video = videoRefs.current[reelId];
    if (video && !document.fullscreenElement) {
      // Only enter fullscreen, don't track state
      video.requestFullscreen?.() || 
      video.webkitRequestFullscreen?.() || 
      video.mozRequestFullScreen?.() || 
      video.msRequestFullscreen?.();
    }
  };

  const showVideoControls = (reelId) => {
    setShowControls(prev => ({ ...prev, [reelId]: true }));
    
    // Clear existing timeout
    if (controlTimeouts.current[reelId]) {
      clearTimeout(controlTimeouts.current[reelId]);
    }
    
    // Set new timeout to hide controls after 3 seconds
    controlTimeouts.current[reelId] = setTimeout(() => {
      setShowControls(prev => ({ ...prev, [reelId]: false }));
    }, 3000);
  };

  const hideVideoControls = (reelId) => {
    // Clear any existing timeout
    if (controlTimeouts.current[reelId]) {
      clearTimeout(controlTimeouts.current[reelId]);
    }
    setShowControls(prev => ({ ...prev, [reelId]: false }));
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
              {reels && reels.map((reel) => (
                <div key={reel.id} className={styles['reel-card']} data-reel-id={reel.id}>
                  <div className={styles['reel-image-container']}>
                    <video
                      ref={(el) => {
                        if (el) {
                          videoRefs.current[reel.id] = el;
                          // Ensure controls are always disabled
                          el.controls = false;
                          // Disable context menu to prevent right-click controls
                          el.oncontextmenu = (e) => e.preventDefault();
                        }
                      }}
                      className={styles['reel-image']}
                      data-src={getBestVideoUrl(reel)}
                      poster={reel.thumbnail}
                      controls={false}
                      preload="none"
                      playsInline
                      controlsList="nodownload nofullscreen noremoteplayback"
                      onPointerDown={(e) => {
                        const wasPlaying = playingIds.has(reel.id);
                        handleTogglePlay(reel.id, e, 'overlay');
                        // Show controls when play is clicked
                        if (!wasPlaying) {
                          setTimeout(() => showVideoControls(reel.id), 100);
                        }
                      }}
                      onPlay={() => {
                        videoEventHandlers.onPlay(reel.id);
                        // Show controls when video starts playing
                        showVideoControls(reel.id);
                      }}
                      onPause={() => {
                        videoEventHandlers.onPause(reel.id);
                        // Hide controls when video is paused
                        hideVideoControls(reel.id);
                      }}
                      onEnded={() => {
                        videoEventHandlers.onEnded(reel.id);
                        // Hide controls when video ends
                        hideVideoControls(reel.id);
                      }}
                      onLoadedMetadata={() => handleVideoLoadedMetadata(reel.id)}
                      onTimeUpdate={() => handleTimeUpdate(reel.id)}
                      onMouseMove={() => {
                        // Show controls on hover if video is playing
                        if (playingIds.has(reel.id)) {
                          showVideoControls(reel.id);
                        }
                      }}
                      onTouchStart={() => {
                        // Show controls on touch start if video is playing
                        if (playingIds.has(reel.id)) {
                          showVideoControls(reel.id);
                        }
                      }}
                      onTouchMove={() => {
                        // Show controls on touch move if video is playing
                        if (playingIds.has(reel.id)) {
                          showVideoControls(reel.id);
                        }
                      }}
                      onClick={() => {
                        // Show controls on click if video is playing
                        if (playingIds.has(reel.id)) {
                          showVideoControls(reel.id);
                        }
                      }}
                    />

                    {/* Custom Video Controls */}
                    {playingIds.has(reel.id) && videoStates[reel.id]?.isLoaded && showControls[reel.id] && (
                      <div 
                        className={`${styles['custom-controls']} ${styles['controls-visible']}`}
                        onMouseEnter={() => showVideoControls(reel.id)}
                        onTouchStart={() => showVideoControls(reel.id)}
                        onMouseLeave={() => {
                          // Start hide timer when mouse leaves controls
                          if (controlTimeouts.current[reel.id]) {
                            clearTimeout(controlTimeouts.current[reel.id]);
                          }
                          controlTimeouts.current[reel.id] = setTimeout(() => {
                            setShowControls(prev => ({ ...prev, [reel.id]: false }));
                          }, 1000); // Shorter delay when leaving controls
                        }}
                        onTouchEnd={() => {
                          // Start hide timer when touch ends on controls (mobile)
                          if (controlTimeouts.current[reel.id]) {
                            clearTimeout(controlTimeouts.current[reel.id]);
                          }
                          controlTimeouts.current[reel.id] = setTimeout(() => {
                            setShowControls(prev => ({ ...prev, [reel.id]: false }));
                          }, 2000); // Longer delay for mobile to allow for interaction
                        }}
                      >
                        {/* Main Control Bar */}
                        <div className={styles['control-bar']}>
                          {/* Left Controls: Play/Pause and Time */}
                          <div className={styles['control-group-left']}>
                            {/* Play/Pause Button */}
                            <button
                              className={styles['control-button']}
                              onClick={(e) => {
                                e.stopPropagation();
                                const wasPlaying = playingIds.has(reel.id);
                                handleTogglePlay(reel.id, e, 'controls');
                                // If pausing, hide controls
                                if (wasPlaying) {
                                  hideVideoControls(reel.id);
                                } else {
                                  // If playing, show controls
                                  showVideoControls(reel.id);
                                }
                              }}
                              aria-label={playingIds.has(reel.id) ? 'Pause' : 'Play'}
                            >
                              {playingIds.has(reel.id) ? 
                                <MdiPause className={styles['control-icon']} /> : 
                                <BiPlayFill className={styles['control-icon']} />
                              }
                            </button>

                            {/* Time Display */}
                            <div className={styles['time-display']}>
                              <span>{formatTime(videoStates[reel.id]?.currentTime || 0)}</span>
                              <span>/</span>
                              <span>{formatTime(videoStates[reel.id]?.duration || 0)}</span>
                            </div>
                          </div>

                          {/* Right Controls: Volume and Fullscreen */}
                          <div className={styles['control-group-right']}>
                            {/* Volume Control */}
                            <div className={styles['volume-container']}>
                              <button
                                className={styles['control-button']}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const video = videoRefs.current[reel.id];
                                  // Only allow unmuting if video has audio
                                  if (video && videoStates[reel.id]?.hasAudio) {
                                    video.muted = !video.muted;
                                  }
                                }}
                                disabled={!videoStates[reel.id]?.hasAudio}
                                style={{
                                  cursor: videoStates[reel.id]?.hasAudio ? 'pointer' : 'not-allowed',
                                  opacity: videoStates[reel.id]?.hasAudio ? 1 : 0.5
                                }}
                                title={videoStates[reel.id]?.hasAudio ? "Toggle mute" : "This video has no audio"}
                                aria-label="Toggle mute"
                              >
                                {(!videoStates[reel.id]?.hasAudio || videoRefs.current[reel.id]?.muted) ? 
                                  <MdiVolumeMute className={styles['control-icon']} /> : 
                                  <LineMdVolumeHighFilled className={styles['control-icon']} />
                                }
                              </button>
                              <input
                                type="range"
                                className={`${styles['volume-bar']} volume-bar`}
                                min="0"
                                max="1"
                                step="0.1"
                                value={videoStates[reel.id]?.hasAudio ? (videoStates[reel.id]?.volume || 1) : 0}
                                disabled={!videoStates[reel.id]?.hasAudio}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  // Only allow volume changes if video has audio
                                  if (videoStates[reel.id]?.hasAudio) {
                                    handleVolumeChange(reel.id, parseFloat(e.target.value));
                                  }
                                }}
                                style={{ 
                                  '--volume-percentage': `${videoStates[reel.id]?.hasAudio ? 
                                    ((videoStates[reel.id]?.volume || 1) * 100) : 0}%`,
                                  cursor: videoStates[reel.id]?.hasAudio ? 'pointer' : 'not-allowed',
                                  opacity: videoStates[reel.id]?.hasAudio ? 1 : 0.5
                                }}
                                title={videoStates[reel.id]?.hasAudio ? "Adjust volume" : "This video has no audio"}
                                aria-label="Volume"
                              />
                            </div>

                            {/* Fullscreen Button */}
                            <button
                              className={styles['control-button']}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFullscreen(reel.id);
                              }}
                              aria-label="Enter fullscreen"
                            >
                              <MdiFullscreen className={styles['control-icon']} />
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar - Full Width at Bottom */}
                        <div className={styles['progress-container']}>
                          <input
                            type="range"
                            className={styles['progress-bar']}
                            min="0"
                            max={videoStates[reel.id]?.duration || 0}
                            value={videoStates[reel.id]?.currentTime || 0}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleProgressChange(reel.id, parseFloat(e.target.value));
                            }}
                            aria-label="Video progress"
                          />
                        </div>
                      </div>
                    )}

                    {/* Play Overlay */}
                    {!playingIds.has(reel.id) && (
                      <div
                        className={`${styles.container} ${styles.showOverlay}`}
                        onPointerDown={(e) => {
                          handleTogglePlay(reel.id, e, 'overlay');
                          // Show controls after play starts
                          setTimeout(() => showVideoControls(reel.id), 100);
                        }}
                      >
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

                  {/* 🔥 JSON-LD Metadata for SEO */}
                  <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                      __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "VideoObject",
                        name: reel.message || "Reel vidéo",
                        description: reel.message?.slice(0, 150) || "Reel publié sur CCI",
                        thumbnailUrl: reel.thumbnail,
                        uploadDate: reel.created_time,
                        contentUrl: reel.video_url,
                        interactionStatistic: {
                          "@type": "InteractionCounter",
                          interactionType: "https://schema.org/WatchAction",
                          userInteractionCount: reel.views,
                        },
                      }),
                    }}
                  />
                </div>
              ))}
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
