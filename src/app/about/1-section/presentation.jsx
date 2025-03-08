import styles from "./presentation.module.css";
import ProgressBars from "./components/ProgressBars";

export default function Presentation() {
  return (
    <div className={styles.container}>
      <div className={styles.first}>
        <h3>Trusted Experience</h3>
        <h2>We are a team of professional & skilled experts</h2>
        <p>
          We work to ensure people's comfort at their home and to provide the
          best and the fastest help at fair prices. We work to ensure people's
          comfort at their home and to provide the best and the fastest help at
          a fair price.
        </p>
      </div>
      <ProgressBars />
    </div>
  );
}
