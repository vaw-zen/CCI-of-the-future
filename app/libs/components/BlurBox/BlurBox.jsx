import React from 'react'

export default function BlurBox({ top, left }) {
    return (
        <>
            <div className='blurBox' />

            <style>{`
                .blurBox {
                    top: ${top[0]}; 
                    left: ${left[0]}; 
                    background-color: var(--ac-primary); 
                    width: 2px; 
                    height: 2px; 
                    position: absolute; 
                    box-shadow: 0 0 5.75vw 7.3vw var(--ac-primary); 
                    opacity: 0.2; 
                    z-index: -1;
                }

                @media (max-width: 1024px) {
                    .blurBox {
                        top: ${top[1]};
                        left: ${left[1]};
                        box-shadow: 0 0 17.5vw 16vw var(--ac-primary); 
                    }
                }

                @media (max-width: 768px) {
                    .blurBox {
                        top: ${top[2]};
                        left: ${left[2]};
                    }
                }
            `}</style>
        </>
    )
}
