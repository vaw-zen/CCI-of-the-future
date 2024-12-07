
import scrollTrigger from '@/app/libs/vz/scrollInteraction/scrollTrigger';
import styles from './services.module.css'
import { useEffect } from 'react';

export function servicesSI() {

    useEffect(() => {
            const cards = Array.from(document.getElementsByClassName(styles.serviceCard))
            cards.forEach((element, index) => {
                scrollTrigger.createInstance('service-card' + index, element, {
                    values: [[100, 0]],
                    startPoint: [0],
                    endPoint: [0.9],
                    callback: ({ v, vw }) => {
                        element.style.transform = `translate3d(${v[0]}%, 0, 0)`
                    }
                });
            });

            return () => {
                cards.forEach((_, index) => scrollTrigger.removeInstance('service-card' + index));
            };
    }, [])
}