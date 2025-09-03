import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './markdownRenderer.module.css';

const MarkdownRenderer = ({ content, className = '' }) => {
  return (
    <div className={`${styles.markdownContainer} ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom styling for different markdown elements
          h1: ({ children }) => <h1 className={styles.h1}>{children}</h1>,
          h2: ({ children }) => <h2 className={styles.h2}>{children}</h2>,
          h3: ({ children }) => <h3 className={styles.h3}>{children}</h3>,
          h4: ({ children }) => <h4 className={styles.h4}>{children}</h4>,
          h5: ({ children }) => <h5 className={styles.h5}>{children}</h5>,
          h6: ({ children }) => <h6 className={styles.h6}>{children}</h6>,
          p: ({ children }) => <p className={styles.paragraph}>{children}</p>,
          ul: ({ children }) => <ul className={styles.ul}>{children}</ul>,
          ol: ({ children }) => <ol className={styles.ol}>{children}</ol>,
          li: ({ children }) => <li className={styles.li}>{children}</li>,
          strong: ({ children }) => <strong className={styles.strong}>{children}</strong>,
          em: ({ children }) => <em className={styles.em}>{children}</em>,
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code className={styles.inlineCode}>{children}</code>
            ) : (
              <code className={styles.codeBlock}>{children}</code>
            );
          },
          pre: ({ children }) => <pre className={styles.pre}>{children}</pre>,
          blockquote: ({ children }) => <blockquote className={styles.blockquote}>{children}</blockquote>,
          a: ({ href, children }) => (
            <a href={href} className={styles.link} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          table: ({ children }) => <table className={styles.table}>{children}</table>,
          thead: ({ children }) => <thead className={styles.thead}>{children}</thead>,
          tbody: ({ children }) => <tbody className={styles.tbody}>{children}</tbody>,
          tr: ({ children }) => <tr className={styles.tr}>{children}</tr>,
          th: ({ children }) => <th className={styles.th}>{children}</th>,
          td: ({ children }) => <td className={styles.td}>{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer; 