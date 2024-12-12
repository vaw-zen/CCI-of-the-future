import { useEffect, useRef, createRef } from 'react'
import content from './testimonials.json'

const slideAncor = Math.floor((content.testimonials.length * 3) / 2)
const count = createRef(slideAncor)
const sliderContainer = createRef();

function moveLeft() {
    if (!sliderContainer.current) return
    count.current -= 1
    const slider = sliderContainer.current?.children[0]
    slider.style.transition = '.4s'
    slider.style.transform = `translatex(-${count.current}00%)`
    slider.addEventListener('transitionend', function resetSlider() {
        this.removeEventListener('transitionend', resetSlider)
        this.style.transition = 'none'
        if (count.current <= slideAncor - content.testimonials.length) {
            count.current = slideAncor
            slider.style.transform = `translatex(-${count.current}00%)`
        }
    })
}

function moveRight() {
    if (!sliderContainer.current) return
    count.current += 1
    const slider = sliderContainer.current?.children[0]
    slider.style.transition = '.4s'
    slider.style.transform = `translatex(-${count.current}00%)`
    slider.addEventListener('transitionend', function resetSlider() {
        this.removeEventListener('transitionend', resetSlider)
        this.style.transition = 'none'
        if (count.current >= slideAncor + content.testimonials.length) {
            count.current = slideAncor
            slider.style.transform = `translatex(-${count.current}00%)`
        }
    })
}

export function useSliderLogic() {
    const intervalRef = useRef(null);
    const dragStartRef = useRef(null);
    const isDraggingRef = useRef(false);

    const animate = () => {
        if (!sliderContainer.current) return
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }

        intervalRef.current = setInterval(() => {
            // requestAnimationFrame(() => {
                moveRight()
            // })
        }, 3000);
    }

    const pauseAnimation = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    }

    useEffect(() => {
        animate();
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        };
    }, []);

    const handleInteractionStart = (clientX, clientY) => {
        if (sliderContainer.current) {
            isDraggingRef.current = true;
            const slider = sliderContainer.current?.children[0]
            dragStartRef.current = {
                startX: clientX,
                startY: clientY,
                startTransform: parseInt(slider.style.transform.replace(/[^\d]/g, '')),
                isScrolling: null
            }
            slider.style.transition = 'none'
        }
    }

    const handleInteractionMove = (clientX, clientY) => {
        if (dragStartRef.current && sliderContainer.current && isDraggingRef.current) {
            const deltaX = clientX - dragStartRef.current?.startX;
            const deltaY = clientY - dragStartRef.current?.startY;

            if (dragStartRef.current?.isScrolling === null) {
                dragStartRef.current.isScrolling = Math.abs(deltaY) > Math.abs(deltaX);
            }

            if (dragStartRef.current?.isScrolling) {
                return;
            }

            event.preventDefault();

            const slider = sliderContainer.current?.children[0]
            const newTransform = dragStartRef.current?.startTransform - (deltaX / slider.offsetWidth * 100)
            slider.style.transform = `translatex(-${newTransform}00%)`
        }
    }

    const handleInteractionEnd = (clientX) => {
        if (dragStartRef.current && sliderContainer.current && isDraggingRef.current) {
            if (dragStartRef.current?.isScrolling) {
                isDraggingRef.current = false;
                dragStartRef.current = null;
                return;
            }

            isDraggingRef.current = false;
            const slider = sliderContainer.current?.children[0]
            const dragDistance = clientX - dragStartRef.current?.startX
            const sliderWidth = slider.offsetWidth
            const threshold = sliderWidth * 0.1

            slider.style.transition = '.4s'

            if (Math.abs(dragDistance) > threshold) {
                if (dragDistance > 0) {
                    moveLeft()
                } else {
                    moveRight()
                }
            } else {
                slider.style.transform = `translatex(-${count.current}00%)`
            }

            dragStartRef.current = null
        }
    }

    const handleMouseDown = (e) => {
        handleInteractionStart(e.clientX, e.clientY)
    }

    const handleMouseMove = (e) => {
        handleInteractionMove(e.clientX, e.clientY)
    }

    const handleMouseUp = (e) => {
        handleInteractionEnd(e.clientX)
    }

    const handleTouchStart = (e) => {
        pauseAnimation(); 
        const touch = e.touches[0]
        handleInteractionStart(touch.clientX, touch.clientY)
    }

    const handleTouchMove = (e) => {
        const touch = e.touches[0]
        handleInteractionMove(touch.clientX, touch.clientY)
    }

    const handleTouchEnd = (e) => {
        animate();
        const touch = e.changedTouches[0]
        handleInteractionEnd(touch.clientX)
    }

    const handleMouseEnter = () => {
        pauseAnimation();
    }

    const MI = (e) => {
        const eventHandlers = {
            'mouseenter': handleMouseEnter,
            'mouseleave': animate,
            'mousedown': (e) => {
                handleMouseDown(e);
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
            },
            'touchstart': (e) => {
                handleTouchStart(e);
                document.addEventListener('touchmove', handleTouchMove, { passive: false });
                document.addEventListener('touchend', handleTouchEnd);
            }
        };
    
        const handler = eventHandlers[e.type];
        if (handler) handler(e);
    }

    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);

    return {
        ref: sliderContainer,
        MI,
    }
}

export function useSliderBTNLogic() {
    return { moveLeft, moveRight }
}