import { useRef, useEffect, createRef } from 'react'

export const useShowcaseCircle = (circle) => {
    const refs = useRef([])

    useEffect(() => {
        refs.current = Array(circle.length).fill().map((_, i) => refs.current[i] || createRef())
    }, [circle])

    const handleClick = (index, selected, setSelected) => {
        if (index === selected) {
            setSelected(-1)
        } else {
            setSelected(index)
        }
    }

    const handleFocus = (index) => {
        // Only handle focus for keyboard navigation
        if (!document.hasFocus()) {
            setSelected(index)
        }
    }

    const handleBlur = (e, selected, setSelected, refs) => {
        const currentRef = refs.current[selected]
        if (currentRef && currentRef.current) {
            if (!currentRef.current.contains(e.relatedTarget)) {
                setSelected(-1)
            }
        }
    }

    return {
        refs,
        handleFocus,
        handleBlur,
        handleClick
    }
}
