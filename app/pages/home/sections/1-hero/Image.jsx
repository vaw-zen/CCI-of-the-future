'use client'
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function HeroImage({
    className,
    skeletonClassName,
    src,
    alt = "Image",
    sizes = "50vw",
    priority = false,
    quality = 90,
    responsiveWidth = true, // New prop to enable responsive sizing
    aspectRatio = 16 / 9, // Default 16:9 aspect ratio
}) {
    const [dimensions, setDimensions] = useState({
        width: 1920,
        height: 1080
    });

    // Handle responsive sizing
    useEffect(() => {
        const handleResize = () => {
            if (responsiveWidth) {
                const screenWidth = window.innerWidth;
                const calculatedHeight = Math.round(screenWidth / aspectRatio);

                setDimensions({
                    width: screenWidth,
                    height: calculatedHeight
                });
            }
        };

        // Initial calculation
        handleResize();

        // Add event listener
        window.addEventListener('resize', handleResize);

        // Cleanup listener
        return () => window.removeEventListener('resize', handleResize);
    }, [responsiveWidth, aspectRatio]);

    const [isLoaded, setIsLoaded] = useState(false);

    // Determine if image is a special case (like linesGlow.webp)
    const isSpecialImage = src.includes('linesGlow.webp');

    // Common image props
    const commonImageProps = {
        style: {
            opacity: isLoaded ? 1 : 0,
            width: '100%',
            height: 'auto'
        },
        onLoad: () => setIsLoaded(true),
        className: className,
        alt: alt,
    };

    // Shimmer effect function
    const shimmer = (w, h) => `
    <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#333" offset="20%" />
          <stop stop-color="#222" offset="50%" />
          <stop stop-color="#333" offset="70%" />
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="#333" />
      <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
      <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
    </svg>`;

    const toBase64 = (str) =>
        typeof window === 'undefined'
            ? Buffer.from(str).toString('base64')
            : window.btoa(str);

    return (
        <>
            {skeletonClassName && !isLoaded && <div className={`${className} ${skeletonClassName}`} />}

            {
                <Image
                    {...commonImageProps}
                    src={src}
                    width={dimensions.width}
                    height={dimensions.height}
                    sizes={sizes}
                    priority={priority}
                    quality={quality}
                    placeholder="blur"
                    blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(dimensions.width, dimensions.height))}`}
                />
            }
        </>
    );
}