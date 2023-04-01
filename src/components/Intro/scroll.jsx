import React, { useEffect, useState } from 'react';

export default function Scroll() {
    const [scrollPosition, setScrollPosition] = useState("start")
    const [isMobile, setIsMobile] = useState(false);
    console.log(scrollPosition)
    useEffect(() => {
        if (window.innerWidth < 651) {
            setIsMobile(true)
        } else {
            const handleScroll = () => {
                const scrollPosition = window.scrollY;
                const viewHeight = window.innerHeight;
                if (viewHeight + scrollPosition > document.documentElement.scrollHeight - (viewHeight / 2)) {
                    setScrollPosition("end")
                } else if (scrollPosition < 100) {
                    setScrollPosition("start")
                }
                else if (scrollPosition > 100) {
                    setScrollPosition("mid")
                }
            };

            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, []);
    if (isMobile) return;
    return (
        <div
            style={{ position: 'relative', transform: 'rotate(90deg)', top: scrollPosition === "start" ? "-87px" : '-22px', transition: "1s ease" }}
        >
            <span style={{ position: 'relative', right: scrollPosition === "mid" ? "30px" : 0, transition: "1s ease" }}>SCROLL</span>
            <span
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: scrollPosition === "start" ? "140%" : '-100%',
                    transform: 'translateY(-50%)',
                    borderTop: '2px solid white',
                    width: scrollPosition === "mid" ? "20px" : '40px',
                    transition: "1s ease"
                }}
            ></span>
            <span
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: scrollPosition === "end" ? '-80%' : '70%',
                    transform: 'translateY(-50%)',
                    borderTop: '2px solid white',
                    width: scrollPosition === "mid" ? '20px' : 0,
                    transition: "1s ease"
                }}
            ></span>
        </div>
    );
}
