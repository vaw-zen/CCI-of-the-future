"use client";

import styles from './image.module.css'
import { useState, useCallback } from 'react';
import Image from 'next/image';
import { dimensionsStore } from '@/utils/store/store';

const ResponsiveImage = ({
    sizes,
    src,
    alt = '#',
    className = '',
    style,
    priority = false,
    quality = 80,
    contain,
    position,
    skeleton = false
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const { isTablet, isDesktop } = dimensionsStore();

    const handleLoadingComplete = useCallback(() => {
        setIsLoaded(true);
    }, []);

    let effectiveSize;
    if (Array.isArray(sizes)) {
        if (sizes.length === 1) {
            effectiveSize = sizes[0];
        } else if (sizes.length === 2) {
            effectiveSize = isDesktop() ? sizes[0] : sizes[1];
        } else {
            effectiveSize = isDesktop() ? sizes[0] : isTablet() ? sizes[1] : sizes[2];
        }
    } else {
        effectiveSize = sizes;
    }
    if (src.includes('Glow')) {
        console.log(effectiveSize);
    }

    return (
        <div
            className={className}
            style={{
                position: 'relative',
                display: 'flex',
                ...style
            }}
        >
            <Image
                src={src}
                alt={alt}
                fill
                sizes={typeof effectiveSize === 'number' ? effectiveSize + 'vw' : effectiveSize}
                style={{
                    flex: 1,
                    objectFit: contain ? 'contain' : 'cover',
                    objectPosition: position || 'center',
                    opacity: isLoaded ? 1 : 0,
                    transition: 'none',
                }}
                onLoad={handleLoadingComplete}
                quality={quality}
                priority={priority}
            />

            {skeleton && (
                <div
                    className={styles.imageSkeleton}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: !isLoaded ? 1 : 0,
                        transition: 'opacity 0.5s ease-in-out',
                    }}
                />
            )}
        </div>
    );
};

export default ResponsiveImage;