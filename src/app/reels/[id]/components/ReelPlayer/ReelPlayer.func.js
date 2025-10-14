import { useState, useRef, useCallback, useEffect } from 'react';
import styles from './ReelPlayer.module.css';

export function useReelPlayerLogic(reel) {
  const videoRef = useRef(null);
  const [videoState, setVideoState] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isFullscreen: false,
    isLoaded: false,
    showControls: false,
  });

  const controlTimeoutRef = useRef(null);

  // Initialize video
  useEffect(() => {
    const video = videoRef.current;
    if (video && reel.video_url) {
      video.src = reel.video_url;
      video.load();
    }
  }, [reel.video_url]);

  // Auto-hide controls after inactivity
  const showControlsTemporarily = useCallback(() => {
    setVideoState(prev => ({ ...prev, showControls: true }));
    
    if (controlTimeoutRef.current) {
      clearTimeout(controlTimeoutRef.current);
    }
    
    controlTimeoutRef.current = setTimeout(() => {
      setVideoState(prev => ({ ...prev, showControls: false }));
    }, 3000);
  }, []);

  // Video event handlers
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setVideoState(prev => ({
        ...prev,
        isLoaded: true,
        duration: video.duration,
        volume: video.volume,
        isMuted: video.muted,
      }));
    }
  };

  const handlePlay = () => {
    setVideoState(prev => ({ ...prev, isPlaying: true }));
    showControlsTemporarily();
  };

  const handlePause = () => {
    setVideoState(prev => ({ ...prev, isPlaying: false, showControls: true }));
    if (controlTimeoutRef.current) {
      clearTimeout(controlTimeoutRef.current);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setVideoState(prev => ({
        ...prev,
        currentTime: video.currentTime,
      }));
    }
  };

  const handleEnded = () => {
    setVideoState(prev => ({
      ...prev,
      isPlaying: false,
      currentTime: 0,
      showControls: true,
    }));
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  // Control handlers
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (video) {
      if (videoState.isPlaying) {
        video.pause();
      } else {
        video.play();
      }
    }
  };

  const handleProgressChange = (event) => {
    const video = videoRef.current;
    if (video && video.duration) {
      const newTime = (event.target.value / 100) * video.duration;
      video.currentTime = newTime;
    }
  };

  const handleVolumeChange = (event) => {
    const video = videoRef.current;
    if (video) {
      const newVolume = event.target.value / 100;
      video.volume = newVolume;
      video.muted = newVolume === 0;
      
      setVideoState(prev => ({
        ...prev,
        volume: newVolume,
        isMuted: newVolume === 0,
      }));
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setVideoState(prev => ({
        ...prev,
        isMuted: video.muted,
      }));
    }
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (video) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        video.requestFullscreen().catch(console.error);
      }
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
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
        await navigator.clipboard.writeText(url);
        alert('Lien copié dans le presse-papiers !');
      } catch (error) {
        // Copy failed silently
      }
    }
  };

  const handleOpenInNewTab = () => {
    window.open(window.location.href, '_blank', 'noopener,noreferrer');
  };

  // Extract title from reel message
  const extractTitle = (message) => {
    if (!message) return 'Reel CCI Services';
    
    // Remove emojis at the beginning and end
    let cleaned = message.replace(/^[🎥✨🧽💧💼✔️🌐]+\s*/g, '').replace(/\s*[🎥✨🧽💧💼✔️🌐]+$/g, '');
    
    // Find the first line that doesn't start with emoji and extract it
    const lines = cleaned.split('\n');
    const titleLine = lines.find(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.match(/^[🎥✨🧽💧💼✔️🌐#@]/);
    });
    
    if (titleLine) {
      // Remove emojis from the title line and get the main part
      let title = titleLine.replace(/[🎥✨🧽💧💼✔️🌐]/g, '').trim();
      
      // If the line contains multiple sentences, take the first meaningful one
      const sentences = title.split(/[.!?]/).filter(s => s.trim().length > 10);
      if (sentences.length > 0) {
        title = sentences[0].trim();
      }
      
      // Limit length for display
      if (title.length > 80) {
        title = title.substring(0, 77) + '...';
      }
      
      return title || 'Reel CCI Services';
    }
    
    return 'Reel CCI Services';
  };

  // Format time display
  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Parse hashtags in text
  const parseHashtags = (text) => {
    if (!text) return text;
    
    const parts = text.split(/(#[\w\u00C0-\u017F\u0100-\u024F]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return <span key={index} className={styles.hashtag}>{part}</span>;
      }
      return part;
    });
  };

  const progressPercent = videoState.duration > 0 ? 
    (videoState.currentTime / videoState.duration) * 100 : 0;
  const volumePercent = videoState.isMuted ? 0 : videoState.volume * 100;

  return {
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
  };
}