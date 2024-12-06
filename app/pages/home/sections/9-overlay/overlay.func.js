import { useState } from 'react'

export function useOverlayLogic() {
    const [isActive, setIsActive] = useState(false)

    const handleOpen = () => {
        document.querySelector('body').style.overflow = 'hidden'
        setIsActive(true)
    }

    const handleClose = () => {
        document.querySelector('body').style.overflow = 'visible'
        setIsActive(false)
    }

    return {
        isActive,
        handleOpen,
        handleClose
    }
}