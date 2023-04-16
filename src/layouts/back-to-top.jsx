import { useEffect, useState } from 'react'
import arrow from "../assets/icons/footer-arrow.svg";

export default function BackToTop() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        setIsScrolled(window.scrollY > window.innerHeight * 0.8)
        function handleScroll() {
            setIsScrolled(window.scrollY > window.innerHeight * 0.8);
        }
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleClick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div onClick={handleClick} onMouseOver={() => setIsHovered(true)} onMouseOut={() => setIsHovered(false)}
            style={{
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                width: isScrolled ? '50px' : 0,
                height: isScrolled ? '50px' : 0,
                backgroundColor: '#cafb42',
                borderRadius: '100%',
                display: 'flex',
                justifyContent: 'center',
                transform: isHovered ? 'rotate(-90deg)' : 'rotate(-40deg)',
                cursor: 'pointer',
                transition: "0.3s"
            }}>
            <img style={{ position: isScrolled ? "relative" : "absolute", width: "30px", left: isScrolled ? "auto" : -20, bottom: isScrolled ? "auto" : -10, transition: "0.5s" }} src={arrow} />
        </div>
    )
}
