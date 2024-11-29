import { useState, useEffect, useCallback, useMemo } from 'react';

const useViewportWidth = (throttleMs = 100) => {
    const getVw = useCallback(() => window.innerWidth / 100, []);

    const [vw, setVw] = useState(getVw);

    useEffect(() => {
        let timeoutId;
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => setVw(getVw()), throttleMs);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeoutId);
        };
    }, [getVw, throttleMs]);

    return useMemo(() => vw, [vw]);
};

export const useDimensions = { vw: useViewportWidth } 