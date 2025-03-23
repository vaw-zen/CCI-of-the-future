'use client'
import { useState, useCallback, useMemo } from 'react'

export function useFaqLogic(faqs) {
    const [activeIndex, setActiveIndex] = useState(null);

    // Handle toggle for FAQ items
    const handleToggle = useCallback((index) => {
        setActiveIndex(prevIndex => prevIndex === index ? null : index);
    }, []);

    // Memoize the FAQ columns to prevent unnecessary re-calculations
    const faqColumns = useMemo(() => {
        const leftColumn = faqs.filter((_, idx) => idx % 2 === 0);
        const rightColumn = faqs.filter((_, idx) => idx % 2 === 1);
        return { leftColumn, rightColumn };
    }, [faqs]);

    return {
        activeIndex,
        handleToggle,
        leftColumnItems: faqColumns.leftColumn,
        rightColumnItems: faqColumns.rightColumn
    };
} 