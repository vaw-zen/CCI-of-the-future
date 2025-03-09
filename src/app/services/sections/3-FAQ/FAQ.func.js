import { useState, useRef, useEffect } from 'react'

export function useFAQLogic(QA) {
  const [activeIndex, setActiveIndex] = useState(null)
  const [heights, setHeights] = useState({})
  const answerRefs = useRef([])

  useEffect(() => {
    answerRefs.current = answerRefs.current.slice(0, QA.length)
  }, [QA])

  useEffect(() => {
    const newHeights = {}
    answerRefs.current.forEach((ref, index) => {
      if (ref) newHeights[index] = ref.scrollHeight
    })
    setHeights(newHeights)
  }, [QA])

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