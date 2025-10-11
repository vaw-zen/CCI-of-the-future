"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
// use local icon components so we can keep SVGs in one place
import { RadixIconsCaretRight } from '../icons';
import styles from './imageSlider.module.css';
import ResponsiveImage from '@/utils/components/Image/Image';

const defaultImages = [
  {
    src: "/home/marblepolishing.webp",
    title: 'Modern Workspace',
    description: 'Clean, minimalist design that enhances productivity and creativity'
  },
  {
    src: "/home/marblepolishing.webp",
    title: 'Elegant Architecture',
    description: 'Contemporary spaces that blend form and function seamlessly'
  },
  {
    src: "/home/marblepolishing.webp",
    title: 'Digital Innovation',
    description: 'Abstract concepts brought to life through cutting-edge design'
  },
  {
    src: "/home/marblepolishing.webp",
    title: 'Future Vision',
    description: 'Technology and aesthetics united in perfect harmony'
  }
];

export const ImageSlider = ({
  images: propImages,
  autoPlay = true,
  interval = 5000,
  showThumbnails = true,
  showDots = true,
  startIndex = 0,
}) => {
  const images = propImages ?? defaultImages;
  const [currentIndex, setCurrentIndex] = useState(startIndex || 0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(startIndex || 0);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(id);
  }, [isAutoPlaying, interval, images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const openLightbox = useCallback((index) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
    setIsAutoPlaying(false);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  const goToPreviousLightbox = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToNextLightbox = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!isLightboxOpen) {
      document.body.style.removeProperty('overflow');
      return;
    }

    document.body.style.setProperty('overflow', 'hidden');

    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        closeLightbox();
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPreviousLightbox();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNextLightbox();
      }
    };

    const preventScroll = (event) => {
      if (event.touches && event.touches.length > 1) {
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      document.body.style.removeProperty('overflow');
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('touchmove', preventScroll);
    };
  }, [isLightboxOpen, closeLightbox, goToNextLightbox, goToPreviousLightbox]);

  // Swipe / touch handling for mobile and tablets
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const shouldOpenLightboxRef = useRef(true);

  const handlePointerStart = (clientX) => {
    startXRef.current = clientX;
    currentXRef.current = clientX;
    isDraggingRef.current = true;
    shouldOpenLightboxRef.current = true;
    setIsAutoPlaying(false);
  };

  const handlePointerMove = (clientX) => {
    if (!isDraggingRef.current) return;
    currentXRef.current = clientX;
    if (Math.abs(clientX - startXRef.current) > 10) {
      shouldOpenLightboxRef.current = false;
    }
  };

  const handlePointerEnd = () => {
    if (!isDraggingRef.current) return;
    const delta = currentXRef.current - startXRef.current;
    const threshold = 50; // px
    if (delta > threshold) {
      goToPrevious();
    } else if (delta < -threshold) {
      goToNext();
    } else if (shouldOpenLightboxRef.current) {
      openLightbox(currentIndex);
    }
    isDraggingRef.current = false;
    startXRef.current = 0;
    currentXRef.current = 0;
  };

  const onTouchStart = (e) => handlePointerStart(e.touches[0].clientX);
  const onTouchMove = (e) => handlePointerMove(e.touches[0].clientX);
  const onTouchEnd = () => handlePointerEnd();

  const onPointerDown = (e) => handlePointerStart(e.clientX);
  const onPointerMoveEvt = (e) => handlePointerMove(e.clientX);
  const onPointerUp = () => handlePointerEnd();

  return (
    <section className={styles.showcase}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            Visual Excellence
          </h2>
          <p className={styles.subtitle}>
            Discover our curated collection of stunning visuals that represent the perfect blend of creativity and innovation
          </p>
        </div>

        <div className={styles.carouselWrapper}>
          {/* Main Image Container */}
          <div
            className={styles.imageContainer}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMoveEvt}
            onPointerUp={onPointerUp}
            role="region"
            aria-label="Image carousel"
          >
            <div
              className={styles.imageSlider}
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {images.map((image, index) => (
                <div key={index} className={styles.slide}>
                  <ResponsiveImage
                    src={image.src}
                    alt={image.title}
                    className={styles.slideImage}
                    sizes={[100]}
                    priority={index === 0}
                    skeleton
                    contain
                    onClick={() => openLightbox(index)}
                  />
                  <div className={styles.slideOverlay} />
                  <div className={styles.slideContent}>
                    <h3 className={styles.slideTitle}>{image.title}</h3>
                    <p className={styles.slideDescription}>{image.description}</p>
                  </div>
                </div>
              ))}

            </div>

            {/* Navigation Arrows */}
            <button
              className={`${styles.navButton} ${styles.navButtonLeft}`}
              onClick={goToPrevious}
              aria-label="Previous slide"
            >
              {/* Left arrow from local icons (rotated) */}
              <RadixIconsCaretRight
                className={styles.iconPlaceholder}
                aria-hidden
                style={{ transform: 'rotate(180deg)' }}
              />
            </button>

            <button
              className={`${styles.navButton} ${styles.navButtonRight}`}
              onClick={goToNext}
              aria-label="Next slide"
            >
              {/* Right arrow from local icons */}
              <RadixIconsCaretRight className={styles.iconPlaceholder} aria-hidden />
            </button>
          </div>

          {/* Dots Indicator */}
          {showDots && (
            <div className={styles.dots}>
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''
                    }`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Thumbnail Navigation */}
          {showThumbnails && (
            <div className={styles.thumbnails}>
              {images.map((image, index) => (
                <button
                  key={index}
                  className={`${styles.thumbnail} ${index === currentIndex ? styles.thumbnailActive : ''
                    }`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <ResponsiveImage
                    src={image.src}
                    alt={image.title}
                    className={styles.thumbnailImage}
                    sizes={[25]}
                  />
                  {index === currentIndex && (
                    <div className={styles.thumbnailOverlay} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {isLightboxOpen && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={images[lightboxIndex]?.title || 'Image en plein écran'}
        >
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={closeLightbox}
            aria-label="Fermer la visionneuse"
          >
            ×
          </button>

          <button
            type="button"
            className={`${styles.lightboxNavButton} ${styles.lightboxNavButtonLeft}`}
            onClick={goToPreviousLightbox}
            aria-label="Image précédente"
          >
            <RadixIconsCaretRight
              className={styles.lightboxNavIcon}
              aria-hidden
              style={{ transform: 'rotate(180deg)' }}
            />
          </button>

          <figure className={styles.lightboxFrame}>
            <ResponsiveImage
              src={images[lightboxIndex]?.src}
              alt={images[lightboxIndex]?.title || 'Aperçu en plein écran'}
              className={styles.lightboxImage}
              sizes={[80, 85, 90]}
            />
            {(images[lightboxIndex]?.title || images[lightboxIndex]?.description) && (
              <figcaption className={styles.lightboxCaption}>
                <strong>{images[lightboxIndex]?.title}</strong>
                {images[lightboxIndex]?.description && (
                  <span>{images[lightboxIndex].description}</span>
                )}
              </figcaption>
            )}
          </figure>

          <button
            type="button"
            className={`${styles.lightboxNavButton} ${styles.lightboxNavButtonRight}`}
            onClick={goToNextLightbox}
            aria-label="Image suivante"
          >
            <RadixIconsCaretRight className={styles.lightboxNavIcon} aria-hidden />
          </button>
        </div>
      )}
    </section>
  );
};