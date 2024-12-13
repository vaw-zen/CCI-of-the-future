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
    responsiveWidth = true,
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
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [responsiveWidth, aspectRatio]);

    const [isLoaded, setIsLoaded] = useState(false);


    const commonImageProps = {
        style: {
            opacity: isLoaded ? 1 : 0,
        },
        onLoad: () => setIsLoaded(true),
        className: className,
        alt: alt,
    };

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
                />
            }
        </>
    );
}