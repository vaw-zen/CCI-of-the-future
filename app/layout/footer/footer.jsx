import Link from 'next/link'
import React from 'react'
import content from './footer.json'

export default function Footer() {
    return (
        <footer style={{ height: '26.823vw', display: 'flex', flexDirection: 'column', contain: 'paint', background: '#1a1a1c' }}>
            <div style={{ display: 'flex', flex: 1, padding: '0 17.5vw 0 15.72vw' }}>
                <div style={{ flex: 1 }}></div>
                <div></div>
            </div>

            <div style={{
                height: '3.073vw', width: '100%', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', padding: '0 17.5vw 0 15.72vw',
                alignItems: 'center'

            }}>
                <div style={{ fontSize: '0.9375vw', color: 'var(--t-secondary)' }}>
                    Copyright © <strong style={{ color: 'var(--t-primary)' }}>CCI</strong> <span style={{ margin: '0 .5vw' }}>|</span> Designed and developed by - <Link
                        href='https://www.vawzen.org/' target='_blank' style={{ color: 'var(--t-primary)' }}>
                        Vawzen
                    </Link>
                </div>

                <ul style={{ display: 'flex', listStyle: 'none', gap: '1vw', fontWeight: 'bolder', textTransform: 'capitalize', fontSize: '.9vw' }}>
                    {content.socialMedias.map((element, index) => (
                        <li style={{}} key={index}><Link href={element.link}>{element.name}</Link></li>
                    ))}
                </ul>
            </div>
        </footer>
    )
}
