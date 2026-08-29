import React from "react";
import { STATUS_META } from "../data/seed";

export default function StatusPill({ status }) {
  const m = STATUS_META[status];
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 700, color: m.color }}>
      <span className="cm-dot" style={{ background: m.color }} />
      {m.label}
    </span>
  );
}
