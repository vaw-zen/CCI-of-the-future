import { useEffect, useRef, useState } from 'react'
import content from './testimonials.json'

const slideAncor = Math.floor((content.testimonials.length * 3) / 2)

export function useSliderLogic() {
    const sliderContainer = useRef();
    const intervalRef = useRef(null);
    const dragStartRef = useRef(null);
    const count = useRef(slideAncor)

    const animate = () => {
        if (!sliderContainer.current) return
        const slider = sliderContainer.current.children[0]

        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }

        intervalRef.current = setInterval(() => {
            requestAnimationFrame(() => {
                if (slideAncor === count.current) {
                    slider.style.transform = `translatex(-${slideAncor + content.testimonials.length}00%)`
                    slider.addEventListener('transitionend', function resetSlider() {
                        this.removeEventListener('transitionend', resetSlider);
                        this.style.transition = 'none';
                        slider.style.transform = `translatex(-${count.current}00%)`
                    });
                } else {
                    slider.style.transition = '.4s';
                    slider.style.transform = `translatex(-${count.current}00%)`
                }
            })
            count.current = slideAncor + ((count.current - slideAncor + 1) % content.testimonials.length);
        }, 1000);
    }
    useEffect(() => {
        animate();
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        };
    }, []);

    const handleMouseEnter = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }
    }

    const handleMouseLeave = animate


    const handleMouseDown = (e) => {
        if (sliderContainer.current) {
            const slider = sliderContainer.current.children[0]
            dragStartRef.current = {
                startX: e.clientX,
                startTransform: parseInt(slider.style.transform.replace(/[^\d]/g, ''))
            }
            slider.style.transition = 'none'
        }
    }
    const handleMouseMove = (e) => {
        if (dragStartRef.current && sliderContainer.current) {
            const slider = sliderContainer.current.children[0]
            const dragDistance = e.clientX - dragStartRef.current.startX
            const newTransform = dragStartRef.current.startTransform - (dragDistance / slider.offsetWidth * 100)
            slider.style.transform = `translatex(-${newTransform}00%)`
        }
    }

    const handleMouseUp = (e) => {
        if (dragStartRef.current && sliderContainer.current) {
          const slider = sliderContainer.current.children[0]
          const dragDistance = e.clientX - dragStartRef.current.startX
          const sliderWidth = slider.offsetWidth
          const threshold = sliderWidth * 0.1
      
          slider.style.transition = '.4s'
      
          // Determine direction and update count
          if (Math.abs(dragDistance) > threshold) {
            if (dragDistance > 0) {
              count.current -= 1
            } else {
              count.current += 1
            }
          }
      
          // Handle edge cases and infinite scroll
          if (count.current >= slideAncor + content.testimonials.length) {
            slider.style.transform = `translatex(-${count.current}00%)`
            slider.addEventListener('transitionend', function resetSlider() {
              this.removeEventListener('transitionend', resetSlider)
              this.style.transition = 'none'
              count.current = slideAncor + 1
              slider.style.transform = `translatex(-${count.current}00%)`
            })
          } else if (count.current <= slideAncor - content.testimonials.length) {
            slider.style.transform = `translatex(-${count.current}00%)`
            slider.addEventListener('transitionend', function resetSlider() {
              this.removeEventListener('transitionend', resetSlider)
              this.style.transition = 'none'
              count.current = slideAncor - 1
              slider.style.transform = `translatex(-${count.current}00%)`
            })
          } else {
            slider.style.transform = `translatex(-${count.current}00%)`
          }
      
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
          dragStartRef.current = null
        }
      }


    const MI = (e) => {
        const eventHandlers = {
            'mouseenter': handleMouseEnter,
            'mouseleave': animate,
            'mousedown': (e) => {
                handleMouseDown(e);
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
            }
        };

        const handler = eventHandlers[e.type];
        if (handler) handler(e);
    }
    return {
        ref: sliderContainer,
        MI,
    }
}