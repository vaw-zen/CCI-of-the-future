import content from './showcase.json'
import pageStyles from '../../home.module.css'
import styles from './showcase.module.css'
import LeftCircle from './clientSide/circles/LeftCircle';
import RightCircle from './clientSide/circles/RightCircle';
import Image from 'next/image';

export default function Showcase() {
    return (
        <section>
            <h2 className={pageStyles.slug}>{content.slug}</h2>
            <h3 className={pageStyles.highlight}>{content.highlight}</h3>
            <div className={styles.circleContainer}>
                {content.circles.map((circle, index) => {
                    return (
                        <div key={index} className={styles.circle}>
                            {!index ?
                                <LeftCircle circle={circle} /> :
                                index === 1 ?
                                    <Image width={0}
                                        height={0}
                                        sizes="(max-width: 768px) 100vw, 50vw" className={styles.circleImage} src={circle.img} alt='showcase' /> :
                                    <RightCircle circle={circle} />}
                        </div>
                    );
                })}
            </div>
        </section>
    )
}