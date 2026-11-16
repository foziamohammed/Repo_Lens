import React, { useState } from "react";
import type { ScanResult } from "@repolens/shared";
import styles from "./ScanPage.module.css";

const API = "/api";

export function ScanPage() {
  const [repoPath, setRepoPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  async function handleScan() {
    if (!repoPath.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: repoPath }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Scan failed");
      }

      const data: ScanResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Scan Repository</h1>
      <p className={styles.subtitle}>Enter the local path to a repository to analyze.</p>

      <div className={styles.form}>
        <input
          className={styles.input}
          type="text"
          placeholder="/Users/you/projects/my-app"
          value={repoPath}
          onChange={(e) => setRepoPath(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleScan()}
        />
        <button className={styles.button} onClick={handleScan} disabled={loading || !repoPath.trim()}>
          {loading ? "Scanning..." : "Scan"}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {result && (
        <div className={styles.results}>
          <h2>{result.meta.name}</h2>
          <p className={styles.meta}>Scanned {result.files.length} files · {result.meta.scannedAt}</p>

          <div className={styles.grid}>
            <StatCard label="Files" value={result.files.length} />
            <StatCard label="Functions" value={result.functions.length} />
            <StatCard label="Classes" value={result.classes.length} />
            <StatCard label="Dependencies" value={result.dependencies.length} />
          </div>

          {result.frameworks.length > 0 && (
            <div className={styles.section}>
              <h3>Frameworks</h3>
              <div className={styles.tags}>
                {result.frameworks.map((f) => <span key={f} className={styles.tag}>{f}</span>)}
              </div>
            </div>
          )}

          <div className={styles.section}>
            <h3>Languages</h3>
            <div className={styles.tags}>
              {Object.entries(result.languages).map(([lang, count]) => (
                <span key={lang} className={styles.tag}>{lang} ({count})</span>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h3>Directory Structure</h3>
            <FileTree files={result.files.slice(0, 50)} />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

function FileTree({ files }: { files: { path: string }[] }) {
  return (
    <ul className={styles.fileList}>
      {files.map((f) => (
        <li key={f.path} className={styles.fileItem}>{f.path}</li>
      ))}
    </ul>
  );
}
