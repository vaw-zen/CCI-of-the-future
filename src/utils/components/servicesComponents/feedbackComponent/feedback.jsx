import Link from "next/link";
import { UilArrowRight } from "../../icons";
import styles from './feedback.module.css';

export default function Feedback() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <img 
          src="https://uploads-ssl.webflow.com/63c6818603ef9ce50c6d563d/63d25d112da90204c5cbab7e_feedback-image-1.jpg" 
          alt="Feedback"
          className={styles.feedbackImage}
        />

        <div className={styles.infoContainer}>
          <h3 className={styles.title}>
            Excellent
          </h3>

          <img 
            src="https://uploads-ssl.webflow.com/63c6818603ef9ce50c6d563d/63d25e0d7c06818293917976_ratings-image.png"
            alt="5 stars"
            className={styles.ratingImage}
          />

          <p className={styles.trustScore}>
            Trust score 5.0 based on 1500 reviews
          </p>

          <div className={styles.readMoreContainer}>
            <Link href="/" className={styles.iconContainer}>
              <UilArrowRight className={styles.icon} />
            </Link>
            <span className={styles.readMoreText}>
              READ FEEDBACK
            </span>
          </div>
        </div>

        <img
          src="https://uploads-ssl.webflow.com/63c6818603ef9ce50c6d563d/63d25d11b6d5727548c2d785_feedback-image-2.jpg"
          alt="Feedback"
          className={styles.feedbackImage}
        />
      </div>
    </div>
  )
}
