import ResponsiveImage from '@/utils/components/Image/Image'
import content from './details.json'
import { IconoirArrowUpRight } from '@/utils/components/icons'
import Link from 'next/link'

export default function Details() {
    return (
        <section style={{ padding: '8vw 15.975vw', display: 'flex', gap: '2.75vw' }}>
            <ResponsiveImage
                skeleton sizes={[32, 43, 95]}
                src={content.img} alt="service-details"
                style={{ width: '31.77vw', height: '22.62vw', objectFit: 'cover' }}
            />

            <div style={{ flex: 1, borderLeft: '1px solid white', display: 'flex', flexDirection: 'column' }}>
                <div style={{ borderBottom: '1px solid white', padding: '1.5vw' }}>
                    <strong style={{
                        fontSize: '0.83vw', color: 'var(--ac-primary)', textTransform: 'uppercase', fontWeight: 'normal',


                    }}>{content.slug}</strong>
                    <h2 style={{
                        fontSize: '3.33vw',
                    }}>{content.title}</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', flex: 1, padding: '1.5vw' }}>
                    <Link href={content.link.url} style={{ display: 'flex', gap: '1.5vw', alignItems: 'center' }}>
                        <div style={{
                            width: '5.21vw', height: '5.21vw', borderRadius: '50%', border: '1px solid white', display: 'flex', justifyContent: 'center', alignItems: 'center'
                        }}>
                            <IconoirArrowUpRight style={{ width: '50%', height: '50%', color: 'var(--ac-primary)' }} />
                        </div>
                        <span style={{ width: '40%', fontSize: '0.83vw', lineHeight: '1.75', textTransform: 'uppercase' }}>
                            {content.link.text}
                        </span>
                    </Link>
                </div>
            </div>
        </section>
    )
}
