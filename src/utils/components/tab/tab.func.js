import { useState, useEffect, useRef } from 'react'

export function useTabLogic(activeTab) {
  const [selectorStyle, setSelectorStyle] = useState({ left: 0, width: 0, top: 0 })
  const tabRefs = useRef({})
  const containerRef = useRef(null)

  useEffect(() => {
    const activeTabElement = tabRefs.current[activeTab]
    if (activeTabElement) {
      const { offsetLeft, offsetWidth, offsetTop, offsetHeight } = activeTabElement
      setSelectorStyle({
        left: offsetLeft,
        width: offsetWidth,
        top: offsetTop + offsetHeight
      })
    }
  }, [activeTab])

  return {
    selectorStyle,
    tabRefs,
    containerRef
  }
}
