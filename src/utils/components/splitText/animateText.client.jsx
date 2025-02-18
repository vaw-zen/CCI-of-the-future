'use client'
import { useEffect } from "react";
import styles from './animatedText.module.css'
import { dimensionsStore } from "@/utils/store/store";

export default function AnimateTextCRS({ selector, threshold = 0.1, rootMargin = "50px", delay = 0 }) {

    const { isDesktop, vw } = dimensionsStore()
    useEffect(() => {
        if (selector &&
            // isDesktop()
            true
        ) {
            const element = document.querySelector('.' + selector);
            if (element) {
                element.style.perspective = '20.834vw'
                // Create the observer options
                const options = {
                    root: null, // Use viewport as root
                    rootMargin: rootMargin,
                    threshold: threshold // Trigger when 10% of element is visible
                };

                // Callback function when element intersects viewport
                const handleIntersect = (entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            // Add animation class when element becomes visible
                            Array.from(element.children).forEach((child, index) => {
                                child.style.animationDelay = `${(index * 0.1) + delay}s`
                                child.classList.add(styles.animate);
                            })
                            // Optional: Unobserve after animation starts
                            observer.unobserve(entry.target);
                        }
                    });
                };

                // Create and start observing
                const observer = new IntersectionObserver(handleIntersect, options);
                observer.observe(element);

                // Cleanup function
                return () => {
                    if (element) {
                        observer.unobserve(element);
                    }
                };
            }
        }
    }, [selector, threshold, rootMargin, vw]);

    return null;
}