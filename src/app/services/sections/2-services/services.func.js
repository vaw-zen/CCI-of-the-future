import { createRef, useEffect } from "react";
import styles from './services.module.css'

const imgContainer = createRef()
const spanContainer = createRef()
const linkContainer = createRef()

function handleAnimations(index) {
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
                num.style.color = 'var(--white)'
                title.style.color = 'var(--white)'
                icon1.style.transform = 'translate(75%, -125%)'
                icon2.style.transform = 'translate(0%, -50%)'
                icon1.style.opacity = 0
                icon2.style.opacity = 1

            }
        } else {
            if (icon2.style.opacity !== '0') {
                num.style.color = 'var(--gray-2)'
                title.style.color = 'var(--gray-2)'
                icon1.style.transform = 'translate(0%, -50%)'
                icon2.style.transform = 'translate(-50%, 0%)'
                icon1.style.opacity = 1
                icon2.style.opacity = 0

            }
        }
    })

}

export function useServicesLogic() {
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
            if (!imgContainer.current || !spanContainer.current || !linkContainer.current) {
                const wrapper = document.querySelector('.' + styles.imagesContainer)
                imgContainer.current = wrapper.children[0]
                spanContainer.current = wrapper.children[1]
                linkContainer.current = event.currentTarget.parentElement
            }
            handleAnimations(index)
        }
    }
    return { handleMouseEnter, observer }
}