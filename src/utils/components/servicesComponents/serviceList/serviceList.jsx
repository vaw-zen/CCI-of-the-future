'use client'
import React from 'react'
import styles from './serviceList.module.css'
import { BulletIcon } from '../../icons'
import ResponsiveImage from '@/utils/components/Image/Image'
import ServiceDetails from '../serviceDetails/serviceDetails'

const DEFAULT_ICON = '/home/night.webp'

function ServiceItem({ icon, text }) {
    return (
        <div className={styles.item}>
            <div className={styles.iconWrap}>
                {typeof icon === 'string' && icon ? (
                    <img src={icon} alt={`icon for ${text}`} title={text} className={styles.icon} />
                ) : (
                    <BulletIcon className={styles.icon} />
                )}
            </div>
            <div className={styles.text}>{text}</div>
        </div>
    )
}

/**
 * ServiceList
 * - Reusable list component that accepts an array of items
 * Props:
 *  - items: Array<{ id?: string, text: string, icon?: string }>
 */
export default function ServiceList({ items = [], title = 'Nos solutions', text = "Des solutions de tapisserie adaptées à tous vos besoins" }) {
    const defaults = [
        'Dedicated Team Members',
        'Specific gravity of soil conduct',
        'Certified Contractor with us',
        'Soil Testing for under services',
        'Qualities of Good Brick',
        'Best Qualities of Cement'
    ]

    const list = items.length ? items : defaults.map((t, i) => ({ id: i, text: t }))

    return (
        <div className={styles.wrapper}>
            <ServiceDetails title={title} text={text} className={styles.ServiceDetails} />
            <div className={styles.ListContainer}>
                <div className={styles.columns}>
                    <div style={{display:'flex', minWidth:'calc(100% - 2.6vw)'}}>
                        <div className={styles.col}>
                        {list.slice(0, Math.ceil(list.length / 2)).map((it) => (
                            <ServiceItem key={it.id ?? it.text} icon={it.icon} text={it.text} />
                        ))}
                    </div>
                    <div className={styles.col}>
                        {list.slice(Math.ceil(list.length / 2)).map((it) => (
                            <ServiceItem key={it.id ?? it.text} icon={it.icon} text={it.text} />
                        ))}
                    </div>
                    </div>
                    <ResponsiveImage
                        src={DEFAULT_ICON}
                        alt="service image"
                        sizes={[60]}
                        skeleton
                        className={styles.image}
                    />
                </div>
            </div>
        </div>
    )
}
