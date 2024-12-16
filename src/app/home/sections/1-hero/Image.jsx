'use client'
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { dimensionsStore } from '@/utils/store/store';

export default function HeroImage({
    className,
    skeletonClassName,
    src,
    alt = "Image",
    sizes = "50vw",
    priority = false,
    quality = 90,
    responsiveWidth = true,
    aspectRatio = 16 / 9,
    style = {}
}) {


    const { vw, vh } = dimensionsStore()
    const [dimensions, setDimensions] = useState({
        width: vw || 1920,
        height: vh || 1080
    });

    useEffect(() => {
        if (responsiveWidth) {
            const screenWidth = window.innerWidth;
            const calculatedHeight = Math.round(screenWidth / aspectRatio);

            setDimensions({
                width: screenWidth,
                height: calculatedHeight
            });
        }
    }, [responsiveWidth, aspectRatio, vw]);

    const [isLoaded, setIsLoaded] = useState(false);


    const commonImageProps = {
        style: {
            opacity: isLoaded ? 1 : 0, ...style
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