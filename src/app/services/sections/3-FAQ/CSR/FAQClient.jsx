'use client'
import { useFAQLogic } from '../FAQ.func'
import { IconoirArrowUpRight } from '@/utils/components/icons'
import styles from '../FAQ.module.css'

export default function FAQQuestions({ QA }) {
  const { activeIndex, heights, answerRefs, toggleQuestion } = useFAQLogic(QA)
  
  return (
    <div className={styles.questions}>
      {QA.map((qa, index) => (
        <div key={index} className={styles.questionBlock}>
          <div
            onClick={() => toggleQuestion(index)}
            className={styles.question}
          >
            <strong className={styles.questionText}>{qa.Q}</strong>
            <IconoirArrowUpRight
              strokeWidth={2.5}
              className={styles.icon}
            />
          </div>
          <div
            className={styles.answer}
            style={{
              paddingTop: activeIndex === index ? '1.04vw' : '0',
              height: activeIndex === index ? `${heights[index]}px` : '0',
              marginBottom: activeIndex === index ? '-2vw' : '0'
            }}
          >
            <p ref={el => answerRefs.current[index] = el}>{qa.A}</p>
          </div>
        </div>
      ))}
    </div>
  )
} 