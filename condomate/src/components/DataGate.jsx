import React from "react";
import { useData } from "../data/store";

export default function DataGate({ children }) {
  const { data, error, retry, session, adminSession } = useData();

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, textAlign: "center", padding: 20 }}>
        <div className="cm-display" style={{ fontSize: 18, fontWeight: 700 }}>เชื่อมต่อเซิร์ฟเวอร์ไม่ได้</div>
        <p style={{ fontSize: 13, color: "var(--ink-soft)", maxWidth: 340, margin: 0 }}>{error}</p>
        <button className="cm-btn" onClick={retry}>ลองอีกครั้ง</button>
      </div>
    );
  }

  if (!data && !session && !adminSession) return children;

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="cm-mono" style={{ fontSize: 13, color: "var(--ink-soft)" }}>กำลังโหลด…</span>
      </div>
    );
  }

  return children;
}
