'use client';

import React, { useState, useEffect } from 'react'
import s from './band.module.css'
import content from './band.json'
import ScrollVelocity from './ScrollVelocity'

export default function Band() {
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    // First line starts with first item
    const line1 = content.join(' - ');
    // Second line starts with last item (reversed order)
    const line2 = [...content].reverse().join(' - ');
    
    if (!mounted) return null;
    
    return (
        <div className={s.container} key="band-container">
            <ScrollVelocity
                key="scroll-velocity"
                texts={[line1, line2]}
                velocity={-30}
                className={s.bandText}
                numCopies={4}
                parallaxClassName={s.parallax}
                scrollerClassName={s.scroller}
            />
        </div>
    )
}