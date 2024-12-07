'use client'

import { useEffect } from "react"
import { dimensionsStore } from "../store/store";

export default function Initializer() {
    const { setVw } = dimensionsStore();

    useEffect(() => {
        // Function to update viewport width
        const updateViewportWidth = () => {
            setVw(window.innerWidth);
        };

        // Initial call to set viewport width
        updateViewportWidth();

        // Add event listener for window resize
        window.addEventListener('resize', updateViewportWidth);

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('resize', updateViewportWidth);
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    return null; // No visual rendering needed
}