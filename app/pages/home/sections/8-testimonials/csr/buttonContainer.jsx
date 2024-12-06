'use client'

import { useSliderBTNLogic } from "../testimonials.func";

export default function ButtonContainer({ children, className, left }) {
    const { moveLeft, moveRight } = useSliderBTNLogic()
    return (
        <button className={className} onClick={left ? moveLeft : moveRight}>
            {children}
        </button>
    )
}
