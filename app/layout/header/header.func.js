import { createRef } from 'react';
import styles from './header.module.css'
import { throttle } from '@/app/libs/vz/utils';




const prevScroll = createRef(0)
const direction = createRef('down')

export function headerScrollInteraction() {
    const nav = document.querySelector('.' + styles.nav)
    if (!nav) return; // Safety check

    if (scrollY <= nav.clientHeight) {
        if ( nav.style.transform !== 'translateY(0px)') {
            direction.current = 'up'
            nav.style.transform = 'translateY(0px)'
    
        }
    } else {
        if (!direction.current) {
            nav.style.transform = 'translateY(-100%)'
            direction.current = 'down'
        } else {
            if (prevScroll.current < scrollY) {
                if (direction.current === 'up') {
                    nav.style.transform = 'translateY(-100%)'
                }
                direction.current = 'down'
            } else if (prevScroll.current > scrollY) {
                if (direction.current === 'down') {
                    nav.style.transform = 'translateY(0px)'
                }
                direction.current = 'up'
            }
        }
    }
    prevScroll.current = scrollY
}

// Throttled version
export const headerSI = throttle(headerScrollInteraction, 100); // 100ms throttle