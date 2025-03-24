'use client'
import React from 'react'
import FaqItem from './FaqItem'
import { useFaqLogic } from '../faq.func'
import styles from '../page.module.css'

export default function ClientFAQ({ faqs }) {
    const { 
        activeIndex,
        handleToggle,
        leftColumnItems,
        rightColumnItems
    } = useFaqLogic(faqs);

    return (
        <div className={styles.faqContainer}>
            {/* Left Column */}
            <div className={styles.column}>
                {leftColumnItems.map((faq, columnIndex) => {
                    const index = columnIndex * 2;
                    return (
                        <FaqItem
                            key={index}
                            faq={faq}
                            index={index}
                            isActive={activeIndex === index}
                            onToggle={handleToggle}
                        />
                    );
                })}
            </div>

            {/* Right Column */}
            <div className={styles.column}>
                {rightColumnItems.map((faq, columnIndex) => {
                    const index = columnIndex * 2 + 1;
                    return (
                        <FaqItem
                            key={index}
                            faq={faq}
                            index={index}
                            isActive={activeIndex === index}
                            onToggle={handleToggle}
                        />
                    );
                })}
            </div>
        </div>
    );
} 