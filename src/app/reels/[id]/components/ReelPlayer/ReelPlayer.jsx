'use client';

import Link from 'next/link';
import { MdiHeartOutline, MdiShareOutline, MdiPause, MdiVolumeMute, MdiFullscreen, MdiArrowLeft, LineMdVolumeHighFilled, BiPlayFill, CircularText, CuidaOpenInNewTabOutline } from '@/utils/components/icons';
import SharedButton from "@/utils/components/SharedButton/SharedButton";
import styles from './ReelPlayer.module.css';
import ServiceDetails from '@/utils/components/servicesComponents/serviceDetails/serviceDetails';
import { useReelPlayerLogic } from './ReelPlayer.func';

const ReelPlayer = ({ reel }) => {
  const {
    videoRef,
    videoState,
    progressPercent,
    volumePercent,
    showControlsTemporarily,
    handleLoadedMetadata,
    handlePlay,
    handlePause,
    handleTimeUpdate,
    handleEnded,
    togglePlayPause,
    handleProgressChange,
    handleVolumeChange,
    toggleMute,
    toggleFullscreen,
    handleShare,
    handleOpenInNewTab,
    extractTitle,
    formatTime,
    parseHashtags
  } = useReelPlayerLogic(reel);

  // Hybrid thumbnail approach: Facebook CDN for performance, local for SEO fallback
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
  const localThumbnailUrl = `${baseUrl}/api/thumbnails/${reel.id}`;
  const userFacingThumbnailUrl = reel.thumbnail || reel.original_thumbnail || localThumbnailUrl;

  return (
         <>
          <ServiceDetails title={extractTitle(reel.message)} text={""} />
    <div className={styles.reelPlayer}>
      <div className={styles.header}>
        <Link href="/blogs" className={styles.backButton}>
          <MdiArrowLeft />
          Retour aux reels
        </Link>
        <div className={styles.reelInfo}>
          <h1 className={styles.reelTitle}>{extractTitle(reel.message)}</h1>
          <div className={styles.reelMeta}>
            <span>Publié le {new Date(reel.created_time).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
      </div>
     

      <div 
        className={styles.videoContainer}
        onMouseMove={showControlsTemporarily}
        onMouseEnter={showControlsTemporarily}
      >
        <video
          ref={videoRef}
          className={styles.video}
          poster={userFacingThumbnailUrl}
          preload="metadata"
          playsInline
          itemProp="contentUrl"
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={handlePlay}
          onPause={handlePause}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onClick={togglePlayPause}
        />

        {/* Play overlay when paused */}
        {!videoState.isPlaying && (
          <div className={`${styles.container} ${styles.showOverlay}`}>
            <div className={styles.filter} />
            <button 
              className={styles.playButton} 
              aria-label="Play video"
              onClick={togglePlayPause}
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

        {/* Custom controls */}
        {videoState.isLoaded && videoState.isPlaying && (
          <div className={`${styles['custom-controls']} ${videoState.showControls ? styles['controls-visible'] : ''}`}>
            {/* Progress Bar */}
            <div className={styles['progress-container']}>
              <input
                type="range"
                min="0"
                max="100"
                value={progressPercent}
                className={styles['progress-bar']}
                onChange={handleProgressChange}
                aria-label="Video progress"
              />
            </div>

            {/* Control Bar */}
            <div className={styles['control-bar']}>
              <div className={styles['control-group-left']}>
                {/* Play/Pause Button */}
                <button
                  className={styles['control-button']}
                  onClick={togglePlayPause}
                  aria-label={videoState.isPlaying ? 'Pause' : 'Play'}
                >
                  {videoState.isPlaying ? (
                    <MdiPause className={styles['control-icon']} />
                  ) : (
                    <BiPlayFill className={styles['control-icon']} />
                  )}
                </button>

                {/* Time Display */}
                <div className={styles['time-display']}>
                  {formatTime(videoState.currentTime)} / {formatTime(videoState.duration)}
                </div>
              </div>

              <div className={styles['control-group-right']}>
                {/* Volume Controls */}
                <div className={styles['volume-container']}>
                  <button
                    className={styles['control-button']}
                    onClick={toggleMute}
                    aria-label={videoState.isMuted ? 'Unmute' : 'Mute'}
                  >
                    {videoState.isMuted ? (
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
                    onChange={handleVolumeChange}
                    aria-label="Volume"
                  />
                </div>

                {/* Fullscreen Button */}
                <button
                  className={styles['control-button']}
                  onClick={toggleFullscreen}
                  aria-label="Fullscreen"
                >
                  <MdiFullscreen className={styles['control-icon']} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <div className={styles.engagementStats}>
          <div className={styles.stat}>
            <MdiHeartOutline />
            {reel.likes || 0}
          </div>
        </div>
        
        <div className={styles.actionButtons}>
          <SharedButton className={styles.shareButton} onClick={handleShare}>
            <MdiShareOutline   />
          </SharedButton>
        </div>
      </div>

      {reel.message && (
        <div className={styles.description}>
          <h2>Description :</h2>
          <p>{parseHashtags(reel.message)}</p>
        </div>
      )}
    </div></>
  );
};

export default ReelPlayer;