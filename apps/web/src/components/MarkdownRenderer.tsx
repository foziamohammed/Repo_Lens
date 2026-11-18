import React from "react";
import { MermaidDiagram } from "./MermaidDiagram.js";
import styles from "./MarkdownRenderer.module.css";

interface Props {
  content: string;
}

type Block =
  | { type: "mermaid"; source: string }
  | { type: "code"; lang: string; source: string }
  | { type: "markdown"; lines: string[] };

/**
 * Splits markdown content into blocks, renders mermaid fences as
 * live diagrams and everything else as styled markdown text.
 */
export function MarkdownRenderer({ content }: Props) {
  const blocks = parse(content);

  return (
    <div className={styles.root}>
      {blocks.map((block, i) => {
        if (block.type === "mermaid") {
          return (
            <div key={i} className={styles.diagramWrapper}>
              <MermaidDiagram source={block.source} />
            </div>
          );
        }

        if (block.type === "code") {
          return (
            <pre key={i} className={styles.codeBlock}>
              <code>{block.source}</code>
            </pre>
          );
        }

        // Markdown block — render line by line
        return (
          <div key={i} className={styles.prose}>
            {block.lines.map((line, j) => renderLine(line, j))}
          </div>
        );
      })}
    </div>
  );
}

// ── parser ────────────────────────────────────────────────────────────────────

function parse(content: string): Block[] {
  const lines = content.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const fenceMatch = line.match(/^```(\w*)$/);

    if (fenceMatch) {
      const lang = fenceMatch[1];
      const fenceLines: string[] = [];
      i++;

      while (i < lines.length && lines[i] !== "```") {
        fenceLines.push(lines[i]);
        i++;
      }
      i++; // consume closing ```

      if (lang === "mermaid") {
        blocks.push({ type: "mermaid", source: fenceLines.join("\n") });
      } else {
        blocks.push({ type: "code", lang, source: fenceLines.join("\n") });
      }
    } else {
      // Collect consecutive non-fence lines into a markdown block
      const mdLines: string[] = [];
      while (i < lines.length && !lines[i].match(/^```/)) {
        mdLines.push(lines[i]);
        i++;
      }
      if (mdLines.some((l) => l.trim())) {
        blocks.push({ type: "markdown", lines: mdLines });
      }
    }
  }

  return blocks;
}

// ── line renderer ─────────────────────────────────────────────────────────────

function renderLine(line: string, key: number): React.ReactNode {
  // Headings
  const h1 = line.match(/^# (.+)/);
  if (h1) return <h1 key={key} className={styles.h1}>{inline(h1[1])}</h1>;

  const h2 = line.match(/^## (.+)/);
  if (h2) return <h2 key={key} className={styles.h2}>{inline(h2[1])}</h2>;

  const h3 = line.match(/^### (.+)/);
  if (h3) return <h3 key={key} className={styles.h3}>{inline(h3[1])}</h3>;

  // Blockquote
  const bq = line.match(/^> (.+)/);
  if (bq) return <blockquote key={key} className={styles.blockquote}>{inline(bq[1])}</blockquote>;

  // Horizontal rule
  if (line.match(/^---+$/)) return <hr key={key} className={styles.hr} />;

  // Table row
  if (line.startsWith("|")) return <TableRow key={key} line={line} />;

  // List item
  const li = line.match(/^(\s*)[-*] (.+)/);
  if (li) {
    const indent = li[1].length;
    return (
      <div key={key} className={styles.listItem} style={{ paddingLeft: `${16 + indent * 12}px` }}>
        <span className={styles.bullet}>•</span>
        <span>{inline(li[2])}</span>
      </div>
    );
  }

  // Empty line
  if (!line.trim()) return <div key={key} className={styles.spacer} />;

  // Plain paragraph
  return <p key={key} className={styles.p}>{inline(line)}</p>;
}

function TableRow({ line }: { line: string }) {
  const cells = line.split("|").map((c) => c.trim()).filter((c) => c !== "");
  const isSeparator = cells.every((c) => /^[-:]+$/.test(c));
  if (isSeparator) return null;

  return (
    <div className={styles.tableRow}>
      {cells.map((cell, i) => (
        <div key={i} className={styles.tableCell}>{inline(cell)}</div>
      ))}
    </div>
  );
}

// ── inline formatting ─────────────────────────────────────────────────────────

function inline(text: string): React.ReactNode {
  // Split on **bold**, *italic*, `code`, and plain text
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className={styles.inlineCode}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}
