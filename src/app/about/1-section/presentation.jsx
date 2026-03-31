import styles from "./presentation.module.css";
import ProgressBars from "./components/ProgressBars";

export default function Presentation() {
  return (
    <div className={styles.container}>
      <div className={styles.first}>
        <h3>Trusted Experience</h3>
        <h2>Nous sommes une équipe d&apos;experts qualifiés.</h2>
        <p>
          Nous travaillons pour garantir le confort des gens chez eux et des
          lieux publics qu&apos;ils visitent, pour fournir la meilleure et la plus
          rapide des aides à des prix justes et raisonnables.
        </p>
      </div>
      <ProgressBars />
    </div>
  );
}
