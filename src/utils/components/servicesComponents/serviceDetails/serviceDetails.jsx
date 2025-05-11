import React from 'react'
import styles from './serviceDetails.module.css'
import PropTypes from 'prop-types'

export default function ServiceDetails({ title, text }) {
  return (
    <div className={styles.container}>
        <h2 className={styles.title}>
            {title}
        </h2>
        <div className={styles.textContainer}>
            <p className={styles.text}>
                {text}
            </p>
        </div>
    </div>
  )
}

ServiceDetails.propTypes = {
  title: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired
}
