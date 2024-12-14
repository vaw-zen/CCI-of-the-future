import { createRef, useState } from 'react';
import styles from './header.module.css'
import { throttle } from '@/libs/vz/utils';
import { dimensionsStore } from '@/utils/store/store';



const prevScroll = createRef(0)
const direction = createRef('down')

let closeDropdownGlobal;

export function useHeaderLogic() {
    const [active, setActive] = useState(-1)
    const [menu, setMenu] = useState(false)


    const { isDesktop } = dimensionsStore()
    const toggleDropdown = (index) => {
        setActive((prev) => (prev === index ? -1 : index))
    }

    const isActive = (index) => active === index

    const closeDropdown = () => {
        setActive(-1)
        setMenu(false)
    }

    closeDropdownGlobal = closeDropdown;

    function handleDropdownBlur() {
        if (!isDesktop()) return
        setActive(-1)
    }

    function handleNavBlur(event) {
        if (event.currentTarget.contains(event.relatedTarget)) {
            return;
        }
        if (isDesktop()) return
        setActive(-1)
        setMenu(false)
    }

    function handleMenuButton() {
        if (menu) {
            setMenu(false)
            setActive(-1)
        } else {
            setMenu(true)
        }
    }

    function handleMenuStyles(normal, active) {
        if (isDesktop()) return normal
        return menu ? normal + ' ' + active : normal
    }
    return { handleMenuButton, handleDropdownBlur, toggleDropdown, isActive, handleMenuStyles, handleNavBlur }
}

export function headerScrollInteraction() {
    const nav = document.querySelector('.' + styles.nav)
    const container = nav.children[0]

    if (!nav) return;
    if (scrollY <= nav.clientHeight) {
        if (nav.style.transform !== 'translateY(0px)') {
            direction.current = 'up'
            nav.style.transform = 'translateY(0px)'
        }
        if (container.style.background !== 'rgba(0, 0, 0, 0.1)') {
            container.style.background = 'rgba(0, 0, 0, .1)'
            container.style.backdropFilter = 'none'

        }

    } else {
        if (container.style.background !== 'rgba(0, 0, 0, 0.5)') {
            container.style.background = 'rgba(0, 0, 0, .5)'
            container.style.backdropFilter = 'blur(5px)'

        }

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


