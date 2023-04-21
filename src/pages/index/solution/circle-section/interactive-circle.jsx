import arrow from "../../../../assets/icons/right-arrow.svg"
import { useState, useEffect } from "react"
export default function interactiveCircle() {
    const [isClicked, setisClicked] = useState(0)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 478) {
                setIsMobile(false)
            } else {
                setIsMobile(true)
            }
        };
        handleResize()
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const styles = {
        h1: {
            fontSize: isMobile ? "15px" : "22px", position: "relative", left: isMobile ? "25px" : "-15px", cursor: "pointer",
        },
        img: {
            position: "relative", top: "6px", right: "-25px"
        },
        container: {
            cursor: "pointer", transition: "0.5s", overflowy: "hidden"
        },
        p: {
            fontWeigh: "regular", fontSize: isMobile ? 10 : 15, position: "relative", width: 300, transition: "1s", color: "white"
        }
    }
    function handleClick(nth) {
        setisClicked(nth === isClicked ? 0 : nth)
    }
    return (
        <div >
            <div onClick={() => handleClick(1)} style={{ ...styles.container, height: isClicked === 1 ? isMobile ? 50 : 70 : 30 }}>
                <h1 style={{ ...styles.h1, top: isMobile ? 0 : -25, color: isClicked === 1 ? "#cafb42" : "white" }}>
                    Large of services provided
                    {isClicked !== 1 ? <img style={styles.img} src={arrow} /> : null}
                    <p style={{ ...styles.p, opacity: isClicked === 1 ? 0.6 : 0, }}>
                        We Strive for 100% customer satisfaction <br />
                        in everything we do.</p>
                </h1>
            </div>
            <div onClick={() => handleClick(2)} style={{ ...styles.container, height: isClicked === 2 ? isMobile ? 50 : 70 : 30 }}>
                <h1 style={{ ...styles.h1, color: isClicked === 2 ? "#cafb42" : "white" }}>
                    Professional experience
                    {isClicked !== 2 ? <img style={styles.img} src={arrow} /> : null}
                    <p style={{ ...styles.p, opacity: isClicked === 2 ? 0.6 : 0, }}>
                        We Strive for 100% customer satisfaction <br />
                        in everything we do.</p>
                </h1>
            </div>
            <div onClick={() => handleClick(3)} style={{ ...styles.container, height: isClicked === 3 ? isMobile ? 50 : 70 : 30 }}>
                <h1 style={{ ...styles.h1, top: isMobile ? 0 : 25, color: isClicked === 3 ? "#cafb42" : "white" }}>
                    Number grateful customers
                    {isClicked !== 3 ? <img style={styles.img} src={arrow} /> : null}
                    <p style={{ ...styles.p, opacity: isClicked === 3 ? 0.6 : 0, }}>
                        We Strive for 100% customer satisfaction <br />
                        in everything we do.</p>
                </h1>
            </div>
        </div>
    )
}
