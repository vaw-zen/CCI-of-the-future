import { useState } from 'react'
import arrow from "../../../assets/icons/long-arrow.svg"
export default function imgContainer({ img, title, tags }) {
    const [isHovered, setIsHovered] = useState(false)
    return (
        <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} style={{ height: "calc(100% - 25px)", width: "100%", position: "relative", overflow: "hidden" }}>
            <img width={"100%"} src={img} />
            <div style={{
                width: "66%",
                backgroundColor: "#141416",
                zIndex: 2,
                position: "absolute",
                transform: "translate(-50%,0)",
                bottom: isHovered ? 50 : -150,
                opacity: isHovered ? 1 : 0,
                transition: "0.5s",
                borderRadius: 5,
                left: "50%", padding: "30px 40px", color: "white",
                display: "flex"
            }}>
                <div style={{ width: "calc(100% - 100px)" }}>
                    <h1 onMouseEnter={(e) => e.target.style.color = "#cafb42"} onMouseLeave={(e) => e.target.style.color = "white"} style={{ margin: 0, cursor: "pointer" }}>{title}</h1>
                    <p onMouseEnter={(e) => e.target.style.color = "#cafb42"} onMouseLeave={(e) => e.target.style.color = "white"} style={{ margin: 0, marginTop: 20, cursor: "pointer" }}>{tags.map((e, i) => {
                        return tags.length - 1 === i ? e : e + ", "
                    })}</p>
                </div>
                <div style={{ width: "calc(100% - calc(100% - 100px))" }}>
                    <div style={{
                        width: 50,
                        height: 50,
                        backgroundColor: "#cafb42",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        position: "absolute",
                        top: "50%",
                        transform: "translate(0,-50%)",
                        right: 20,
                        borderRadius: 5,
                        cursor: "pointer"
                    }}>
                        <img style={{ width: 20 }} src={arrow} />
                    </div>
                </div>

            </div>
        </div>
    )
}
