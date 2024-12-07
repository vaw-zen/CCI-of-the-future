'use client'
import { RadixIconsCaretRight } from '@/app/utils/components/icons'
import { useState } from 'react'
import styles from '../../showcase.module.css'
import { useShowcaseCircle } from './circles.func'

export default function LeftCircle({ circle }) {
    const [selected, setSelected] = useState(-1)
    const { refs, handleFocus, handleBlur, handleClick } = useShowcaseCircle(circle)



    return <>
        <div className={styles.shadow} />
        <div className={styles.leftCircle}>
            {circle.map((element, index) => (
                <div
                    key={index}
                    ref={refs.current[index]}
                    tabIndex={0}
                    onClick={() => handleClick(index, selected, setSelected)}
                    onFocus={() => handleFocus(index)}
                    onBlur={(e) => handleBlur(e, selected, setSelected, refs)}
                    className={styles.item}
                    style={{ height: index === selected ? '3vw' : '2vw' }}
                >
                    <div className={styles.titleContainer}>
                        <h3
                            className={styles.title}
                            style={{ color: index === selected ? 'var(--ac-primary)' : 'var(--t-primary)' }}
                        >
                            {element.title}
                        </h3>
                        <RadixIconsCaretRight
                            className={styles.caret}
                            style={{ opacity: index === selected ? 0 : 1 }}
                        />
                    </div>

                    {index === selected && (
                        <p className={styles.description}>
                            {element.desc}
                        </p>
                    )}
                </div>
            ))}
        </div>
    </>
}
