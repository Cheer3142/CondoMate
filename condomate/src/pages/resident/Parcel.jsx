import React from "react";
import { useData } from "../../data/store";
import SectionTitle from "../../components/SectionTitle";

export default function ResidentParcel() {
  const { data, session, ackParcel } = useData();
  const all = data.parcels.filter((p) => p.room === session.room);
  const pending = all.filter((p) => !p.ack);
  const done = all.filter((p) => p.ack);

  return (
    <div>
      <SectionTitle sub="พัสดุที่มาถึงห้องของคุณ">พัสดุ</SectionTitle>
      {pending.length === 0 && done.length === 0 && <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>ยังไม่มีพัสดุ</div>}
      {pending.map((p) => (
        <div key={p.id} className="cm-card" style={{ padding: 14, marginBottom: 10, borderLeft: "3px solid var(--gold)" }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>📦 มีพัสดุของคุณ</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>{p.courier}</div>
          <div className="cm-mono" style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2 }}>มาถึง {p.time}</div>
          <button onClick={() => ackParcel(p.id)} className="cm-btn" style={{ marginTop: 10, fontSize: 13 }}>
            รับทราบ
          </button>
        </div>
      ))}
      {done.length > 0 && (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: "0.04em", margin: "16px 0 8px" }}>
            รับแล้ว
          </div>
          {done.map((p) => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--ink-soft)", padding: "6px 2px" }}>
              <span>{p.courier}</span><span className="cm-mono">{p.time}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
