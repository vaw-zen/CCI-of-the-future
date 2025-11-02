import { useState, useEffect, useRef } from 'react'

export function useTabLogic(activeTab) {
  const [selectorStyle, setSelectorStyle] = useState({ transform: 'translateX(0)', width: 0, top: 0 })
  const tabRefs = useRef({})
  const containerRef = useRef(null)

  useEffect(() => {
    const activeTabElement = tabRefs.current[activeTab]
    if (activeTabElement) {
      // Use requestAnimationFrame to batch layout reads
      const rafId = requestAnimationFrame(() => {
        const { offsetLeft, offsetWidth, offsetTop, offsetHeight } = activeTabElement
        setSelectorStyle({
          transform: `translate(${offsetLeft}px, ${offsetTop + offsetHeight}px)`,
          width: offsetWidth,
          top: 0 // Set in CSS, not JS
        })
      })
      
      return () => cancelAnimationFrame(rafId)
    }
  }, [activeTab])

  return {
    selectorStyle,
    tabRefs,
    containerRef
  }
}
