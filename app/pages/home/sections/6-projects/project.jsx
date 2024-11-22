import content from './projects.json'
import pageStyles from '../../home.module.css'

export default function Project() {
    return <section style={{ position: 'relative', marginTop: '7.5vw', display: 'flex', gap: '1.5625vw' }}>
        <div style={{ width: '38.5848vw' }}>
            <h2 className={pageStyles.slug}>{content.slug}</h2>
            <h3 className={pageStyles.highlight}>{content.highlight}</h3>
            <div style={{ height: '28.9584vw', width: '100%', display: 'flex', marginTop: '3vw', overflow: 'hidden' }}>
                <img style={{ flex: 1, objectFit: 'cover' }} src={content.lefSide.img} />
            </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5625vw', marginTop: '3vw' }}>
            <img style={{ width: '100%', objectFit: 'cover', height: '20vw' }} src='/home/about.png' />
            <img style={{ width: '100%', objectFit: 'cover', height: '20vw' }} src='/home/about.png' />

        </div>
    </section>
}
