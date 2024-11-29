import content from './showcase.json'
import pageStyles from '../../home.module.css'
import styles from './showcase.module.css'
import LeftCircle from './clientSide/circles/LeftCircle';
import RightCircle from './clientSide/circles/RightCircle';

export default function Showcase() {
    return (
        <section>
            <h2 className={pageStyles.slug}>{content.slug}</h2>
            <h3 className={pageStyles.highlight}>{content.highlight}</h3>
            <div className={styles.circleContainer}>
                {content.circles.map((circle, index) => {
                    return (
                        <div key={index} className={styles.circle} style={{
                            zIndex: index === 1 ? 1 : 0,
                            marginLeft: !index ? 0 : '-4vw',
                            position: 'relative'
                        }}>
                            {!index ? (
                                <LeftCircle circle={circle} />
                            ) : index === 1 ? (
                                <img
                                    className={styles.circleImage}
                                    src={circle.img}
                                />
                            ) : <RightCircle circle={circle} />}
                        </div>
                    );
                })}
            </div>
        </section>
    )
}