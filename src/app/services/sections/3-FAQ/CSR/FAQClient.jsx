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
            <strong className={styles.questionText} style={{ color: activeIndex === index ? 'var(--ac-primary)' : 'white' }}>{qa.Q}</strong>
            <IconoirArrowUpRight
              strokeWidth={2.5}
              className={styles.icon}
            />
          </div>
          <div
            className={`${styles.answer} ${activeIndex === index ? styles.answerActive : styles.answerInactive}`}
            style={{
              height: activeIndex === index ? `${heights[index]}px` : '0'
            }}
          >
            <p ref={el => answerRefs.current[index] = el}>{qa.A}</p>
          </div>
        </div>
      ))}
    </div>
  )
} 