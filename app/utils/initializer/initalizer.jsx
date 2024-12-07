'use client'

import { useEffect } from "react"
import { dimensionsStore } from "../store/store";
import { useInitializerLogic } from "./initializer.func";
import { homeScrollTriggers } from "@/app/pages/home/home.func";
import { headerSI } from "@/app/layout/header/header.func";

export default function Initializer() {
    const { setVw, vw } = dimensionsStore();
    const { resizeEvent, scrollEvent } = useInitializerLogic();

    homeScrollTriggers()

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = resizeEvent(setVw);

        handleResize();
        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', headerSI);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', headerSI);
        };
    }, [setVw]);

    return null;
}