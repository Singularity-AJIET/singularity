"use client";
import styles from "./loading.module.css";

export default function Loading() {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.loaderInner}>
        <div className={styles.loaderText}>
          &gt; SYS_LOADING
          <span className={styles.cursor}></span>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill}></div>
        </div>
      </div>
    </div>
  );
}
