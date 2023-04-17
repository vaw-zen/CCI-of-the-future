import { useEffect, useState, useRef } from 'react'
import arrow from '../../../assets/icons/testimony-arrow.svg'
import hoveredArrow from '../../../assets/icons/testimony-arrow-hovered.svg'
import { testimonials, handleSlide } from "./functions"

export default function sliders() {
    const [width, setWidth] = useState(0)
    const [btnIsHovered, setBtnIsHovered] = useState(0)

    const [IsHovered, setIsHovered] = useState(false)
    const [intervalId, setIntervalId] = useState(null);

    const containerRef = useRef(null);
    const dragRef = useRef(null);
    const dragStartRef = useRef(null);
    const [startX, setStartX] = useState(null);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [slides, setSlides] = useState([testimonials[0], testimonials[1], testimonials[2]]);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollLeft = containerRef.current.offsetWidth;
        }
        const id = setInterval(() => {
            handleNextClick(); handleSlide("right", setSlides, containerRef)
        }, 3000);

        setIntervalId(id);

        return () => clearInterval(id);
    }, []);



    const handleNextClick = () => {
        console.log(containerRef.current.offsetWidth)
        if (containerRef.current) {
            containerRef.current.scroll({
                left: containerRef.current.scrollLeft + containerRef.current.offsetWidth,
                behavior: "smooth"
            });
        }
    };

    const handlePrevClick = () => {
        if (containerRef.current) {
            containerRef.current.scroll({
                left: containerRef.current.scrollLeft - containerRef.current.offsetWidth,
                behavior: "smooth"
            });
        }
    };

    const handleMouseMove = (e) => {
        if (dragRef.current && dragStartRef.current !== null) {
            const dragDelta = e.clientX - dragStartRef.current;
            containerRef.current.scrollLeft -= dragDelta;
            dragStartRef.current = e.clientX;
        }
    };

    const handleMouseDown = (event) => {
        setStartX(event.pageX - containerRef.current.offsetLeft);
        setScrollLeft(containerRef.current.scrollLeft);
        dragRef.current = true;
        dragStartRef.current = event.clientX;
    };

    const handleMouseUp = (event) => {
        dragRef.current = false;
        dragStartRef.current = null;
        const diff = event.pageX - containerRef.current.offsetLeft - startX;
        if (diff > 100 && scrollLeft > 0) {
            handlePrevClick();
        } else if (diff < -100 && scrollLeft < containerRef.current.scrollWidth - containerRef.current.offsetWidth) {
            handleNextClick();
        }
    };


    const styles = {
        slide: { display: "flex", minWidth: "100%", height: "100%" },
        container: { height: "calc(100% - (58px + 20px))", marginTop: "58px", overflowX: "auto", display: "flex" },
        leftSide: { width: "32%", borderRight: "1px solid rgba(255, 255, 255, 0.15)", height: "100%" },
        rightSide: { width: "68%", height: "100%", position: "relative", fontWeight: "bold", },
        imgContainer: { height: "170px", width: "170px", marginTop: 50, borderRadius: "100%", position: "relative", transform: "translate(-50%)", left: "50%", backgroundPosition: "center" },
        name: { position: "relative", transform: "translate(-50%)", left: "50%", color: "white", top: -20, textAlign: "center", },
        tag: { position: "relative", top: -5, opacity: 0.3, fontSize: "20px" },
        textContainer: { marginTop: 50, width: "calc(100% - (60px + 30px))", height: "calc(100% - (90px + 50px))", marginLeft: "60px" },
        testimony: { color: "#fff", fontSize: "26px", lineHeight: "40px", fontStyle: "italic" },
        btnsContainer: { width: "200px", height: "calc(100% - 255px)", position: "absolute", zIndex: 2, marginLeft: "60px", top: "255px", display: "flex", alignItems: "center" },
        btn: { width: "50px", height: "50px", border: "2px solid", borderRadius: "100%", cursor: "pointer" },
    }
    return (
        <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseEnter={() => clearInterval(intervalId)}
            onMouseLeave={() => {
                const id = setInterval(() => {
                    handleNextClick(); handleSlide("right", setSlides, containerRef)
                }, 3000);

                setIntervalId(id);
            }}
            className='container' style={styles.container}>



            {slides.map((e, i) => <div key={i}
                style={styles.slide}>
                <div style={styles.leftSide}>
                    <div style={{ ...styles.imgContainer, backgroundImage: `url(${e.img})` }} />
                    <br /> <div style={styles.name}>
                        <h1>{e.name}</h1>
                        <p style={styles.tag}>{e.tag}</p>
                    </div>
                </div>
                <div style={styles.rightSide}>
                    <div style={styles.textContainer}>
                        <p style={styles.testimony}>{e.comment}</p>
                    </div>
                    <div style={styles.btnsContainer}>
                        <button onClick={() => { handlePrevClick(); handleSlide("left", setSlides, containerRef) }} onMouseEnter={() => setBtnIsHovered(1)} onMouseLeave={() => setBtnIsHovered(0)} style={{ ...styles.btn, transform: 'rotate(180deg)', backgroundColor: btnIsHovered === 1 ? "#cafb42" : "transparent", borderColor: btnIsHovered === 1 ? "#cafb42" : "white" }}>
                            <img src={btnIsHovered === 1 ? hoveredArrow : arrow} />
                        </button>
                        <button onClick={() => { handleNextClick(); handleSlide("right", setSlides, containerRef) }} onMouseEnter={() => setBtnIsHovered(2)} onMouseLeave={() => setBtnIsHovered(0)} style={{ ...styles.btn, marginLeft: 30, backgroundColor: "transparent", backgroundColor: btnIsHovered === 2 ? "#cafb42" : "transparent", borderColor: btnIsHovered === 2 ? "#cafb42" : "white" }}>
                            <img src={btnIsHovered === 2 ? hoveredArrow : arrow} />
                        </button>
                    </div>
                </div>
            </div>)}






            <style>
                {`
            .container::-webkit-scrollbar {
                display: none;
            }
            `}
            </style>
        </div>
    )
}
