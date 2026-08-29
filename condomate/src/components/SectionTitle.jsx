import React from "react";

export default function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2 className="cm-display" style={{ fontSize: 19, fontWeight: 700, margin: 0 }}>{children}</h2>
      {sub && <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "3px 0 0" }}>{sub}</p>}
    </div>
  );
}
