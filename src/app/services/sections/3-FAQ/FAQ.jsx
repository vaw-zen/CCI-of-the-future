import ResponsiveImage from '@/utils/components/Image/Image'
import content from './FAQ.json'

export default function FAQ() {
  const { img, title, slug, QA } = content

  return (
    <section style={{ display: 'flex', gap: '2.60vw', marginTop: '5.99vw' }}>
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column'
      }}>
        <abbr style={{
          color: 'var(--ac-primary)', fontSize: '0.83vw', textTransform: 'uppercase',
          marginBottom: '0.52vw',
        }}>
          {slug}
        </abbr>
        <strong style={{ fontSize: '3.33vw', marginBottom: '1.04vw' }}>
          {title}
        </strong>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.56vw' }}>
          {QA.map((qa, index) => {
            return <div key={index} style={{ marginBottom: '1vw' }}>
              <strong style={{ fontSize: '1.35vw', fontWeight: 700, borderBottom: '1px solid white', padding: '1.04vw 0', display: 'block' }}>
                {qa.Q}
              </strong>
            </div>
          })}
        </div>
      </div>
      <ResponsiveImage
        style={{
          flex: 1, objectFit: 'cover', objectPosition: 'center'
        }}
        src={img}
        sizes={[40, 40, 40]}
        alt='FAQ'
        skeleton
      />
    </section>
  )
}
