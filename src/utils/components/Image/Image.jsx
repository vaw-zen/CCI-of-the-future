"use client";

import styles from './image.module.css'
import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { dimensionsStore } from '@/utils/store/store';

const ResponsiveImage = ({
    title,
    sizes,
    src,
    alt = '#',
    className = '',
    style,
    priority = false,
    quality = 80,
    contain,
    position,
    skeleton = false,
    onClick,
    onKeyDown,
    role,
    tabIndex
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    // Track whether we're rendering on the client
    const [isMounted, setIsMounted] = useState(false);
    
    // Get safe dimensions on client side only
    useEffect(() => {
        setIsMounted(true);
    }, []);
    
    const handleLoadingComplete = useCallback(() => {
        setIsLoaded(true);
    }, []);

    // Determine effective size based on client or server rendering
    let effectiveSize;
    if (Array.isArray(sizes)) {
        if (sizes.length === 1) {
            effectiveSize = sizes[0];
        } else if (sizes.length === 2) {
            // Use largest size for server rendering (first render)
            effectiveSize = isMounted ? 
                (dimensionsStore.getState().vw >= 1024 ? sizes[0] : sizes[1]) : 
                sizes[0];
        } else {
            // Use largest size for server rendering (first render)
            if (!isMounted) {
                effectiveSize = sizes[0];
            } else {
                const state = dimensionsStore.getState();
                effectiveSize = state.vw >= 1024 ? 
                    sizes[0] : 
                    (state.vw > 480 && state.vw <= 1024) ? 
                        sizes[1] : 
                        sizes[2];
            }
        }
    } else {
        effectiveSize = sizes;
    }

    // Treat empty string src as invalid to avoid browser fetching current page
    const hasValidSrc = !(typeof src === 'string' && src.trim() === '');

    return (
        <div
            className={className}
            style={{
                position: 'relative',
                display: 'flex',
                ...style
            }}
            role={role}
            tabIndex={tabIndex}
            onClick={onClick}
            onKeyDown={onKeyDown}
        >
            {hasValidSrc && (
                <Image
                    src={src}
                    alt={alt}
                    title={title}
                    fill
                    sizes={typeof effectiveSize === 'number' ? effectiveSize + 'vw' : effectiveSize}
                    style={{
                        flex: 1,
                        objectFit: contain ? 'contain' : 'cover',
                        objectPosition: position || 'center',
                        opacity: isLoaded ? 1 : 0,
                        transition: 'none',
                        borderRadius: 'inherit'
                    }}
                    onLoad={handleLoadingComplete}
                    quality={quality}
                    priority={priority}
                />
            )}

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