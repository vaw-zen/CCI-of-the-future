import React from 'react'

export default function BlurBox({ top, left }) {
    return <div style={{
        backgroundColor: 'var(--ac-primary)', width: '2px', height: '2px', position: 'absolute', left: left[0], top: top[0],
        boxShadow: '0 0 5.75vw 7.3vw var(--ac-primary)', opacity: 0.2, zIndex:-1
    }}>

    </div>
}
