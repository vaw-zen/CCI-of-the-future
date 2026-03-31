'use client'
import React from 'react';
import Link from 'next/link';
import { useAnimatedLinkLogic } from './animatedLink.func';
import styles from './animatedLink.module.css';
import { CiArrowUpRightMd } from '../icons';

export default function AnimatedLink({ children, href, fill, observer }) {
    const {
        containerRef,
        movingDivRef,
        wrapperRef,
        handleMouseEnter,
        handleMouseLeave,
        handleMouseMove
    } = useAnimatedLinkLogic(observer, fill);

    return (
        <div ref={wrapperRef} className={styles.container} style={observer ? { transform: 'translateY(-50%)', opacity: 0 } : null}>
            <Link
                href={href}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
                ref={containerRef}
                className={styles.link}
            >
                <div ref={movingDivRef} className={styles.movingDiv} style={{ background: fill || 'var(--ac-primary)' }} />
                <abbr>{children}</abbr>
                <CiArrowUpRightMd className={styles.icon} />
            </Link>
        </div>
    );
}
