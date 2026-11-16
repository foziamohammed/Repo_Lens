import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import { HomePage } from "./pages/HomePage.js";
import { ScanPage } from "./pages/ScanPage.js";
import { DocsPage } from "./pages/DocsPage.js";
import styles from "./App.module.css";

export function App() {
  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🔍</span>
          <span>RepoLens</span>
        </div>
        <nav className={styles.nav}>
          <NavLink to="/" end className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}>
            Home
          </NavLink>
          <NavLink to="/scan" className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}>
            Scan
          </NavLink>
          <NavLink to="/docs" className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}>
            Docs
          </NavLink>
        </nav>
      </aside>
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/docs" element={<DocsPage />} />
        </Routes>
      </main>
    </div>
  );
}
