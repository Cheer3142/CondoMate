import React from "react";
import { useData } from "../../data/store";
import SectionTitle from "../../components/SectionTitle";

export default function AdminFacility() {
  const { data, updateFacility } = useData();

  return (
    <div>
      <SectionTitle sub="กำหนดเวลาเปิดและจำนวนคนต่อพื้นที่">ส่วนกลาง</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.facilities.map((r) => (
          <div key={r.name} className="cm-card" style={{ padding: 14, display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 12, alignItems: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
            <div>
              <label style={{ fontSize: 11, color: "var(--ink-soft)" }}>เวลาเปิด</label>
              <input className="cm-input" value={r.open} onChange={(e) => updateFacility(r.name, { open: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--ink-soft)" }}>จำนวนคนสูงสุด</label>
              <input className="cm-input" type="number" value={r.capacity} onChange={(e) => updateFacility(r.name, { capacity: e.target.value })} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
