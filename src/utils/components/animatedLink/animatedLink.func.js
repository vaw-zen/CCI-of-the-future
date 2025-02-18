import { useEffect } from "react";
import styles from './animatedLink.module.css'

export function useAnimatedLinkLogic(container, movingDiv, wrapper, makeObserver, fill) {
  useEffect(() => {
    if (!makeObserver || !wrapper.current) return

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

    if (wrapper.current) {
      observer.observe(wrapper.current);
    }

    return () => {
      if (wrapper.current) {
        observer.unobserve(wrapper.current);
      }
    };
  }, []);

  const calculateOffsets = (e) => {
    if (!container.current) return { offsetX: 0, offsetY: 0 };

    const rect = container.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width * 0.5;
    const centerY = rect.height * 0.5;

    const offsetX = (x - centerX) * 1.25;
    const offsetY = (y - centerY) * 1.25;

    return { offsetX, offsetY };
  };

  const handleMouseEnter = (e) => {
    if (movingDiv.current && container.current) {
      movingDiv.current.style.transition = 'border-color 1s ease-out, color .4s';

      const { offsetX, offsetY } = calculateOffsets(e);

      movingDiv.current.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(0)`;

      requestAnimationFrame(() => {
        movingDiv.current.style.transition = 'transform 0.5s ease-out, border-color 1s ease-out, color .4s';
        movingDiv.current.style.transform = `translate(0px, 0px) scale(1.5)`;
        container.current.style.borderColor = fill || `var(--ac-primary)`;
        container.current.style.color = fill && fill.includes('primary') ? 'white' : `black`;
        container.current.style.fontWeight = `500`;

      });
    }
  };

  const handleMouseLeave = (e) => {
    if (movingDiv.current && container.current) {
      movingDiv.current.style.transition = 'transform 0.7s ease-out, border-color 1s ease-out, color .4s';

      const { offsetX, offsetY } = calculateOffsets(e);

      requestAnimationFrame(() => {
        movingDiv.current.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(0)`;
        container.current.style.transform = `translate(0px, 0px)`;
        container.current.style.borderColor = `inherit`;
        container.current.style.color = `inherit`;
        container.current.style.fontWeight = `400`;
      });
    }
  };

  const handleMouseMove = (e) => {
    if (container.current) {
      container.current.style.transition = 'transform 0.7s ease-out, border-color 1s ease-out, color .4s';

      const { offsetX, offsetY } = calculateOffsets(e);

      container.current.style.transform = `translate(${offsetX * 0.7}px, ${offsetY * 0.7}px)`;
    }
  };

  return { handleMouseEnter, handleMouseLeave, handleMouseMove };
}
