'use client'
import { states } from '@/lib/store'
import { crsor } from './cursor_functions'
import VzCursor from './vzCustor'
import Loading from '@/app/layout/loading/loading'
// import { useEffect } from 'react'
export default function VzLayout({ children }) {
    const { loading } = states()
    // useEffect(() => {
    //     console.log(loading);
    // }, [loading])
    return <>
        {loading === 6 ? null : <Loading />}
        <div onMouseEnter={crsor} onMouseLeave={crsor} onMouseMove={crsor} onMouseDown={crsor} onMouseUp={crsor} className='Vz-wrapper'>
            <VzCursor>
                {/* <Exit className='exit-crsor' isCursor /> */}
            </VzCursor>
            {children}
            <style>{`
                #wrapper {  z-index: -1; overflow: hidden; }
                #container { transition: transform var(--transition); }
                #fade { width: 100%; height: 100%; position: fixed; top: 0; left: 0; background: var(--black_white); z-index: 6; animation: fade 1s forwards; pointer-events: none;  }
                .exit-crsor { position: absolute; z-index: 1; transform: translate(-52.5%, -52.5%); left: 50%; top: 50%; display: none;  }
                @keyframes fade {  0% {  opacity :1 }   100% { opacity :0  }}
            `}</style>
        </div>
    </>


}
