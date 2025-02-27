import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import styles from './services.module.css'
import scrollTrigger from '@/libs/vz/scrollInteraction/scrollTrigger';
import { dimensionsStore } from '@/utils/store/store';

export function servicesSI() {
    const pathname = usePathname();
    const { isMobile } = dimensionsStore();

    useEffect(() => {
        if (pathname === '/' || (pathname === '/services' && isMobile())) {
            const cards = Array.from(document.getElementsByClassName(styles.serviceCard));
            cards.forEach((element, index) => {
                scrollTrigger.createInstance('service-card' + index, element, {
                    values: [[100, 0]],
                    startPoint: [0],
                    endPoint: [0.9],
                    callback: ({ v }) => {
                        element.style.transform = `translate3d(${v[0]}%, 0, 0)`;
                    }
                });
            });

            return () => {
                cards.forEach((_, index) => scrollTrigger.removeInstance('service-card' + index));
            };
        }
    }, [pathname]);
}
