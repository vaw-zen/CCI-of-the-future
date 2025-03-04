'use client'

import { useEffect } from "react"
import { dimensionsStore } from "../store/store";
import { useInitializerLogic } from "./initializer.func";
import { homeScrollTriggers } from "@/app/home/home.func";
import { headerSI } from "@/layout/header/header.func";

export default function Initializer() {
    const { setVw, setVh, isDesktop } = dimensionsStore()
    const { resizeEvent, initializeLenis, startLenisRaf, lenisRef, rafIdRef } = useInitializerLogic()
  

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Initialize Lenis
        lenisRef.current = initializeLenis(isDesktop)

        // Start RAF if Lenis is initialized
        if (lenisRef.current) {
            rafIdRef.current = startLenisRaf(lenisRef.current)
        }

        const handleResize = resizeEvent(setVw, setVh)
        handleResize()
        window.addEventListener('resize', handleResize)
        window.addEventListener('scroll', headerSI);
        return () => {
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('scroll', headerSI);
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current)
            }
            if (lenisRef.current) {
                lenisRef.current.destroy()
                lenisRef.current = null
            }
        }

    }, [setVw, setVh, isDesktop])


    homeScrollTriggers()

    return null;
}