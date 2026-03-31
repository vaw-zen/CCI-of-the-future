import { dimensionsStore } from '@/utils/store/store'
import { useState, useRef, useEffect, useMemo, useCallback } from 'react'

export function useFAQLogic(QA) {
  const { isMobile, isTablet, isDesktop, vw } = dimensionsStore()

  const [activeIndex, setActiveIndex] = useState(null)
  const [heights, setHeights] = useState({})
  const answerRefs = useRef([])

  const parentPadding = useMemo(() => (
    isDesktop() ? vw * 0.0104 : isTablet() ? vw * 0.026 : isMobile() ? vw * 0.05 : 0
  ), [isDesktop, isMobile, isTablet, vw])

  useEffect(() => {
    answerRefs.current = answerRefs.current.slice(0, QA.length)
  }, [QA.length])

  const updateHeight = useCallback((index, element) => {
    if (!element) return

    const nextHeight = element.scrollHeight + parentPadding
    setHeights((prev) => {
      if (prev[index] === nextHeight) {
        return prev
      }

      return {
        ...prev,
        [index]: nextHeight
      }
    })
  }, [parentPadding])

  const setAnswerRef = useCallback((index) => (element) => {
    answerRefs.current[index] = element

    if (!element) return

    requestAnimationFrame(() => {
      updateHeight(index, element)
    })
  }, [updateHeight])

  useEffect(() => {
    const elements = answerRefs.current.filter(Boolean)
    if (elements.length === 0) return

    const frameId = requestAnimationFrame(() => {
      answerRefs.current.forEach((element, index) => {
        if (element) {
          updateHeight(index, element)
        }
      })
    })

    if (typeof ResizeObserver === 'undefined') {
      return () => cancelAnimationFrame(frameId)
    }

    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const index = answerRefs.current.indexOf(entry.target)
        if (index !== -1) {
          updateHeight(index, entry.target)
        }
      })
    })

    elements.forEach((element) => resizeObserver.observe(element))

    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
    }
  }, [QA.length, updateHeight])

  const toggleQuestion = (index) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return {
    activeIndex,
    heights,
    setAnswerRef,
    toggleQuestion
  }
} 
