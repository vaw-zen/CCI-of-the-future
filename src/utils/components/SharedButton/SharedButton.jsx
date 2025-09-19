"use client";

import React from "react";
import styles from "./sharedButton.module.css";

export default function SharedButton({
  children,
  type = "button",
  disabled = false,
  onClick,
  className = "",
  noHover = false,
  ...rest
}) {
  const classes = [styles.button, noHover ? styles.noHover : "", disabled ? styles.disabled : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={classes} {...rest}>
      {children}
    </button>
  );
}


