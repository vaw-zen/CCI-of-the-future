import React from 'react'
import styles from './serviceDetails.module.css'
import ResponsiveImage from '@/utils/components/Image/Image'

export default function ServiceDetails({ title, text, image, className }) {
  const imageSrc = typeof image === 'string' ? image : image?.src
  const imageAlt = typeof image === 'object' ? (image.alt || image.title || title) : title
  const imageTitle = typeof image === 'object' ? (image.title || title) : title

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={`${styles.body} ${imageSrc ? styles.withImage : ''}`}>
        <div className={styles.content}>
          <h2 className={styles.title}>
            {title}
          </h2>
          <div className={styles.textContainer}>
            <p className={styles.text}>
              {text}
            </p>
          </div>
        </div>
        {imageSrc && (
          <div className={styles.imageWrap}>
            <ResponsiveImage
              src={imageSrc}
              alt={imageAlt}
              title={imageTitle}
              sizes={['32vw', '100vw', '100vw']}
              className={styles.image}
              skeleton
            />
          </div>
        )}
      </div>
    </div>
  )
}
