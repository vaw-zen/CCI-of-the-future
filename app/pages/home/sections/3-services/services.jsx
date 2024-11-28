import React from 'react'
import content from './services.json'
import Image from 'next/image'
import Link from 'next/link'
import pageStyles from '../../home.module.css'
import BlurBox from '@/app/libs/components/BlurBox/BlurBox'

export default function Services() {
    return (
        <section style={{ display: 'flex', gap: '2.86vw', position: 'relative' }}>
            <BlurBox style={{ bottom: '2.5vw', left: '17.5vw' }} />
            <div style={{ flex: 1, }}>
                <div style={{ width: '100%', position: 'sticky', top: ' 3.6458333333333vw' }}>
                    <h2 className={pageStyles.slug}>{content.slug}</h2>
                    <h3 className={pageStyles.highlight}>{content.highlight}</h3>
                    <button style={{
                        padding: '1vw 2vw', background: 'var(--ac-primary)', color: 'var(--t-highlight)', fontSize: '.85vw', fontWeight: 'bold',
                        borderRadius: '50vw', textTransform: 'uppercase', marginTop: '1vw'
                    }}>{content.button.name}</button>
                </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5vw' }}>
                {content.list.map((service, index) => {
                    return (
                        <article
                            key={index}
                            style={{
                                width: '100%',
                                height: '11.458vw',
                                padding: '1.5625vw',
                                background: 'var(--bg-elevated)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1vw'
                            }}
                        >
                            <img
                                src={service.img}
                                alt="hello"
                                width={0}
                                height={0}
                                sizes="(max-width: 768px) 100vw, 30vw"
                                style={{
                                    width: '8.334vw',
                                    height: '8.334vw',
                                    objectFit: 'cover',
                                    borderRadius: '50%'
                                }}
                            />

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1vw', marginTop: '-1vw' }}>
                                <Link href={service.link} style={{ fontSize: '1.3541666666667vw', fontWeight: 'bold', lineHeight: '1.875vw' }}>
                                    {service.title}
                                </Link>
                                <p style={{ lineHeight: '1.3541666666667vw', fontSize: ' 0.83333333333333vw', color: 'var(--t-secondary)' }}>{service.desc}</p>
                            </div>
                        </article>
                    )
                })}
            </div>
        </section>
    )
}