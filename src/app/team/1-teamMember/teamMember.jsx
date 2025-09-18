import styles from "./teamMember.module.css";
import React from "react";
import data from "./teamMember.json";
export default function teamMember() {
  return (
    <div className={styles.container}>
      <div className={styles.imageContainer}></div>
      <div className={styles.infoContainer}>
        <h2>{data.heading}</h2>
        <p>{data.paragraph}</p>
        <div className={styles.memberInfo}>
          <div className={styles.memberCard}>
            <img src={data.member.image} alt={data.member.name} title={data.member.name} />
            <h3>{`${data.member.name} ${data.member.position}`}</h3>
          </div>
          <div className={styles.memberAutograph}>
            <img src={data.member.autographImage} alt={`Autograph of ${data.member.name}`} title={`Autograph of ${data.member.name}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
