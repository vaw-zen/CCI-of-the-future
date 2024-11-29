import styles from '../../showcase.module.css'

export default function RightCircle({ circle }) {
    return (
        <>
            <div className={styles.shadow} />
            <div className={styles.rightCircle}>
                <div className={styles.numberContainer}>
                    {circle.map(element => <h2 key={element.number} className={styles.number}>{element.number}</h2>)}
                </div>
                <div className={styles.descContainer}>
                    {circle.map(element => <p key={element.desc} className={styles.description}>{element.desc}</p>)}
                </div>
            </div>
        </>
    )
}