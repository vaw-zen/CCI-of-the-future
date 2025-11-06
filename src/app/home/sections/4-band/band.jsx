'use client';

import React, { useState, useEffect, useMemo } from 'react'
import s from './band.module.css'
import content from './band.json'
import ScrollVelocity from './ScrollVelocity'

export default function Band() {
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    
    useEffect(() => {
        setMounted(true);
        // Detect mobile/tablet devices
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Memoize line calculations - only runs once since content doesn't change
    const lines = useMemo(() => {
        const line1 = content.join(' - ');
        const line2 = [...content].reverse().join(' - ');
        return [line1, line2];
    }, []);
    
    if (!mounted) return null;
    
    // Lower velocity sensitivity on mobile to prevent flickering
    const velocityConfig = isMobile 
        ? { input: [0, 1000], output: [0, 0.5] }  // Much lower sensitivity on mobile
        : { input: [0, 1000], output: [0, 2] };   // Normal sensitivity on desktop
    
    return (
        <div className={s.container} key="band-container">
            <ScrollVelocity
                key="scroll-velocity"
                texts={lines}
                velocity={-30}
                className={s.bandText}
                numCopies={4}
                parallaxClassName={s.parallax}
                scrollerClassName={s.scroller}
                damping={isMobile ? 100 : 80}
                stiffness={isMobile ? 200 : 300}
                velocityMapping={velocityConfig}
            />
        </div>
    )
}