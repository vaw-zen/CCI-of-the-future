import { createRef, useEffect, useRef } from "react";
import styles from './services.module.css'

export function useServicesLogic() {
    // Move refs inside the hook so they're recreated for each component instance
    const imgContainer = useRef(null);
    const spanContainer = useRef(null);
    const linkContainer = useRef(null);
    
    // Function to reset/initialize refs
    const initRefs = (event) => {
        const wrapper = document.querySelector('.' + styles.imagesContainer);
        if (wrapper) {
            imgContainer.current = wrapper.children[0];
            spanContainer.current = wrapper.children[1];
            linkContainer.current = event?.currentTarget?.parentElement || document.querySelector(`.${styles.linksContainer}`);
        }
    };
    
    // Initialize refs on mount and after navigation
    useEffect(() => {
        initRefs();
        return () => {
            // Clean up refs on unmount
            imgContainer.current = null;
            spanContainer.current = null;
            linkContainer.current = null;
        };
    }, []);

    function handleAnimations(index) {
        if (!imgContainer.current || !spanContainer.current || !linkContainer.current) {
            return; // Don't proceed if refs aren't set
        }

        Array.from(imgContainer.current.children).forEach((img, i) => {
            if (i === index) {
                if (img.style.opacity !== '1') {
                    img.style.transform = 'rotate(15deg) translate(21.5%, 7.9%)'
                    img.style.opacity = 1
                }
            } else {
                if (img.style.opacity !== '0') {
                    img.style.transform = 'rotate(0deg) translateX(-40%)'
                    img.style.opacity = 0
                }
            }
        })

        Array.from(spanContainer.current.children).forEach((span, i) => {
            if (i === index) {
                if (span.style.opacity !== '1') {
                    span.style.opacity = 1
                    span.style.transform = 'rotate(-26deg) translate(120px,-100%)'

                }
            } else {
                if (span.style.opacity !== '0') {
                    span.style.opacity = 0
                    span.style.transform = 'rotate(-26deg) translate(-100%,-100%)'

                }
            }
        })

        Array.from(linkContainer.current.children).forEach((link, i) => {
            const [num, title, desc, icon] = link.children
            const [icon1, icon2] = icon.children

            if (i === index) {
                if (icon2.style.opacity !== '1') {
                    num.style.color = 'var(--t-primary)'
                    title.style.color = 'var(--t-primary)'
                    icon1.style.transform = 'translate(75%, -125%)'
                    icon2.style.transform = 'translate(0%, -50%)'
                    icon1.style.opacity = 0
                    icon2.style.opacity = 1

                }
            } else {
                if (icon2.style.opacity !== '0') {
                    num.style.color = 'var(--t-secondary)'
                    title.style.color = 'var(--t-secondary)'
                    icon1.style.transform = 'translate(0%, -50%)'
                    icon2.style.transform = 'translate(-50%, 0%)'
                    icon1.style.opacity = 1
                    icon2.style.opacity = 0

                }
            }
        })
    }

    function observer(linkRef) {
        useEffect(() => {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            Array.from(linkRef.current.children, (element, index) => {
                                if (index) {
                                    element.style.transitionDelay = `${index * 0.1}s`
                                    element.style.opacity = 1
                                    element.style.transform = 'none'
                                }
                            })

                            // Immediately unobserve after first trigger
                            observer.unobserve(entry.target)
                        }
                    })
                },
                {
                    threshold: 1
                }
            )

            if (linkRef.current) {
                observer.observe(linkRef.current)
            }

            return () => {
                if (linkRef.current) {
                    observer.unobserve(linkRef.current)
                }
            }
        }, [])
    }
    
    function handleMouseEnter(index) {
        return (event) => {
            // Always try to initialize refs on mouse enter to ensure they're up to date
            initRefs(event);
            handleAnimations(index);
        }
    }

    return { handleMouseEnter, observer }
}