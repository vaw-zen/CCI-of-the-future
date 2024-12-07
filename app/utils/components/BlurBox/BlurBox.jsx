import React from 'react'
import styles from './BlurBox.module.css'

export default function BlurBox({ style, className }) {
    return <div className={styles.blurBox + (className ? ' ' + className : '')} style={style || null} />
}
