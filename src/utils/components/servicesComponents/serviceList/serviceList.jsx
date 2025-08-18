'use client'
import React from 'react'
import styles from './serviceList.module.css'
import { BulletIcon } from '../../icons'
import ResponsiveImage from '@/utils/components/Image/Image'

const DEFAULT_ICON = '/home/6.webp'

function ServiceItem({ icon, text }) {
    return (
        <div className={styles.item}>
            <div className={styles.iconWrap}>
                {typeof icon === 'string' && icon ? (
                    <img src={icon} alt="" className={styles.icon} />
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
export default function ServiceList({ items = [] }) {
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

            <div className={styles.ListContainer}>
                <div className={styles.columns}>
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
