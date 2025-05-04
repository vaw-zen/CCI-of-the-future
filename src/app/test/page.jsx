import HeroHeader from '@/utils/components/reusableHeader/HeroHeader'
import React from 'react'

export default function Page() {
    return (
        <div>
            <HeroHeader title={'Test'} />
            <div className="service-detail-info" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15.5px',
                padding: '0 var(--padding-base)',
            }}>
                <h2 style={{
                    color: 'var(--t-primary)',
                }}>
                    Wiring and installation
                </h2>
                <div className="service-detail-text" style={{
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <p style={{
                        color: 'var(--t-thri)',
                    }}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida. Risus
                    </p>
                    <p style={{
                        color: 'var(--t-thri)',
                    }}>
                        commodo viverra maecenas accumsan lacus vel facilisis. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
                    </p>
                    <p style={{
                        color: 'var(--t-thri)',
                    }}>
                        aliqua. Quis ipsum suspendisse ultrices gravida.
                    </p>
                </div>
            </div>
        </div>
    )
}
