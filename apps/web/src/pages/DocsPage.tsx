import React, { useState } from "react";
import type { GeneratedDocs } from "@repolens/shared";
import styles from "./DocsPage.module.css";

const API = "/api";

type TabId = "readme" | "setup" | "architecture" | "api";

export function DocsPage() {
  const [repoPath, setRepoPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docs, setDocs] = useState<GeneratedDocs | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("readme");

  async function handleGenerate() {
    if (!repoPath.trim()) return;
    setLoading(true);
    setError(null);
    setDocs(null);

    try {
      const res = await fetch(`${API}/docs/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: repoPath }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Generation failed");
      }

      const data: { docs: GeneratedDocs } = await res.json();
      setDocs(data.docs);
      setActiveTab("readme");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "readme", label: "README" },
    { id: "setup", label: "Setup" },
    { id: "architecture", label: "Architecture" },
    ...(docs?.api ? [{ id: "api" as TabId, label: "API" }] : []),
  ];

  const activeContent =
    docs && activeTab === "readme"
      ? docs.readme.content
      : docs && activeTab === "setup"
      ? docs.setup.content
      : docs && activeTab === "architecture"
      ? docs.architecture.content
      : docs?.api?.content ?? "";

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Generate Documentation</h1>
      <p className={styles.subtitle}>Enter a repository path to scan and generate docs in one step.</p>

      <div className={styles.form}>
        <input
          className={styles.input}
          type="text"
          placeholder="/Users/you/projects/my-app"
          value={repoPath}
          onChange={(e) => setRepoPath(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
        />
        <button className={styles.button} onClick={handleGenerate} disabled={loading || !repoPath.trim()}>
          {loading ? "Generating..." : "Generate Docs"}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {docs && (
        <div className={styles.docViewer}>
          <div className={styles.tabs}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={activeTab === tab.id ? styles.tabActive : styles.tab}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <pre className={styles.content}>{activeContent}</pre>
        </div>
      )}
    </div>
  );
}
