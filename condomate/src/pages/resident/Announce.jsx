import React from "react";
import { useData } from "../../data/store";
import SectionTitle from "../../components/SectionTitle";

export default function ResidentAnnounce() {
  const { data } = useData();
  return (
    <div>
      <SectionTitle sub="ข่าวสารจากนิติบุคคล">ประกาศ</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.announcements.length === 0 && <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>ยังไม่มีประกาศ</div>}
        {data.announcements.map((a) => (
          <div key={a.id} className="cm-card" style={{ padding: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14.5 }}>📢 {a.title}</div>
            <div className="cm-mono" style={{ fontSize: 12, color: "var(--ink-soft)", margin: "4px 0" }}>{a.date} · {a.time}</div>
            <div style={{ fontSize: 13, color: "var(--ink)" }}>{a.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
