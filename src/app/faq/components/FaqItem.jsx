'use client'
import { memo, useRef, useState, useEffect } from 'react'
import { LineMdPlus } from '@/utils/components/icons'
import styles from '../page.module.css'

const FaqItem = memo(({ faq, index, isActive, onToggle }) => {
    const contentRef = useRef(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        if (isActive) {
            const contentHeight = contentRef.current.scrollHeight;
            setHeight(contentHeight);
        }
    }, [isActive]);

    return (
        <div className={styles.faqItem}>
            <div
                onClick={() => onToggle(index)}
                className={`${styles.faqHeader} ${isActive ? styles.faqHeaderActive : ''}`}
            >
                <span className={`${styles.question} ${isActive ? styles.activeText : ''}`}>
                    {faq.question}
                </span>
                <LineMdPlus className={`${styles.icon} ${isActive ? styles.activeIcon : ''}`} />
            </div>
            <div
                ref={contentRef}
                className={styles.content}
                style={{
                    height: isActive ? `${height}px` : '0px',
                }}
            >
                <div className={styles.answer}>
                    <p>{faq.answer}</p>
                </div>
            </div>
        </div>
    );
});

FaqItem.displayName = 'FaqItem';

export default FaqItem; 