import { useState, useEffect, useRef } from 'react'

export function usePartnerTabLogic(tabData) {
  const [activeTab, setActiveTab] = useState(tabData?.[0]?.id || '')
  const [selectorStyle, setSelectorStyle] = useState({ left: 0, width: 0 })
  const tabRefs = useRef({})

  useEffect(() => {
    const activeTabElement = tabRefs.current[activeTab]
    if (activeTabElement) {
      const { offsetLeft, offsetWidth } = activeTabElement
      setSelectorStyle({ left: offsetLeft, width: offsetWidth })
    }
  }, [activeTab])

  return {
    activeTab,
    setActiveTab,
    selectorStyle,
    tabRefs
  }
}
