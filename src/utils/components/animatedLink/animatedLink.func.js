import { useEffect, useRef } from "react";
import styles from './animatedLink.module.css'

export function useAnimatedLinkLogic(makeObserver, fill) {
  const containerRef = useRef(null);
  const movingDivRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const wrapperElement = wrapperRef.current
    if (!makeObserver || !wrapperElement) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.animate);          }
        });
      },
      {
        threshold: 0.2
      }
    );

    observer.observe(wrapperElement);

    return () => {
      observer.unobserve(wrapperElement);
      observer.disconnect();
    };
  }, [makeObserver]);

  const calculateOffsets = (e) => {
    const containerElement = containerRef.current;
    if (!containerElement) return { offsetX: 0, offsetY: 0 };

    const rect = containerElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width * 0.5;
    const centerY = rect.height * 0.5;

    const offsetX = (x - centerX) * 1.25;
    const offsetY = (y - centerY) * 1.25;

    return { offsetX, offsetY };
  };

  const handleMouseEnter = (e) => {
    const movingElement = movingDivRef.current;
    const containerElement = containerRef.current;

    if (movingElement && containerElement) {
      movingElement.style.transition = 'border-color 1s ease-out, color .4s';

      const { offsetX, offsetY } = calculateOffsets(e);

      movingElement.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(0)`;

      requestAnimationFrame(() => {
        const nextMovingElement = movingDivRef.current;
        const nextContainerElement = containerRef.current;
        if (!nextMovingElement || !nextContainerElement) return;

        nextMovingElement.style.transition = 'transform 0.5s ease-out, border-color 1s ease-out, color .4s';
        nextMovingElement.style.transform = `translate(0px, 0px) scale(1.5)`;
        nextContainerElement.style.borderColor = fill || `var(--ac-primary)`;
        nextContainerElement.style.color = fill && fill.includes('primary') ? 'white' : `black`;
        nextContainerElement.style.fontWeight = `500`;

      });
    }
  };

  const handleMouseLeave = (e) => {
    const movingElement = movingDivRef.current;
    const containerElement = containerRef.current;

    if (movingElement && containerElement) {
      movingElement.style.transition = 'transform 0.7s ease-out, border-color 1s ease-out, color .4s';

      const { offsetX, offsetY } = calculateOffsets(e);

      requestAnimationFrame(() => {
        const nextMovingElement = movingDivRef.current;
        const nextContainerElement = containerRef.current;
        if (!nextMovingElement || !nextContainerElement) return;

        nextMovingElement.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(0)`;
        nextContainerElement.style.transform = `translate(0px, 0px)`;
        nextContainerElement.style.borderColor = `inherit`;
        nextContainerElement.style.color = `inherit`;
        nextContainerElement.style.fontWeight = `400`;
      });
    }
  };

  const handleMouseMove = (e) => {
    const containerElement = containerRef.current;
    if (containerElement) {
      containerElement.style.transition = 'transform 0.7s ease-out, border-color 1s ease-out, color .4s';

      const { offsetX, offsetY } = calculateOffsets(e);

      containerElement.style.transform = `translate(${offsetX * 0.7}px, ${offsetY * 0.7}px)`;
    }
  };

  return {
    containerRef,
    movingDivRef,
    wrapperRef,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseMove
  };
}
