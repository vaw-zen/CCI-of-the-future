import styles from '../../showcase.module.css'

export default function RightCircle({ circle }) {
    return (
        <>
            <div className={styles.shadow} />
            <div style={{
                background: 'var(--bg-base)', border: '1px solid rgb(51, 51, 53)', width: '100%', height: '100%', position: 'relative', zIndex: 1, borderRadius: '50%',
                display: 'flex', display: 'flex', alignItems: 'center', gap: '.5vw', justifyContent: 'center',
            }}>

                <div style={{ width: '7vw', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    {circle.map(element => <h2 style={{
                        height: '5vw', display: 'flex', justifyContent: 'center', alignItems: 'center',
                        fontSize: '3.334vw', width: '100%', color: 'var(--ac-primary)'
                    }}>{element.number}</h2>)}
                </div>
                <div style={{ width: '5vw', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    {circle.map(element => <p style={{
                        height: '5vw', display: 'flex', justifyContent: 'center', alignItems: 'center',
                        fontSize: '.9vw', color: 'var(--t-thri)'
                    }}>{element.desc}</p>)}
                </div>
            </div>
        </>
    )
}
