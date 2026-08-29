import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, textAlign: "center", padding: 20 }}>
      <div className="cm-display" style={{ fontSize: 40, fontWeight: 700 }}>404</div>
      <p style={{ fontSize: 14, color: "var(--ink-soft)", margin: 0 }}>ไม่พบหน้านี้</p>
      <Link to="/" className="cm-btn" style={{ textDecoration: "none", marginTop: 8, display: "inline-block" }}>กลับหน้าแรก</Link>
    </div>
  );
}
