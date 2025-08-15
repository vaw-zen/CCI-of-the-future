import { dimensionsStore } from '@/utils/store/store'
import { useState, useRef, useEffect } from 'react'

export function useFAQLogic(QA) {
  const { isMobile, isTablet, isDesktop, vw } = dimensionsStore()

  const [activeIndex, setActiveIndex] = useState(null)
  const [heights, setHeights] = useState({})
  const answerRefs = useRef([])
  useEffect(() => {
    answerRefs.current = answerRefs.current.slice(0, QA.length)
  }, [QA])

  useEffect(() => {
    const newHeights = {}
    answerRefs.current.forEach((ref, index) => {
      const parentPadding = isDesktop() ? vw * 0.0104 : isTablet() ? vw * 0.026 : isMobile() ? vw * 0.05 : 0

      if (ref) newHeights[index] = ref.scrollHeight + parentPadding
    })
    setHeights(newHeights)
  }, [QA, vw])

  const toggleQuestion = (index) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return {
    activeIndex,
    heights,
    answerRefs,
    toggleQuestion
  }
} 