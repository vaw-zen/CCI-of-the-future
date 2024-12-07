import { createRef, useState } from 'react';
import styles from './header.module.css'
import { throttle } from '@/app/libs/vz/utils';



const prevScroll = createRef(0)
const direction = createRef('down')

let closeDropdownGlobal;

export function useHeaderLogic() {
    const [active, setActive] = useState(-1)

    const toggleDropdown = (index) => {
        setActive((prev) => (prev === index ? -1 : index))
    }

    const isActive = (index) => active === index

    const closeDropdown = () => {
        setActive(-1)
    }

    closeDropdownGlobal = closeDropdown;

    return { active, toggleDropdown, isActive, closeDropdown }
}

export function headerScrollInteraction() {
    const nav = document.querySelector('.' + styles.nav)
    if (!nav) return; 
    
    if (scrollY <= nav.clientHeight) {
        if (nav.style.transform !== 'translateY(0px)') {
            direction.current = 'up'
            nav.style.transform = 'translateY(0px)'
        }
    } else {
        if (!direction.current) {
            nav.style.transform = 'translateY(-100%)'
            Array.from(nav.children).forEach((child) => child.blur());
            closeDropdownGlobal(); 

            direction.current = 'down'
        } else {
            if (prevScroll.current < scrollY) {
                if (direction.current === 'up') {
                    nav.style.transform = 'translateY(-100%)'
                    Array.from(nav.children).forEach((child) => child.blur());
                    closeDropdownGlobal(); 
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

export const headerSI = throttle(headerScrollInteraction, 100);


