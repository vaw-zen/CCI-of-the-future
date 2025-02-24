'use client'
import Link from "next/link"
import { useServicesLogic } from "../services.func"
import { useEffect, useRef } from "react"

export default function ServiceLinkLayout({ style, children, href, className, index }) {
    const { handleMouseEnter, observer } = useServicesLogic()
    const linkRef = useRef(null)
    observer(linkRef)


    return (
        <Link
            ref={linkRef}
            href={href}
            style={style}
            className={className}
            onMouseEnter={handleMouseEnter(index)}
        >
            {children}
        </Link>
    )
}