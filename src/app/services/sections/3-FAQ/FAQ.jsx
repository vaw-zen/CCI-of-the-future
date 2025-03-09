'use client'
import ResponsiveImage from '@/utils/components/Image/Image'
import content from './FAQ.json'
import { useState, useRef, useEffect } from 'react'

export default function FAQ() {
  const { img, title, slug, QA } = content
  const [activeIndex, setActiveIndex] = useState(null)
  const [heights, setHeights] = useState({})
  const answerRefs = useRef([])

  // Initialize or update refs array when QA changes
  useEffect(() => {
    answerRefs.current = answerRefs.current.slice(0, QA.length)
  }, [QA])

  // Measure heights of all answers
  useEffect(() => {
    const newHeights = {}
    
    answerRefs.current.forEach((ref, index) => {
      if (ref) {
        // Store the scroll height (actual content height)
        newHeights[index] = ref.scrollHeight
      }
    })
    
    setHeights(newHeights)
  }, [QA]) // Re-measure if QA content changes

  return (
    <section style={{ display: 'flex', gap: '2.60vw', marginTop: '5.99vw' }}>
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',paddingBottom:'1vw', 
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
              <strong 
                onClick={() => setActiveIndex(activeIndex === index ? null : index)} 
                style={{ 
                  fontSize: '1.35vw', 
                  fontWeight: 700, 
                  borderBottom: '1px solid white', 
                  padding: '1.04vw 0', 
                  display: 'block',
                  cursor: 'pointer'
                }}
              >
                {qa.Q}
              </strong>
              <div 
                style={{ 
                  fontSize: '0.83vw', 
                  fontWeight: 400, 
                  paddingTop: activeIndex === index ? '1.04vw' : '0', 
                  height: activeIndex === index ? `${heights[index]}px` : '0', 
                  overflow: 'hidden', 
                  transition: 'padding 0.3s ease-in-out, height 0.3s ease-in-out, margin-bottom 0.3s ease-in-out' ,
                  marginBottom:activeIndex === index ?'-2vw': '0' 
                }}
              >
                <p 
                  ref={el => answerRefs.current[index] = el}
                >
                  {qa.A}
                </p>
              </div>
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
