'use client'

import { useEffect } from "react"
import { dimensionsStore } from "../store/store";
import { useInitializerLogic } from "./initializer.func";
import { homeScrollTriggers } from "@/app/pages/home/home.func";

export default function Initializer() {
    const { setVw, vw } = dimensionsStore();
    const { resizeEvent } = useInitializerLogic();

    homeScrollTriggers()

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = resizeEvent(setVw);

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [setVw]);

    return null;
}