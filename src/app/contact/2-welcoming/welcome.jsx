import React from "react";
import styles from "./welcome.module.css";
import WelcomeCard from "./welcomeCard";
import content from "./content.json"; // Import JSON data

export default function Welcome() {
  return (
    <div className={styles.welcome}>
      {content.welcomeCards.map((card, index) => (
        <WelcomeCard key={index} {...card} />
      ))}
    </div>
  );
}
