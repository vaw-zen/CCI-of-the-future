import React from 'react'
import content from './showcase.json'
import pageStyles from '../../home.module.css'

export default function Showcase() {
    return (
        <section>
            <h2 className={pageStyles.slug}>{content.slug}</h2>
            <h3 className={pageStyles.highlight}>{content.highlight}</h3>
            <div style={{ marginTop: '3vw', display: 'flex' }}>
                <div style={{
                    minWidth: '25vw', minHeight: '25vw', border: '1px solid var(--ac-primary)', borderRadius: '50%',

                }}></div>
                <div style={{
                    minWidth: '25vw', minHeight: '25vw', borderRadius: '50%', zIndex: 2, position: 'relative',
                    background: 'red', overflow: 'hidden', marginLeft: '-4vw'
                }}>

                    <img style={{ width: '100%', height: '100%' }} src='/home/about.png' />
                </div>
                <div style={{
                    minWidth: '25vw', minHeight: '25vw', border: '1px solid white', borderRadius: '50%', marginLeft: '-4vw'

                }}></div>
            </div>
        </section>
    )
}
