'use client'
import Link from "next/link"
import { useRef } from "react"
import { useServicesLogic, useServiceLinkObserver } from "../services.func"
import { trackServiceInteraction, SERVICE_TYPES } from "@/utils/analytics"

export default function ServiceLinkLayout({ style, children, href, className, index }) {
    const { handleMouseEnter } = useServicesLogic()
    const linkRef = useRef(null)
    useServiceLinkObserver(linkRef)

    // Map href to service types for analytics
    const getServiceType = (href) => {
        if (href.includes('marbre')) return SERVICE_TYPES.MARBRE;
        if (href.includes('tapis')) return SERVICE_TYPES.TAPIS;
        if (href.includes('salon')) return SERVICE_TYPES.SALON;
        if (href.includes('tapisserie')) return SERVICE_TYPES.TAPISSERIE;
        if (href.includes('tfc')) return SERVICE_TYPES.TFC;
        return 'other';
    }

    const handleServiceClick = () => {
        const serviceType = getServiceType(href);
        trackServiceInteraction(serviceType, 'service_card_click', {
            service_index: index,
            service_url: href,
            page_location: 'services_section'
        });
    }

    return (
        <Link
            ref={linkRef}
            href={href}
            style={style}
            className={className}
            onMouseEnter={handleMouseEnter(index)}
            onClick={handleServiceClick}
        >
            {children}
        </Link>
    )
}
