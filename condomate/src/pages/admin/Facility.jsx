import React, { useEffect, useState } from "react";
import { useData } from "../../data/store";
import SectionTitle from "../../components/SectionTitle";

export default function AdminFacility() {
  const { data, updateFacility } = useData();
  const [drafts, setDrafts] = useState({});
  const [message, setMessage] = useState("");
  useEffect(() => setDrafts(Object.fromEntries(data.facilities.map((f) => [f.name, { open: f.open, capacity: f.capacity }]))), [data.facilities]);
  const change = (name, key, value) => setDrafts((current) => ({ ...current, [name]: { ...current[name], [key]: value } }));
  const save = async (name) => {
    const draft = drafts[name];
    const capacity = Number(draft.capacity);
    if (!draft.open.trim() || !Number.isInteger(capacity) || capacity < 1) { setMessage("กรุณาระบุเวลาเปิดและจำนวนคนอย่างน้อย 1 คน"); return; }
    const result = await updateFacility(name, { open: draft.open.trim(), capacity });
    setMessage(result.ok ? "บันทึกข้อมูลส่วนกลางเรียบร้อย" : `บันทึกไม่สำเร็จ: ${result.error}`);
  };
  return <div>
    <SectionTitle sub="กำหนดเวลาเปิดและจำนวนคนต่อพื้นที่">ส่วนกลาง</SectionTitle>
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.facilities.map((facility) => {
        const draft = drafts[facility.name] || facility;
        return <div key={facility.name} className="cm-card" style={{ padding: 14, display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr auto", gap: 12, alignItems: "end" }}>
          <div style={{ fontWeight: 700, fontSize: 14, paddingBottom: 9 }}>{facility.name}</div>
          <label style={{ fontSize: 11, color: "var(--ink-soft)" }}>เวลาเปิด<input className="cm-input" style={{ marginTop: 4 }} value={draft.open} onChange={(e) => change(facility.name, "open", e.target.value)} /></label>
          <label style={{ fontSize: 11, color: "var(--ink-soft)" }}>จำนวนคนสูงสุด<input className="cm-input" style={{ marginTop: 4 }} type="number" min="1" value={draft.capacity} onChange={(e) => change(facility.name, "capacity", e.target.value)} /></label>
          <button className="cm-btn" onClick={() => save(facility.name)}>บันทึก</button>
        </div>;
      })}
    </div>
    {message && <p style={{ fontSize: 12, color: message.includes("ไม่สำเร็จ") || message.startsWith("กรุณา") ? "var(--red)" : "var(--green)" }}>{message}</p>}
  </div>;
}
