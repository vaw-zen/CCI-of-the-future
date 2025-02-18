'use client'
import React, { useRef } from 'react';
import Link from 'next/link';
import { useAnimatedLinkLogic } from './animatedLink.func';
import styles from './animatedLink.module.css';
import { CiArrowUpRightMd } from '../icons';

export default function AnimatedLink({ children, href, fill, observer }) {
    const container = useRef();
    const movingDiv = useRef();
    const wrapper = useRef();

    const { handleMouseEnter, handleMouseLeave, handleMouseMove } = useAnimatedLinkLogic(container, movingDiv, wrapper, observer, fill);

    return (
        <div ref={wrapper} className={styles.container} style={observer ? { transform: 'translateY(-50%)', opacity: 0 } : null}>
            <Link
                href={href}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
                ref={container}
                className={styles.link}
            >
                <div ref={movingDiv} className={styles.movingDiv} style={{ background: fill || 'var(--ac-primary)' }} />
                <abbr>{children}</abbr>
                <CiArrowUpRightMd className={styles.icon} />
            </Link>
        </div>
    );
}
