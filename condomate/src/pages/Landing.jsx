import React from "react";
import { Link } from "react-router-dom";
import { Home, LayoutDashboard } from "lucide-react";

export default function Landing() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, padding: 20 }}>
      <div style={{ textAlign: "center" }}>
        <div className="cm-display" style={{ fontWeight: 700, fontSize: 28 }}>CondoMate</div>
        <span className="cm-mono" style={{ fontSize: 11, color: "var(--ink-soft)", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 999, padding: "2px 10px" }}>
          PHASE 1 · MVP
        </span>
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
        <Link to="/resident" className="cm-card" style={{ width: 220, padding: 22, textDecoration: "none", color: "var(--ink)", textAlign: "center" }}>
          <Home size={22} />
          <div style={{ fontWeight: 700, fontSize: 15, marginTop: 10 }}>ลูกบ้าน</div>
          <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4 }}>แจ้งซ่อม · พัสดุ · ประกาศ · จองส่วนกลาง</div>
        </Link>
        <Link to="/admin" className="cm-card" style={{ width: 220, padding: 22, textDecoration: "none", color: "var(--ink)", textAlign: "center" }}>
          <LayoutDashboard size={22} />
          <div style={{ fontWeight: 700, fontSize: 15, marginTop: 10 }}>นิติบุคคล</div>
          <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4 }}>Dashboard · จัดการงาน · ลูกบ้าน</div>
        </Link>
      </div>
    </div>
  );
}
