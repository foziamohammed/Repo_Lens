import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import styles from "./MermaidDiagram.module.css";

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  themeVariables: {
    primaryColor: "#6c8ef7",
    primaryTextColor: "#e2e8f0",
    primaryBorderColor: "#2d3148",
    lineColor: "#8892a4",
    secondaryColor: "#1a1d27",
    tertiaryColor: "#0f1117",
    background: "#1a1d27",
    mainBkg: "#1a1d27",
    nodeBorder: "#2d3148",
    clusterBkg: "#0f1117",
    titleColor: "#e2e8f0",
    edgeLabelBackground: "#1a1d27",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  flowchart: { curve: "basis" },
});

let diagramCounter = 0;

interface Props {
  source: string;
}

export function MermaidDiagram({ source }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const id = `mermaid-${++diagramCounter}`;

    async function render() {
      try {
        await mermaid.parse(source); // validate first
        const { svg } = await mermaid.render(id, source);
        if (!cancelled) {
          setSvg(svg);
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? "Failed to render diagram");
          setSvg(null);
        }
      }
    }

    render();
    return () => { cancelled = true; };
  }, [source]);

  if (error) {
    return (
      <div className={styles.error}>
        <span className={styles.errorLabel}>Diagram error</span>
        <pre className={styles.errorSource}>{source}</pre>
        <pre className={styles.errorMsg}>{error}</pre>
      </div>
    );
  }

  if (!svg) {
    return <div className={styles.loading}>Rendering diagram…</div>;
  }

  return (
    <div
      className={styles.diagram}
      ref={ref}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
