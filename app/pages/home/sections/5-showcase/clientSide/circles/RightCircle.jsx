import React from 'react'

export default function RightCircle({ circle }) {
    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', borderRadius: '50%' }}>
            <div style={{
                width: '100%', height: '100%', background: 'var(--ac-primary)', position: 'absolute', left: 0, top: 0,
                boxShadow: '0px 0px 5px 4px rgba(203,251,66,0.75)', borderRadius: '50%', transform: 'scale(.95)'
            }} />

            <div style={{ background: 'var(--bg-base)', border: '1px solid rgb(51, 51, 53)', width: '100%', height: '100%', position: 'relative', zIndex: 1, borderRadius: '50%' }}>

            </div>
        </div>
    )
}
