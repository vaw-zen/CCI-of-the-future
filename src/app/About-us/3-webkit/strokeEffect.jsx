import React from 'react';
import styles from './strokeEffect.module.css';

export default function StrokeEffect() {
    return (
        <div className={styles.container}>
            <div className={styles.flexItem}>
                <div className={styles.strokeText}>10k</div>
                <div className={styles.labelText}>projects <br /> completed</div>
            </div>
            <div className={styles.flexItem}>
                <div className={styles.strokeText}>120</div>
                <div className={styles.labelText}>woked <br /> employees</div>
            </div>
            <div className={styles.flexItem}>
                <div className={styles.strokeText}>15 <h4>+</h4> </div>
                <div className={styles.labelText}>years of <br /> experience</div>
            </div>
            <div className={styles.flexItem}>
                <div className={styles.strokeText}>18 <h4>+</h4> </div>
                <div className={styles.labelText}>Skilled <br /> Professionals</div>
            </div>
           
        </div>
    );
}