import React from 'react'
import s from './band.module.css'
import content from './band.json'

export default function Band() {
    return (
        <div className={s.container}>
            <div className={s.band}>
                {[...content, ...content].map((element, index) => (
                    <strong key={index}>{element} -</strong>
                ))}
            </div>
        </div>
    )
}