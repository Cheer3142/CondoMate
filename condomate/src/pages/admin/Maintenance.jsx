import React, { useState } from "react";
import { useData } from "../../data/store";
import { STATUS_META } from "../../data/seed";
import SectionTitle from "../../components/SectionTitle";
import StatusPill from "../../components/StatusPill";

export default function AdminMaintenance() {
  const { data, updateTicket } = useData();
  const [openId, setOpenId] = useState(data.tickets[0]?.id ?? null);
  const active = data.tickets.find((t) => t.id === openId) ?? data.tickets[0];

  return (
    <div>
      <SectionTitle sub="ดูและอัปเดตสถานะงานแจ้งซ่อมทั้งหมด">แจ้งซ่อม</SectionTitle>
      <div className="cm-admin-two-column">
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          {data.tickets.map((t) => (
            <button
              key={t.id}
              onClick={() => setOpenId(t.id)}
              className="cm-card"
              style={{ padding: 12, textAlign: "left", cursor: "pointer", border: `1px solid ${active?.id === t.id ? "var(--ink)" : "var(--line)"}` }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="cm-mono" style={{ fontSize: 12, color: "var(--ink-soft)" }}>#{t.id}</span>
                <StatusPill status={t.status} />
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 4 }}>{t.room} · {t.type}</div>
            </button>
          ))}
        </div>

        {active && (
          <div className="cm-card" style={{ flex: 1, padding: 16, height: "fit-content" }}>
            <div className="cm-mono" style={{ fontSize: 12, color: "var(--ink-soft)" }}>Ticket #{active.id}</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{active.room} · {active.type}</div>
            <div style={{ fontSize: 13, color: "var(--ink)", marginTop: 8 }}>{active.detail}</div>
            {active.imageUrl && <img src={`${import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || "http://localhost:4000"}${active.imageUrl}`} alt={`รูปประกอบ Ticket ${active.id}`} style={{ width: "100%", maxHeight: 260, objectFit: "cover", borderRadius: 10, marginTop: 12, border: "1px solid var(--line)" }} />}

            <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)", display: "block", marginTop: 16 }}>สถานะ</label>
            <select
              className="cm-input"
              style={{ marginTop: 6, marginBottom: 12 }}
              value={active.status}
              onChange={(e) => updateTicket(active.id, { status: e.target.value })}
            >
              {Object.entries(STATUS_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
            </select>

            <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)" }}>หมายเหตุถึงลูกบ้าน</label>
            <textarea
              className="cm-input"
              style={{ marginTop: 6, minHeight: 60, resize: "none" }}
              value={active.note}
              placeholder="เช่น ช่างจะเข้าตรวจ 14:00"
              onChange={(e) => updateTicket(active.id, { note: e.target.value })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
