    'use client'

    import { useSliderLogic } from "../testimonials.func"

    export default function SliderContainer({ className, children }) {
        const { MI, ref } = useSliderLogic()

        return (
            <div
                ref={ref}
                className={className}
                onMouseEnter={MI}
                onMouseLeave={MI}
                onMouseDown={MI}
            >
                {children}
            </div>
        )
    }