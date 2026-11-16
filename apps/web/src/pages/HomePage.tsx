import React from "react";
import { Link } from "react-router-dom";
import styles from "./HomePage.module.css";

export function HomePage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Understand your code.<br />Document your project.</h1>
      <p className={styles.subtitle}>
        RepoLens scans your repository, extracts structure and dependencies,
        and generates accurate documentation — based on what's actually in the code.
      </p>

      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>🔍</div>
          <h3>Scan</h3>
          <p>Analyze languages, frameworks, functions, classes, and API endpoints.</p>
          <Link to="/scan" className={styles.cardLink}>Start scanning →</Link>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>📄</div>
          <h3>Generate</h3>
          <p>Create README, API reference, setup guide, and architecture overview.</p>
          <Link to="/docs" className={styles.cardLink}>View docs →</Link>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>🔔</div>
          <h3>Detect Changes</h3>
          <p>Know when documentation is outdated due to code changes.</p>
          <Link to="/scan" className={styles.cardLink}>Check status →</Link>
        </div>
      </div>

      <div className={styles.cli}>
        <h2>CLI Quick Start</h2>
        <pre className={styles.code}>{`npx repolens init
npx repolens scan
npx repolens generate
npx repolens check`}</pre>
      </div>
    </div>
  );
}
