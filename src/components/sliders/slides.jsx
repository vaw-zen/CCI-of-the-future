import React, { useRef, useState, useEffect } from 'react';
import vitre from '../../assets/w3.jpg'
import marble from '../../assets/marble.jpg'
import parterre from  '../../assets/marble-cleaning1.jpg'
import carpet from '../../assets/Carpet.jpg'
import sofa from '../../assets/sofa.jpg'
import car from '../../assets/car.jpg'
import window from '../../assets/window.gif'
export default function Slides() {
    const [isMobile, setIsMobile] = useState(false);
    const sliderRef = useRef(null);
    const [isDown, setIsDown] = useState(false);
    const [startX, setStartX] = useState(null);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [selectedDivIndex, setSelectedDivIndex] = useState(2); // initialize to the index of the div to center

    const array = [{ imgUrl: 'transparent' },
    { imgUrl: vitre, title: "NETTOYAGE VITRE" },
    { imgUrl: marble, title: "ENTRETIEN MARBRE" },
    { imgUrl: parterre, title: "NETTOYAGE PARTERRE & FAIENCE" },
    { imgUrl: carpet, title: "NETTOYAGE MOQUETTE" },
    { imgUrl: sofa, title: "NETTOYAGE SALONS" },
    { imgUrl: car, title: "NETTOYAGE INTERIEUR DE VOITURE" },
    // { imgUrl: window, title: "NETTOYAGE INTERIEUR DE VOITURE" }, funny meme

    { imgUrl: 'transparent' },];


    useEffect(() => {
        if (window.innerWidth < 651) {
            setIsMobile(true)
            sliderRef.current.children[2].style.width = `38%`;
            sliderRef.current.children[2].style.filter = `none`;
        } else {
            sliderRef.current.children[2].style.height = `500px`;
            sliderRef.current.children[2].style.width = `38%`;
            sliderRef.current.children[2].style.filter = `none`;

        }
    }, []);


    useEffect(() => {
        const divToScrollTo = sliderRef.current.children[selectedDivIndex];
        const sliderCenterX =
            sliderRef.current.getBoundingClientRect().left +
            sliderRef.current.offsetWidth / 2;
        const divCenterX =
            divToScrollTo.getBoundingClientRect().left +
            divToScrollTo.offsetWidth / 2;
        const scrollX = divCenterX - sliderCenterX;
        sliderRef.current.scrollLeft = scrollX;
    }, [selectedDivIndex]);

    const handleMouseDown = (e) => {
        if (e.button !== 0) return; // Do nothing if the button pressed is not the left mouse button
        setIsDown(true);
        sliderRef.current.classList.add('active');
        setStartX(e.pageX - sliderRef.current.offsetLeft);
        setScrollLeft(sliderRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDown(false);
        sliderRef.current.classList.remove('active');
    };

    const handleMouseUp = () => {
        setIsDown(false);
        sliderRef.current.classList.remove('active');
    };

    const handleMouseMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - sliderRef.current.offsetLeft;
        const walk = (x - startX) * 1;
        console.log(walk);
        sliderRef.current.scrollLeft = scrollLeft - walk;
    };


    const handleDivClick = (e, index) => {
        const divRect = e.target.getBoundingClientRect();
        const sliderRect = sliderRef.current.getBoundingClientRect();
        const divCenterX = divRect.left + divRect.width / 2;
        const sliderCenterX = sliderRect.left + sliderRect.width / 2;
        const scrollX = divCenterX - sliderCenterX;
        const startScrollLeft = sliderRef.current.scrollLeft;
        const animationDuration = 500; // in milliseconds
        const fps = 60;
        const frames = animationDuration / 1000 * fps;
        const scrollStep = scrollX / frames;
        let frame = 0;
        const animate = () => {
            const nextScrollLeft = startScrollLeft + scrollStep * frame;
            sliderRef.current.scrollLeft = nextScrollLeft;
            sliderRef.current.children[selectedDivIndex].style.height = isMobile ? "250px" : "400px";
            sliderRef.current.children[index].style.height = isMobile ? "300px" : "500px";
            sliderRef.current.children[selectedDivIndex].style.width = `30%`;
            sliderRef.current.children[index].style.width = `38%`;

            sliderRef.current.children[selectedDivIndex].style.filter = "blur(5px) grayscale(100%)";
            sliderRef.current.children[index].style.filter = `none`;

            frame++;
            if (frame <= frames) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
        setSelectedDivIndex(index);

    };

    return (
        <div
            ref={sliderRef}
            style={{
                display: 'flex',
                alignItems: 'center',
                width: isMobile ? '94vw' : '65vw',
                cursor: 'grab',
                overflow: 'hidden',
                height: '70vh',
                marginTop: '-30vh'
            }}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={(e) => {
                let touch = e.changedTouches[0];
                setStartX(touch.pageX - sliderRef.current.offsetLeft);
                setScrollLeft(sliderRef.current.scrollLeft);
            }}
            onTouchEnd={(e) => {
                setIsDown(false);
                sliderRef.current.classList.remove('active');
            }}
        >
            {array.map((e, i) => (
                <div
                    key={i}
                    onClick={
                        i && i !== array.length - 1
                            ? (e) => handleDivClick(e, i)
                            : null
                    }
                    style={{
                        transition: "1s",
                        width: '30%',
                        height: isMobile ? selectedDivIndex === i ? "300px" : "250px" : "400px",
                        backgroundImage: `url(${e.imgUrl})`,
                        flexShrink: 0,
                        marginLeft: i ? 20 : 0,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        filter: "blur(5px) grayscale(100%)",
                        border: "1px solid #1b1c21"
                    }}
                />
            ))}
            <h1 style={{
                position: "absolute",
                transform: "translate(-50%,-50%)",
                top: "60%",
                left: "50%",
                fontSize: isMobile ? "8vw" : "5vw",
                textShadow: "0px -5px 30px rgba(0,0,0,1)",
                fontFamily: "Cera CY Bold",
                whiteSpace: "nowrap"
            }}>{array[selectedDivIndex].title}</h1>

        </div>
    );
}
