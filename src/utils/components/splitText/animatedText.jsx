import React from 'react';
import styles from './animatedText.module.css';
import { useAnimatedTextLogic } from './animatedText.func';
import AnimateTextCRS from './animateText.client';

export default function AnimatedText({ text, parse, selector, delay }) {
    const { parseValues, textSplits } = useAnimatedTextLogic(text, parse);
    return (
        <>
            <AnimateTextCRS selector={selector} delay={delay} />

            {parseValues.length === 1 ? (
                textSplits[0].map((line, index) => (
                    <span
                        key={`${line}-${index}`}
                        className={`${styles.line} ${index === textSplits[0].length - 1 ? styles.lastLine : ''}`}
                    >
                        {line}
                    </span>
                ))
            ) : parseValues.length === 2 ? (
                <>
                    {textSplits[0].map((line, index) => (
                        <span
                            key={`desktop-${line}-${index}`}
                            className={`${styles.line} ${styles.desktop} ${index === textSplits[0].length - 1 ? styles.lastLine : ''}`}
                        >
                            {line}
                        </span>
                    ))}
                    {textSplits[1].map((line, index) => (
                        <span
                            key={`mobile-${line}-${index}`}
                            className={`${styles.line} ${styles.mobile} ${index === textSplits[1].length - 1 ? styles.lastLine : ''}`}
                        >
                            {line}
                        </span>
                    ))}
                </>
            ) : (
                <>
                    {textSplits[0].map((line, index) => (
                        <span
                            key={`desktop-${line}-${index}`}
                            className={`${styles.line} ${styles.desktop} ${index === textSplits[0].length - 1 ? styles.lastLine : ''}`}
                        >
                            {line}
                        </span>
                    ))}
                    {textSplits[1].map((line, index) => (
                        <span
                            key={`tablet-${line}-${index}`}
                            className={`${styles.line} ${styles.tablet} ${index === textSplits[1].length - 1 ? styles.lastLine : ''}`}
                        >
                            {line}
                        </span>
                    ))}
                    {textSplits[2].map((line, index) => (
                        <span
                            key={`mobile-${line}-${index}`}
                            className={`${styles.line} ${styles.mobile} ${index === textSplits[2].length - 1 ? styles.lastLine : ''}`}
                        >
                            {line}
                        </span>
                    ))}
                </>
            )}
        </>
    );
}