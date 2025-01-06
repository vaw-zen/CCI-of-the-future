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

    function handleDropdownBlur(event) {
        if (!isDesktop()) return
        if (event.currentTarget.contains(event.relatedTarget)) {
            return;
        }
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

    function desktopMenuStyles(normal, active) {
        if (!isDesktop()) return normal
        return menu ? normal + ' ' + active : normal
    }

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return { handleMenuButton, handleDropdownBlur, toggleDropdown, isActive, handleMenuStyles, handleNavBlur, scrollToTop, desktopMenuStyles }
}

const nav = createRef()
const container = createRef()
const topBTN = createRef()

export function headerSI() {
    if (!topBTN.current) {
        topBTN.current = document.querySelector('.' + styles.topButton)
    } else {
        if (window.scrollY > innerHeight * 0.25) {
            if (!topBTN.current.style.transform !== 'scale(1)') topBTN.current.style.transform = 'scale(1)'
        } else {
            if (!topBTN.current.style.transform !== 'scale(0)') topBTN.current.style.transform = 'scale(0)'
        }
    }

    if (!nav.current) {
        nav.current = document.querySelector('.' + styles.nav)
        container.current = nav.current.children[0]
    }
    if (!nav.current) return;
    if (scrollY <= nav.current.clientHeight) {
        if (nav.current.style.transform !== 'translateY(0px)') {
            direction.current = 'up'
            nav.current.style.transform = 'translateY(0px)'
        }
        if (container.current.style.background !== 'rgba(0, 0, 0, 0)') {
            container.current.style.background = 'rgba(0, 0, 0, 0)'
            container.current.style.backdropFilter = 'none'
        }

    } else {
        if (container.current.style.background !== 'rgba(0, 0, 0, 0.5)') {
            container.current.style.background = 'rgba(0, 0, 0, .5)'
            container.current.style.backdropFilter = 'blur(5px)'

        }

        if (!direction.current) {
            nav.current.style.transform = 'translateY(-100%)'
            Array.from(nav.current.children).forEach((child) => child.blur());
            closeDropdownGlobal();

            direction.current = 'down'
        } else {
            if (prevScroll.current < scrollY) {
                if (direction.current === 'up') {
                    nav.current.style.transform = 'translateY(-100%)'
                    Array.from(nav.current.children).forEach((child) => child.blur());
                    closeDropdownGlobal();
                }
                direction.current = 'down'
            } else if (prevScroll.current > scrollY) {
                if (direction.current === 'down') {
                    nav.current.style.transform = 'translateY(0px)'
                }
                direction.current = 'up'
            }
        }
    }
    prevScroll.current = scrollY
}



