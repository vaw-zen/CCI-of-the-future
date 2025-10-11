import styles from "./teamMember.module.css";
import React from "react";
import data from "./teamMember.json";
import ResponsiveImage from '@/utils/components/Image/Image';
export default function teamMember() {
  return (
    <div className={styles.container}>
      <div className={styles.imageContainer}></div>
      <div className={styles.infoContainer}>
        <h2>{data.heading}</h2>
        <p>{data.paragraph}</p>
        <div className={styles.memberInfo}>
          <div className={styles.memberCard}>
            <ResponsiveImage src={data.member.image} alt={data.member.name} title={data.member.name} sizes={[15, 20, 25]} />
            <h3>{`${data.member.name} ${data.member.position}`}</h3>
          </div>
          <div className={styles.memberAutograph}>
            <ResponsiveImage src={data.member.autographImage} alt={`Autograph of ${data.member.name}`} title={`Autograph of ${data.member.name}`} sizes={[10, 15, 20]} />
          </div>
        </div>
      </div>
    </div>
  );
}
