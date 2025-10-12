import Link from "next/link";
import { UilArrowRight } from "../../icons";
import styles from './feedback.module.css';
import ResponsiveImage from '@/utils/components/Image/Image';

export default function Feedback() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <ResponsiveImage 
          src="/feedback/content (2).jpeg" 
          alt="Customer feedback preview"
          title="Customer feedback preview"
          className={styles.feedbackImage}
          sizes={[25, 35, 45]}
        />

        <div className={styles.infoContainer}>
          <h3 className={styles.title}>
            Excellent
          </h3>

          <ResponsiveImage 
            src="https://uploads-ssl.webflow.com/63c6818603ef9ce50c6d563d/63d25e0d7c06818293917976_ratings-image.png"
            alt="5 star rating image"
            title="5 star rating"
            className={styles.ratingImage}
            sizes={[12, 15, 20]}
          />

          <p className={styles.trustScore}>
            Score 5.0 basé sur nos avis clients
          </p>

          <div className={styles.readMoreContainer}>
            <Link href="/contact" className={styles.iconContainer}>
              <UilArrowRight className={styles.icon} />
            </Link>
            <span className={styles.readMoreText}>
              READ FEEDBACK
            </span>
          </div>
        </div>

        <ResponsiveImage
          src="/feedback/content (1).jpeg"
          alt="Customer feedback preview"
          title="Customer feedback preview"
          className={styles.feedbackImage}
          sizes={[25, 35, 45]}
        />
      </div>
    </div>
  )
}
