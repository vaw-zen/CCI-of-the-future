import React, { useEffect, useState } from 'react';

export default function Scroll() {
    const [scrollPosition, setScrollPosition] = useState("start")

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const viewHeight = window.innerHeight;
            if (viewHeight + scrollPosition > document.documentElement.scrollHeight - (viewHeight / 2)) {
                setScrollPosition("end")
            } else if (scrollPosition < 100) {
                setScrollPosition("start")
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div
            style={{ position: 'relative', transform: 'rotate(90deg)', top: scrollPosition === "start" ? "-87px" : '-22px', transition: "1s ease" }}
        >
            <span style={{ position: 'relative' }}>SCROLL</span>
            <span
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: scrollPosition === "start" ? "140%" : '-100%',
                    transform: 'translateY(-50%)',
                    borderTop: '2px solid white',
                    width: '40px',
                }}
            ></span>
        </div>
    );
}
