import React from 'react'

export default function BlurBox() {
    return <div style={{
        backgroundColor: 'var(--ac-primary)', width: '2px', height: '2px', position: 'absolute', left: '50vw', top: '20vw',
        boxShadow: '0 0 5vw 7vw var(--ac-primary)', opacity: 0.2
    }}>

    </div>
}
