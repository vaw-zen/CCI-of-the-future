'use client'
import { useState } from 'react';
import Image from 'next/image';

export default function HeroImage({
    className,
    skeletonClassName,
    src,
    alt = "Image",
    sizes = "50vw",
    priority= false
}) {
    const [isLoaded, setIsLoaded] = useState(false);
    
        return (
            <>
                {skeletonClassName && !isLoaded && <div className={`${className} ${skeletonClassName}`} />}
                <Image
                    width={0}
                    height={0}
                    sizes={sizes}
                    src={src}
                    alt={alt}
                    priority={priority}
                    className={className}
                    style={{ opacity: isLoaded ? 1 : 0 }}
                    onLoadingComplete={() => setIsLoaded(true)}
                />
            </>
        );
}