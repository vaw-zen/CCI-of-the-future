'use client';

import React, { useState, useEffect, useMemo } from 'react'
import s from './band.module.css'
import content from './band.json'
import ScrollVelocity from './ScrollVelocity'

export default function Band() {
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    // Memoize line calculations - only runs once since content doesn't change
    const lines = useMemo(() => {
        const line1 = content.join(' - ');
        const line2 = [...content].reverse().join(' - ');
        return [line1, line2];
    }, []);
    
    if (!mounted) return null;
    
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
                damping={80}
                stiffness={300}
                velocityMapping={{ input: [0, 1000], output: [0, 2] }}
            />
        </div>
    )
}